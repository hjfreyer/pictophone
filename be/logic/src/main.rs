use {
    proto::messages as api,
    serde::{Deserialize, Serialize},
    std::collections::BTreeMap,
};

mod handler;
mod proto;

// macro_rules! oneof_dispatch {
//     ($mod:ident, $container_name:ident.$field:ident, $($case:ident => $handler:expr, )*) => {
//         paste::paste!{
//             match $container_name.$field {
//                 $(
//                     Some($mod :: $container_name :: [<$field:camel>] :: $case(request)) => {
//                         $handler(request).map(|response| response.into())
//                     }
//                 )*
//                 None => unimplemented!("no $case specified"),
//             }
//         }
//     };
// }

#[derive(Debug, Hash, Clone, Eq, PartialEq, Ord, PartialOrd, Serialize, Deserialize)]
struct GameId(String);

#[derive(Debug, Hash, Clone, Eq, PartialEq, Ord, PartialOrd, Serialize, Deserialize)]
struct PlayerId(String);

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct State {
    games: BTreeMap<GameId, Game>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
enum Game {
    Unstarted { players: Vec<PlayerId> },
    Started(StartedGame),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct StartedGame {
    players: Vec<PlayerId>,
    window_size: u32,
    length: u32,
    sentences: Vec<String>,
}

impl Default for Game {
    fn default() -> Self {
        Game::Unstarted { players: vec![] }
    }
}

impl Game {
    fn make_move(
        self,
        request: api::MakeMoveRequest,
    ) -> Result<Self, api::make_move_response::Error> {
        use std::convert::TryInto;
        let mut game = match self {
            Game::Unstarted { .. } => return Err(api::GameNotStartedError {}.into()),
            Game::Started(game) => game,
        };

        if game.length <= game.sentences.len().try_into().unwrap() {
            return Err(api::GameAlreadyOverError {}.into());
        }

        let active_player = game
            .players
            .get(game.sentences.len() % game.players.len())
            .unwrap();

        if active_player != &PlayerId(request.player_id.clone()) {
            return Err(api::NotYourTurnError {}.into());
        }

        game.sentences.push(request.sentence);

        Ok(Game::Started(game))
    }
}

struct Impl;

impl handler::Handler for Impl {
    type State = State;
    fn create_game(
        state: Option<State>,
        request: api::CreateGameRequest,
    ) -> Result<Option<State>, api::create_game_response::Error> {
        use api::create_game_response::Error;
        let mut state = state.unwrap_or_default();

        if state.games.contains_key(&GameId(request.game_id.clone())) {
            return Err(Error::GameAlreadyExistsError(Default::default()));
        }
        state
            .games
            .insert(GameId(request.game_id), Default::default());
        Ok(Some(state))
    }

    fn join_game(
        state: Option<State>,
        request: api::JoinGameRequest,
    ) -> Result<Option<State>, api::join_game_response::Error> {
        use api::join_game_response::Error;
        let mut state = state.unwrap_or_default();

        let game = state
            .games
            .get_mut(&GameId(request.game_id))
            .ok_or_else(|| Error::GameNotFoundError(Default::default()))?;
        let player_id = PlayerId(request.player_id);

        match game {
            Game::Started(_) => Err(Error::GameAlreadyStartedError(Default::default())),
            Game::Unstarted { players } if players.contains(&player_id) => Ok(None),
            Game::Unstarted { players } => {
                players.push(player_id);
                Ok(Some(state))
            }
        }
    }

    fn start_game(
        state: Option<State>,
        request: api::StartGameRequest,
    ) -> Result<Option<State>, api::start_game_response::Error> {
        use api::start_game_response::Error;
        let mut state = state.unwrap_or_default();
        let game = state
            .games
            .entry(GameId(request.game_id.clone()))
            .or_default();

        let players = match game {
            Game::Started { .. } => return Err(Error::GameAlreadyStartedError(Default::default())),
            Game::Unstarted { players } => players,
        };

        if !players.contains(&PlayerId(request.player_id.to_owned())) {
            return Err(api::PlayerNotInGameError {}.into());
        }

        let started_game = StartedGame {
            players: players.clone(),
            window_size: request.window_size,
            length: request.length,
            sentences: vec![],
        };

        *game = Game::Started(started_game);

        Ok(Some(state))
    }

    fn make_move(
        state: Option<State>,
        request: api::MakeMoveRequest,
    ) -> Result<Option<State>, api::make_move_response::Error> {
        let mut state = state.unwrap_or_default();
        let game = state
            .games
            .entry(GameId(request.game_id.clone()))
            .or_default();

        *game = game.clone().make_move(request)?;

        Ok(Some(state))
    }

    fn get_game(
        state: Option<State>,
        request: api::GetGameRequest,
    ) -> Result<api::Game, api::get_game_response::Error> {
        use api::get_game_response::Error;
        use std::convert::TryInto;
        let state = state.unwrap_or_default();
        let game = state
            .games
            .get(&GameId(request.game_id.clone()))
            .cloned()
            .unwrap_or_default();

        let game = match game {
            Game::Unstarted { players } => {
                return if players.contains(&PlayerId(request.player_id.clone())) {
                    Ok(api::Game {
                        player_ids: players.into_iter().map(|p| p.0).collect(),
                        state: Some(api::game::State::Unstarted(api::game::Unstarted {})),
                    })
                } else {
                    Err(api::PlayerNotInGameError {}.into())
                }
            }
            Game::Started(game) => game,
        };

        let player = PlayerId(request.player_id.clone());

        let active_player = game
            .players
            .get(game.sentences.len() % game.players.len())
            .unwrap();

        if !game.players.contains(&player) {
            return Err(Error::PlayerNotInGameError(Default::default()));
        }
        if active_player != &player {
            return Ok(api::Game {
                player_ids: game.players.into_iter().map(|p| p.0).collect(),
                state: Some(api::game::State::NotYourTurn(Default::default())),
            });
        }

        if game.length <= game.sentences.len().try_into().unwrap() {
            return Ok(api::Game {
                player_ids: game.players.into_iter().map(|p| p.0).collect(),
                state: Some(api::game::State::GameOver(api::game::GameOver {
                    sentences: game.sentences,
                })),
            });
        }

        let start_offset = game
            .sentences
            .len()
            .saturating_sub(game.window_size.try_into().unwrap());

        Ok(api::Game {
            player_ids: game.players.into_iter().map(|p| p.0).collect(),
            state: Some(api::game::State::YourTurn(api::game::YourTurn {
                context: game.sentences[start_offset..].to_vec(),
            })),
        })
    }
}


fn main() -> Result<(), anyhow::Error> {
    handler::main::<Impl>()
}

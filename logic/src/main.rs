use {
    proto::dolt as dpb,
    proto::v1_0 as api,
    proto::v1_1 as pt1,
    proto::versioned as vpb,
    serde::{Deserialize, Serialize},
    std::collections::BTreeMap,
};

mod proto;

#[derive(Debug, Hash, Clone, Eq, PartialEq, Ord, PartialOrd, Serialize, Deserialize)]
pub struct GameId(pub String);

#[derive(Debug, Hash, Clone, Eq, PartialEq, Ord, PartialOrd, Serialize, Deserialize)]
pub struct ShortCodeId(pub String);

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct State {
    games: BTreeMap<GameId, Game>,
}

impl State {
    fn sc_to_game_id(&self, sc_id: &ShortCodeId) -> Option<GameId> {
        for (gid, game) in self.games.iter() {
            if game.short_code == *sc_id {
                return Some(gid.to_owned());
            }
        }
        None
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Game {
    short_code: ShortCodeId,
}

fn create_game(
    state: Option<State>,
    request: &api::CreateGameRequest,
) -> Result<State, api::CreateGameResponse> {
    let game_id = GameId(request.game_id.to_owned());
    let short_code = ShortCodeId(request.short_code.to_owned());

    let mut state = state.unwrap_or_default();
    let game_state = state.games.get(&game_id);

    match game_state {
        None => {}
        _ => {
            return Err(api::GameAlreadyExistsError {
                game_id: request.game_id.to_owned(),
            }
            .into())
        }
    }

    if let Some(_) = state.sc_to_game_id(&short_code) {
        return Err(api::ShortCodeInUseError {
            short_code: request.short_code.to_owned(),
        }
        .into());
    }

    state.games.insert(
        game_id.to_owned(),
        Game {
            short_code: short_code.to_owned(),
        },
    );

    Ok(state)
}

fn delete_game(
    state: Option<State>,
    request: &api::DeleteGameRequest,
) -> Result<State, api::DeleteGameResponse> {
    let game_id = GameId(request.game_id.to_owned());

    let mut state = state.unwrap_or_default();

    if let None = state.games.remove(&game_id) {
        return Err(api::GameNotFoundError {
            game_id: request.game_id.to_owned(),
        }
        .into());
    }

    Ok(state)
}

fn evolve1_0(
    state: Option<State>,
    action: &api::ActionRequest,
) -> (Option<State>, api::ActionResponse) {
    match &action.method {
        Some(api::action_request::Method::CreateGameRequest(request)) => {
            let (state, response) = create_game(state, request)
                .map(|s| (Some(s), api::CreateGameResponse { error: None }))
                .unwrap_or_else(|r| (None, r));
            (state, response.into())
        }
        Some(api::action_request::Method::DeleteGameRequest(request)) => {
            let (state, response) = delete_game(state, request)
                .map(|s| (Some(s), api::DeleteGameResponse { error: None }))
                .unwrap_or_else(|r| (None, r));
            (state, response.into())
        }
        None => panic!("unset method"),
    }
}

fn evolve1_1(
    state: Option<State>,
    action: &pt1::ActionRequest,
) -> (Option<State>, pt1::ActionResponse) {
    match &action.method {
        Some(pt1::action_request::Method::CreateGameRequest(request)) => {
            let (state, response) = create_game(state, request)
                .map(|s| (Some(s), api::CreateGameResponse { error: None }))
                .unwrap_or_else(|r| (None, r));
            (state, response.into())
        }
        Some(pt1::action_request::Method::DeleteGameRequest(request)) => {
            let (state, response) = delete_game(state, request)
                .map(|s| (Some(s), api::DeleteGameResponse { error: None }))
                .unwrap_or_else(|r| (None, r));
            (state, response.into())
        }
        None => panic!("unset method"),
    }
}

fn evolve(
    state: Option<State>,
    action: &vpb::ActionRequest,
) -> (Option<State>, vpb::ActionResponse) {
    match &action.version {
        Some(vpb::action_request::Version::V1p0(action)) => {
            let (state, resp) = evolve1_0(state, action);
            (
                state,
                vpb::ActionResponse {
                    version: Some(vpb::action_response::Version::V1p0(resp)),
                },
            )
        }
        Some(vpb::action_request::Version::V1p1(action)) => {
            let (state, resp) = evolve1_1(state, action);
            (
                state,
                vpb::ActionResponse {
                    version: Some(vpb::action_response::Version::V1p1(resp)),
                },
            )
        }
        None => panic!("unset version"),
    }
}

fn get_game(state: Option<State>, request: &pt1::GetGameRequest) -> pt1::GetGameResponse {
    let state = match state {
        None => return pt1::GetGameResponse { game: None },
        Some(state) => state,
    };
    let game = match state.games.get(&GameId(request.game_id.to_owned())) {
        None => return pt1::GetGameResponse { game: None },
        Some(game) => game,
    };

    pt1::GetGameResponse {
        game: Some(pt1::Game {
            short_code: game.short_code.0.to_owned(),
        }),
    }
}

fn query(state: Option<State>, query: &vpb::QueryRequest) -> vpb::QueryResponse {
    match &query.version {
        Some(vpb::query_request::Version::V1p0(_)) => panic!("unset method"),

        Some(vpb::query_request::Version::V1p1(request)) => match &request.method {
            Some(pt1::query_request::Method::GetGameRequest(r)) => {
                let r = get_game(state, &r);
                pt1::QueryResponse::from(r).into()
            }
            None => panic!("unset method"),
        },
        None => panic!("unset version"),
    }
}

fn parse_state(data: &[u8]) -> Result<Option<State>, anyhow::Error> {
    if data.len() == 0 {
        Ok(None)
    } else {
        Ok(serde_json::from_slice(data)?)
    }
}

fn main() -> Result<(), anyhow::Error> {
    let mut buffer = vec![];
    use prost::Message;
    use std::io::{Read, Write};
    let _ = std::io::stdin().read_to_end(&mut buffer)?;

    let request = dpb::Request::decode(buffer.as_slice())?;

    match request.method {
        Some(dpb::request::Method::ActionRequest(request)) => {
            let state = parse_state(&request.state)?;
            let action = vpb::ActionRequest::decode(request.action.as_slice())?;
            let (state, action_response) = evolve(state, &action);

            let mut action_response_buf = vec![];
            let () = action_response.encode(&mut action_response_buf)?;

            let mut resp_buf = vec![];
            let () = dpb::Response {
                method: Some(dpb::response::Method::ActionResponse(dpb::ActionResponse {
                    state: state
                        .map(|s| serde_json::to_vec(&s))
                        .transpose()?
                        .unwrap_or_else(|| vec![]),
                    response: action_response_buf,
                })),
            }
            .encode(&mut resp_buf)?;

            let _ = std::io::stdout().lock().write(&resp_buf)?;
            Ok(())
        }
        Some(dpb::request::Method::QueryRequest(request)) => {
            let state = parse_state(&request.state)?;
            let query_msg = vpb::QueryRequest::decode(request.query.as_slice())?;
            let versioned_query_response = query(state, &query_msg);

            let mut versioned_query_response_bytes = vec![];
            let () = versioned_query_response.encode(&mut versioned_query_response_bytes)?;

            let mut resp_buf = vec![];

            let () = dpb::Response::from(dpb::QueryResponse {
                response: versioned_query_response_bytes,
            })
            .encode(&mut resp_buf)?;

            let _ = std::io::stdout().lock().write(&resp_buf)?;
            Ok(())
        }

        None => Err(anyhow::anyhow!("no request method specified")),
    }
}

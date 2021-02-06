import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import { ClientReadableStream } from 'grpc-web'
import * as ixa from 'ix/asynciterable'
import React from 'react'
import { useForm } from "react-hook-form"
import './App.css'
import * as pb2 from './gen/pictophone/V0_1ServiceClientPb'
import * as pb from './gen/pictophone/v0_1_pb'
import * as nav from './navigation'
import * as watch from './watch'
import { Watchable } from './watch'

export interface AppConfig {
    server: pb2.PictophoneClient
}

type State = {
    state: 'LIST_GAMES'
} | {
    state: 'SHOW_GAME'
    gameId: string
    playerId: string
    game: Watchable<FetchedGame>
} | {
    state: '404'
};

function foldState(backend: pb2.PictophoneClient, state: State, action: Action): State {
    switch (action.kind) {
        case 'navigate': {
            return stateFromLocation(backend, action.location)
        }
        case 'join': {
            const req = new pb.JoinGameRequest();
            req.setGameId(action.gameId);
            req.setPlayerId(action.playerId);
            backend.joinGame(req, null).then(
                resp => console.log("JOIN RESPONSE: ", resp.toObject()));
            return state;
        } case 'play': {
            if (state.state !== 'SHOW_GAME' || state.game.value === null || state.game.value.state !== 'ready' || !state.game.value.game.game || !state.game.value.game.game.started) {
                throw new Error("invalid state for starting game.")
            }
            const req = new pb.MakeMoveRequest();
            req.setGameId(state.gameId);
            req.setPlayerId(state.playerId);
            req.setEtag(state.game.value.game.game.started.etag);
            backend.makeMove(req, null).then(
                resp => console.log("PLAY RESPONSE: ", resp.toObject()));
            return state;
        }
        case 'start': {
            if (state.state !== 'SHOW_GAME') {
                throw new Error("invalid state for starting game.")
            }
            const req = new pb.StartGameRequest();
            req.setGameId(state.gameId);
            req.setPlayerId(state.playerId);
            backend.startGame(req, null).then(
                resp => console.log("START RESPONSE: ", resp.toObject()));
            return state;
        }
    }
}

function stateFromLocation(backend: pb2.PictophoneClient, location: nav.Location): State {
    switch (location.page) {
        case 'home':
            return {
                state: 'LIST_GAMES'
            }
        case 'game':
            return {
                state: 'SHOW_GAME',
                gameId: location.gameId,
                playerId: location.playerId,
                game: getGame(backend, location.gameId, location.playerId),
            }
        case 'unknown':
            return { state: '404' };
    }
}

type Flatten<T> = T extends Watchable<infer U> ? U : T extends Object ? { [K in keyof T]: Flatten<T[K]> } : T;

type FetchedGame = {
    state: 'loading'
} | {
    state: 'ready'
    game: pb.GetGameResponse.AsObject
} | {
    state: 'disconnected'
}

function getGame(client: pb2.PictophoneClient, gameId: string, playerId: string): Watchable<FetchedGame> {
    const req = new pb.GetGameRequest();
    req.setGameId(gameId);
    req.setPlayerId(playerId);
    const resp = client.getGame(req) as ClientReadableStream<pb.GetGameResponse>;

    const sink = new ixa.AsyncSink<FetchedGame>();
    resp.on("error", e => {
        console.error("during call to GetGame:", e)
        sink.write({ state: 'disconnected' });
        sink.end();
    });
    resp.on("data", d => {
        sink.write({ state: 'ready', game: d.toObject() });
    });
    resp.on('end', () => {
        sink.write({ state: 'disconnected' });
        sink.end();
    });
    return watch.fromIterable(sink, { state: 'loading' });
}

type Action = {
    kind: "navigate",
    location: nav.Location
} | {
    kind: "join",
    gameId: string,
    playerId: string,
} | {
    kind: "start",
} | {
    kind: 'play'
};

const Link: React.FC<React.PropsWithChildren<{ location: nav.Location, dispatch: (a: Action) => void }>> = ({ location, dispatch, children }) => {
    return <a href={nav.serializeLocation(location)} onClick={e => {
        e.preventDefault();
        window.history.pushState({}, '', nav.serializeLocation(location));
        dispatch({ kind: 'navigate', location });
    }
    }>
        {children}
    </a>;
};

export function App({ server }: AppConfig): Watchable<JSX.Element> {
    const initial = stateFromLocation(server, nav.parseLocation(window.location.pathname));

    const uiFromState = (state: Flatten<State>): [JSX.Element, Promise<Action>] => {
        let popState: Promise<Action> = new Promise((resolve) => {
            window.addEventListener('popstate', resolve, { once: true });
        }).then((): Action => ({ kind: 'navigate', location: nav.parseLocation(document.location.pathname) }));
        const sink = new ixa.AsyncSink<Action>();
        const nextAction = ixa.first(sink).then(a => a!);

        return [<View s={state} dispatch={a => sink.write(a)} />,
        Promise.race([nextAction, popState])];
    };

    // const unfold = (state: Flatten<State>, )

    const fromState2 = (state: State): Watchable<JSX.Element> => {
        let flat = ((): Flatten<State> => {
            switch (state.state) {
                case '404':
                case 'LIST_GAMES':
                    return state;
                case 'SHOW_GAME':
                    return { ...state, game: state.game.value };
            }
        })();
        let flat2 = ((): Promise<State> => {
            switch (state.state) {
                case '404':
                case 'LIST_GAMES':
                    return Promise.race([]);
                case 'SHOW_GAME':
                    return state.game.next.then(game => ({ ...state, game }));
            }
        })();

        let [ui, nextAction] = uiFromState(flat);
        type NextState = { source: 'state', state: State } | { source: 'action', action: Action };
        const nextState: Promise<NextState> = Promise.race([
            flat2.then((state: State): NextState => ({ source: 'state', state })),
            nextAction.then((action: Action): NextState => ({ source: 'action', action })),
        ]);
        return {
            value: ui,
            next: nextState.then(ns => {
                if (ns.source === 'state') {
                    return fromState2(ns.state);
                } else {
                    return fromState2(foldState(server, state, ns.action));
                }
            })
        }
    };
    return fromState2(initial);
}

interface ViewProps {
    s: Flatten<State>
    dispatch: (action: Action) => void
}

const View: React.FC<ViewProps> = ({ s, dispatch }) => {
    switch (s.state) {
        case 'LIST_GAMES': return <ListGames dispatch={dispatch}></ListGames>;
        case 'SHOW_GAME': return <Game gameId={s.gameId} playerId={s.playerId} game={s.game} dispatch={dispatch}></Game>;
        case '404': return <div>404</div>;
    }
};

interface ListGamesProps {
    dispatch: (a: Action) => void
}

const ListGames: React.FC<ListGamesProps> = ({ dispatch }) => {
    type Inputs = {
        gameId: string,
        playerId: string,
    };
    const { register, handleSubmit, watch, errors } = useForm<Inputs>();
    const { register: joinRegister, handleSubmit: joinHandleSubmit } = useForm<Inputs>();
    const onSubmit = (i: Inputs) => {
        const location: nav.Location = { page: 'game', ...i };
        window.history.pushState({}, '', nav.serializeLocation(location));
        dispatch({ kind: "navigate", location });
    }
    const onJoin = (i: Inputs) => {
        dispatch({ kind: "join", ...i });
    };
    return <React.Fragment>
        <h1>Go to a game</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
            <label>Game Id: <input name="gameId" required ref={register} /></label>
            <label>Player Id: <input name="playerId" required ref={register} /></label>
            <button>Submit</button>
        </form>

        <h1>Join a game</h1>
        <form onSubmit={joinHandleSubmit(onJoin)}>
            <label>Game Id: <input name="gameId" required ref={joinRegister} /></label>
            <label>Player Id: <input name="playerId" required ref={joinRegister} /></label>
            <button>Submit</button>
        </form>

    </React.Fragment>
};

interface GameProps {
    gameId: string
    playerId: string
    game: FetchedGame
    dispatch: (a: Action) => void
}

const Game: React.FC<GameProps> = ({ gameId, playerId, game, dispatch }) => {
    switch (game.state) {
        case 'disconnected': {
            return <React.Fragment>
                <h1>Game {gameId}</h1>
                <pre>Disconnected. Try refreshing.</pre>
            </React.Fragment>
        }

        case 'loading': {
            return <React.Fragment>
                <h1>Game {gameId}</h1>
                <pre>Loading...</pre>
            </React.Fragment>
        }

        case 'ready': {
            if (!game.game.game) {
                return <React.Fragment>
                    <h1>Game {gameId}</h1>
                    <pre>Error: {JSON.stringify(game)}</pre>
                </React.Fragment>
            }

            let g = game.game.game;
            if (g.unstarted) {
                return <React.Fragment>
                    <h1>Game {gameId}</h1>
                    <pre>
                        Players: {JSON.stringify(g.playerIdsList)}
                    </pre>
                    <button onClick={() => dispatch({ kind: 'start' })}>Start Game</button>
                </React.Fragment>

            } else if (g.started) {
                return <StartedGame gameId={gameId} game={g.started} dispatch={dispatch} />
            } else {
                throw new Error("unreachable")
            }
        }
    }
};

interface StartedGameProps {
    gameId: string
    // playerId: string
    game: pb.Game.Started.AsObject
    dispatch: (a: Action) => void
}

const StartedGame : React.FC<StartedGameProps> = ({gameId, game, dispatch}): JSX.Element=> {
    const hand = [...game.handList];
    hand.reverse();

    return <React.Fragment>
        <div className="top">
            <div className="round">{game.roundNum}</div>
            <div className="mistakes">
                {[...Array(game.numMistakes)].map((_, i) => <span key={i} className="fail"/>)}
            </div>
        </div>
        <div className="last-play">{game.numbersPlayedList[game.numbersPlayedList.length-1]}</div>
        <div className="next-play" onClick={() => dispatch({ kind: 'play' })}>{hand[0]}</div>
        <div className="hand">
            {hand.slice(1).map((card, idx) => <span className="card" key={idx}>{card}</span>)}
        </div>
    </React.Fragment>;
}

// // const app = firebase.initializeApp(Config().firebase)
// const auth = app.auth()
// const storage = app.storage()

// const uiConfig = {
//     // Popup signin flow rather than redirect flow.
//     signInFlow: 'popup',
//     signInOptions: [
//         firebase.auth.GoogleAuthProvider.PROVIDER_ID,
//         firebase.auth.EmailAuthProvider.PROVIDER_ID,
//     ],
//     callbacks: {
//         // Avoid redirects after sign-in.
//         signInSuccessWithAuthResult: () => false
//     }
// }

// const SignInPage: React.FC = () => {
//     return <React.Fragment>
//         <h1>Hey it's Pictophone!</h1>
//         <p>Care to sign in?</p>
//         <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
//     </React.Fragment>
// }

// type GamePageProps = {
//     playerId: string
//     dispatch: base.Dispatch
// }

// async function getPlayerGame(playerId: string, gameId: string): Promise<model.PlayerGame> {
//     const fetched = await fetch(`${Config().backendAddr}/1.1/players/${playerId}/games/${gameId}`, {
//         method: 'get',
//         mode: 'cors',
//         headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',       // receive json
//         },
//     })
//     return validateModel('PlayerGame')(await fetched.json())
// }

// export function usePlayerGame(playerId: string, gameId: string): db.Value<model.PlayerGame> {
//     const token = db.useConsistencyToken(`games/${gameId}`)

//     const [playerGame, setPlayerGame] = useState<db.Value<model.PlayerGame>>({ state: 'loading' });

//     useEffect(() => {
//         console.log("LOAD PG")
//         getPlayerGame(playerId, gameId).then(gl => setPlayerGame({
//             state: 'ready',
//             value: gl
//         }))
//     }, [playerId, token])

//     return playerGame
// }

// const GamePage: React.FC<GamePageProps> = ({ playerId, dispatch }) => {
//     const { gameId } = useParams()
//     const game = usePlayerGame(playerId, gameId)

//     const startGame = () => dispatch.action({
//         kind: "start_game",
//         playerId: playerId!,
//         gameId: gameId!
//     })

//     const submitWord = (word: string) => dispatch.action({
//         kind: "make_move",
//         playerId: playerId!,
//         gameId: gameId!,
//         submission: { kind: "word", word }
//     })

//     const submitDrawing = async (drawing: Drawing) => {
//         const resp = await dispatch.upload(drawing)
//         await dispatch.action({
//             kind: "make_move",
//             playerId: playerId!,
//             gameId: gameId!,
//             submission: { kind: "drawing", drawingId: resp.id }
//         })
//     }

//     switch (game.state) {
//         case 'loading':
//             return <span>Loading...</span>
//         case 'not_found':
//             return <span>Not found :(</span>
//         case 'ready':
//             return (<GameView
//                 playerGame={game.value}
//                 startGame={startGame}
//                 submitWord={submitWord}
//                 submitDrawing={submitDrawing}
//             />)
//     }
// }


export default App

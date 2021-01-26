import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import React, { useEffect, useState } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { BrowserRouter as Router, Redirect, Route, Switch, useLocation, useParams } from "react-router-dom"
import './App.css'
import * as base from './base'
import Config from './config'
import GameView from './GameView'
import Home from './Home'
// import { Action } from './model/1.1'
import * as model from './model/1.1'
import * as db from './db';
import { validate as validateModel } from './model/1.1.validator'
import { Drawing, Upload, UploadResponse } from './model/rpc'
import { validate as validateRpc } from './model/rpc.validator'
import { app } from './context';
import { useValue } from './db';
import * as tables from './tables';
import { sha256 } from 'js-sha256';
import { Channel } from 'queueable';

import * as pb from './gen/pictophone/v0_1_pb';
import * as pb2 from './gen/pictophone/V0_1ServiceClientPb';

import { Watchable, fromIterable } from './watch'
import * as watch from './watch'
import * as ixa from 'ix/asynciterable';
import * as ixaop from 'ix/asynciterable/operators';
import { pipeWith } from 'pipe-ts';
import { useForm } from "react-hook-form";
import { ClientReadableStream } from 'grpc-web'
import * as nav from './navigation';


export interface AppConfig {
    server: pb2.PictophoneClient
}

// type AuthInfo = { ready: false } | { ready: true, user: firebase.User | null }

// interface Intent {
//     // authInfo: AuthInfo
//     location: nav.Location
// }


type State = {
    //     state: 'LOADING'
    // } | {
    //     state: 'SIGNED_OUT'
    // } | {
    state: 'LIST_GAMES'
} | {
    state: 'SHOW_GAME'
    gameId: string
    playerId: string
    game: Watchable<pb.GetGameResponse.AsObject | null>
} | {
    state: '404'
};

function foldState(backend: pb2.PictophoneClient, state: State, action: Action): State {
    // if (!intent.authInfo.ready) {
    //     return { state: 'LOADING' }
    // }
    // if (intent.authInfo.user === null) {
    //     return { state: 'SIGNED_OUT' }
    // }

    switch (action.kind) {
        case 'navigate': {
            window.history.pushState({}, '', nav.serializeLocation(action.location))
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
            if (state.state !== 'SHOW_GAME' || state.game.value === null || !state.game.value.game || !state.game.value.game.started) {
                throw new Error("invalid state for starting game.")
            }
            const req = new pb.MakeMoveRequest();
            req.setGameId(state.gameId);
            req.setPlayerId(state.playerId);
            req.setEtag(state.game.value.game.started.etag);
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



// function flatten(gs: State): Watchable<ViewData> {
//     switch (gs.kind) {
//         case 'LIST_GAMES':
//             return watch.fromConstant({ state: 'LIST_GAMES' });
//         case 'SHOW_GAME':
//             return pipeWith(gs.game,
//                 watch.map(game => ({ state: 'SHOW_GAME', gameId: gs.gameId, playerId: gs.playerId, game })));
//     }
// }

// function render(data: ViewData): [JSX.Element, AsyncIterable<Action>] {
//     let sink = new ixa.AsyncSink<Action>();
//     return [<View s={data} dispatch={a=>sink.write(a)} />, sink];

// }

// interface Globals {
//     authInfo: Watchable<AuthInfo>
//     location: Watchable<nav.Location>
// }


type Flatten<T> = T extends Watchable<infer U> ? U : T extends Object ? { [K in keyof T]: Flatten<T[K]> } : T;
type Flattened<T> = Watchable<Flatten<T>>;

// interface Globals {
//     authInfo: AuthInfo
//     location: nav.Location
// }

// function flattenGlobals(input: Watchable<Globals>): Watchable<Flatten<Globals>> {
//     const f = (w: Globals): Watchable<Flatten<Globals>> => ({
//         value: {
//             authInfo: w.authInfo.value,
//             location: w.location.value,
//         },
//         next: Promise.race([w.authInfo.next.then(authInfo => f({
//             authInfo,
//             location: w.location
//         })),
//         w.location.next.then(location => f({
//             authInfo: w.authInfo,
//             location,
//         }))])
//     });

//     return pipeWith(input, watch.switchMap(input => f(input)));
// }

function getGame(client: pb2.PictophoneClient, gameId: string, playerId: string): Watchable<pb.GetGameResponse.AsObject | null> {
    const req = new pb.GetGameRequest();
    req.setGameId(gameId);
    req.setPlayerId(playerId);
    const resp = client.getGame(req) as ClientReadableStream<pb.GetGameResponse>;

    const sink = new ixa.AsyncSink<pb.GetGameResponse.AsObject>();
    resp.on("error", e => console.log("TODO: handle this", e));
    resp.on("data", d => { console.log("GAME: ", d.toObject()); sink.write(d.toObject()) });
    return watch.fromIterable(sink, null);
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
    return <a href={nav.serializeLocation(location)} onClick={e => { e.preventDefault(); dispatch({ kind: 'navigate', location }); }}>
        {children}
    </a>;
};

export function App({ server }: AppConfig): Watchable<JSX.Element> {
    const initial = stateFromLocation(server, nav.parseLocation(window.location.pathname));


    // window.addEventListener('popstate', e=>{
    //     console.log('POP', e);
    //     e.preventDefault();
    //     return false;
    // })

    const uiFromState2 = (state: Flatten<State>, dispatch: (a: Action) => void): JSX.Element => {
        switch (state.state) {
            case '404':
                return <View s={state} dispatch={a => { }} />;

            case 'LIST_GAMES':
                return <View s={state} dispatch={dispatch} />;

            case 'SHOW_GAME':
                return <View s={state} dispatch={dispatch} />;
        }
    };

    const uiFromState = (state: Flatten<State>): [JSX.Element, Promise<Action>] => {
        let popState: Promise<Action> = new Promise((resolve) => {
            window.addEventListener('popstate', resolve, { once: true });
        }).then((): Action => ({ kind: 'navigate', location: nav.parseLocation(document.location.pathname) }));
        const sink = new ixa.AsyncSink<Action>();
        const nextAction = ixa.first(sink).then(a => a!);

        return [uiFromState2(state, a=>sink.write(a)), Promise.race([nextAction, popState])];

        switch (state.state) {
            case '404': {
                return [<View s={state} dispatch={a => { }} />, popState];
            }
            case 'LIST_GAMES': {
                const sink = new ixa.AsyncSink<Action>();
                const nextAction = ixa.first(sink).then(a => a!);
                return [
                    <View s={state} dispatch={a => sink.write(a)} />,
                    Promise.race([nextAction, popState])
                ];
            }
            case 'SHOW_GAME': {
                const sink = new ixa.AsyncSink<Action>();
                const nextAction = ixa.first(sink).then(a => a!);

                const ui = <View s={state} dispatch={a => sink.write(a)} />;

                return [ui, Promise.race([nextAction, popState])]
            }
        }
    };

    const fromState2 = (state: Watchable<State>): Watchable<JSX.Element> => {
        let flat = ((): Flatten<State> => {
            switch (state.value.state) {
                case '404':
                case 'LIST_GAMES':
                    return state.value;
                case 'SHOW_GAME':
                    return { ...state.value, game: state.value.game.value };
            }
        })();
        let flat2 = ((): Watchable<State> => {
            function flatten(state: Watchable<State>): Watchable<State> {
                switch (state.value.state) {
                    case '404':
                    case 'LIST_GAMES':
                        return state;
                    case 'SHOW_GAME':
                        return {
                            value: state.value,
                            next: Promise.race([
                                state.next,
                                state.value.game.next.then(game => flatten(watch.fromConstant({ ...state.value, game }))),
                            ])
                        };
                }
            }
            return flatten(state)
        })();

        let [ui, nextAction] = uiFromState(flat)
        return {
            value: ui,
            next: Promise.race([
                flat2.next.then(state => fromState2(state)),
                nextAction.then(action => fromState2(watch.fromConstant(foldState(server, state.value, action))))
            ])
        }



        // const wui :Watchable<[State, ]= pipeWith(flat, watch.map())
    };
    return fromState2(watch.fromConstant(initial));

    // const fromState = (state: State): Watchable<JSX.Element> => {
    //     let popStateNext: Promise<Watchable<JSX.Element>> = new Promise((resolve) => {
    //         window.addEventListener('popstate', resolve, { once: true });
    //     }).then((): Action => ({ kind: 'navigate', location: nav.parseLocation(document.location.pathname) })).then(action => fromState(foldState(server, state, action)));

    //     switch (state.state) {
    //         case '404': {
    //             return {
    //                 value: <View s={state} dispatch={a => { }} />,
    //                 next: popStateNext,
    //             }
    //         }
    //         case 'LIST_GAMES': {
    //             let popStatePromise: Promise<Action> = new Promise((resolve) => {
    //                 window.addEventListener('popstate', resolve, { once: true });
    //             }).then(() => ({ kind: 'navigate', location: nav.parseLocation(document.location.pathname) }));
    //             const sink = new ixa.AsyncSink<Action>();
    //             const nextAction = ixa.first(sink).then(a => a!);
    //             return {
    //                 value: <View s={state} dispatch={a => sink.write(a)} />,
    //                 next: Promise.race([
    //                     nextAction.then(action => {
    //                         const newState = foldState(server, state, action);
    //                         return fromState(newState)
    //                     }),
    //                     popStateNext,
    //                 ])

    //             }
    //         }
    //         case 'SHOW_GAME': {
    //             const popstatesNavs = ixa.fromEvent<PopStateEvent>(window, 'popstate').pipe(
    //                 ixaop.map((): Action => ({
    //                     kind: 'navigate',
    //                     location: nav.parseLocation(document.location.pathname),
    //                 })),
    //                 ixaop.tap(v => console.log('NAV', v))
    //             )[Symbol.asyncIterator]();
    //             const sink = new ixa.AsyncSink<Action>();
    //             const nextAction = ixa.first(sink).then(a => a!);
    //             const flattenedState: Flatten<State> = { ...state, game: state.game.value };

    //             const ui = <View s={flattenedState} dispatch={a => sink.write(a)} />;

    //             return {
    //                 value: ui,
    //                 next: Promise.race([
    //                     nextAction.then(action => {
    //                         console.log("ACTION")
    //                         const newState = foldState(server, state, action);
    //                         return fromState(newState)
    //                     }),
    //                     popStateNext,
    //                     state.game.next.then(nextGame => fromState({
    //                         ...state,
    //                         game: nextGame,
    //                     }))
    //                 ])

    //             }
    //         }
    //     }
    // };
    // const state = initial;

    // const flattenedState: Watchable<Flatten<State>> = state.state === 'SHOW_GAME'
    //     ? pipeWith(state.game, watch.map(game => ({ ...state, game })))
    //     : watch.fromConstant(state);

    // const elemAndActions = pipeWith(flattenedState,
    //     watch.map((state): [Flatten<State>, JSX.Element, AsyncIterable<Action>] => {
    //         let sink = new ixa.AsyncSink<Action>();
    //         return [state, <View s={state} dispatch={a => sink.write(a)} />, sink];
    //     }));


    //     })()
    // };


    // const navigation = new nav.Nav();

    // const authInfoPromise: Promise<AuthInfo> = new Promise((resolve, reject) => auth.onAuthStateChanged((user: firebase.User | null) => resolve({ ready: true, user })));;
    // const globals: Watchable<Globals> = watch.fromConstant({
    //     authInfo: watch.fromPromise(authInfoPromise, { ready: false }),
    //     location: watch.fromConstant(nav.parseLocation(window.location.pathname)),
    // });



    // const channel = new Channel<nav.Location>();
    // const states: Watchable<ViewData> = pipeWith(globals, flattenGlobals, watch.switchMap(globals => {
    //     if (!globals.authInfo.ready) {
    //         return watch.fromConstant({ state: 'LOADING' })
    //     }
    //     if (globals.authInfo.user === null) {
    //         return watch.fromConstant({ state: 'SIGNED_OUT' })
    //     }


    //     return flatten(integrate(server, globals.location));
    // }));

    // const integrate = (a: Action): void => {
    //     switch (a.kind) {
    //         case 'navigate':
    //             navigation.push(a.location);
    //             break;
    //         case 'join': {
    //             const req = new pb.JoinGameRequest();
    //             req.setGameId(a.gameId);
    //             req.setPlayerId(a.playerId);
    //             server.joinGame(req, null).then(
    //                 resp =>
    //                     console.log("JOIN RESPONSE: ", resp.toObject()));
    //             break
    //         }
    //         case 'start': {
    //             const req = new pb.StartGameRequest();
    //             req.setGameId(a.gameId);
    //             req.setPlayerId(a.playerId);
    //             server.startGame(req, null).then(
    //                 resp =>
    //                     console.log("START RESPONSE: ", resp.toObject()));
    //             break
    //         }
    //         case 'play': {
    //             const req = new pb.MakeMoveRequest();
    //             req.setGameId(a.gameId);
    //             req.setPlayerId(a.playerId);
    //             req.setEtag(a.etag)
    //             server.makeMove(req, null).then(
    //                 resp =>
    //                     console.log("PLAY RESPONSE: ", resp.toObject()));
    //             break
    //         }
    //     }
    // };

    // const elemAndActions = pipeWith(states, watch.map(data => [data, render(data)]));

    // const f = (eAndA: Watchable<[ViewData, [JSX.Element, AsyncIterable<Action>]]>): Watchable<JSX.Element> => ({
    //     value: eAndA.value[1][0],
    //     next: Promise.race([
    //         eAndA.next.then(f),
    //         ixa.first(eAndA.value[1][1]).then(action=> ),
    //     ])
    // });

    // // return {
    // //     value: elem_and_actions.value[0],
    // //     next: Promise.race(elem_and_actions.next.then()
    // // }
    // return f(elemAndActions)
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
    const onSubmit = (i: Inputs) =>
        dispatch({ kind: "navigate", location: { page: 'game', ...i } });
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
    game: pb.GetGameResponse.AsObject | null
    dispatch: (a: Action) => void
}

const Game: React.FC<GameProps> = ({ gameId, playerId, game, dispatch }) => {
    if (!game) {
        return <React.Fragment>
            <Link location={{ page: 'home' }} dispatch={dispatch}>Get back</Link>
            <h1>Game {gameId}</h1>
            <pre>Loading</pre>
        </React.Fragment>

    }

    if (!game.game) {
        return <React.Fragment>
            <Link location={{ page: 'home' }} dispatch={dispatch}>Get back</Link>
            <h1>Game {gameId}</h1>
            <pre>{JSON.stringify(game)}</pre>
        </React.Fragment>
    }

    let g = game.game;
    if (g.unstarted) {
        return <React.Fragment>
            <Link location={{ page: 'home' }} dispatch={dispatch}>Get back</Link>
            <h1>Game {gameId}</h1>
            <pre>
                Players: {JSON.stringify(g.playerIdsList)}
            </pre>
            <button onClick={() => dispatch({ kind: 'start' })}>Start Game</button>
        </React.Fragment>

    } else if (g.started) {
        let etag = g.started.etag;
        return <React.Fragment>
            <Link location={{ page: 'home' }} dispatch={dispatch}>Get back</Link>
            <h1>Game {gameId}</h1>
            <pre>Players: {JSON.stringify(g.playerIdsList)}</pre>
            <pre>Mistakes: {g.started.numMistakes}</pre>
            <pre>Round: {g.started.roundNum}</pre>
            <pre>Already played: {JSON.stringify(g.started.numbersPlayedList)}</pre>
            <pre>Your hand: {JSON.stringify(g.started.handList)}</pre>
            <button onClick={() => dispatch({ kind: 'play' })}>Play</button>
            <pre>
                All: {JSON.stringify(g)}
            </pre>

        </React.Fragment>
    } else {
        return <React.Fragment>
            <Link location={{ page: 'home' }} dispatch={dispatch}>Get back</Link>
            <h1>Game {gameId}</h1>
            <pre>Error: {JSON.stringify(game)}</pre>
        </React.Fragment>
    }
};

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

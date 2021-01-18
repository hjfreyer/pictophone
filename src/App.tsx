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

export type UserAction = {
    kind: 'increment'
};


interface WatchGlobals {
    authInfo: Watchable<AuthInfo>
    location: Watchable<nav.Location>
}

interface Globals {
    authInfo: AuthInfo
    location: nav.Location
}

function flattenGlobals(input: Watchable<WatchGlobals>): Watchable<Globals> {
    const f = (w: WatchGlobals): Watchable<Globals> => ({
        value: {
            authInfo: w.authInfo.value,
            location: w.location.value,
        },
        next: Promise.race([w.authInfo.next.then(authInfo => f({
            authInfo,
            location: w.location
        })),
        w.location.next.then(location => f({
            authInfo: w.authInfo,
            location,
        }))])
    });

    return pipeWith(input, watch.switchMap(input => f(input)));

    // pipeWith(input.authInfo,
    // watch.map(authInfo => ({ authInfo })))));
}

function getGame(client: pb2.PictophoneClient, gameId: string, playerId: string): Watchable<pb.GetGameResponse.AsObject | null> {
    const req = new pb.GetGameRequest();
    req.setGameId(gameId);
    req.setPlayerId(playerId);
    const resp = client.getGame(req) as ClientReadableStream<pb.GetGameResponse>;

    const sink = new ixa.AsyncSink<pb.GetGameResponse.AsObject>();
    resp.on("error", e => console.log("TODO: handle this", e));
    resp.on("data", d => {console.log("GAME: ", d.toObject()); sink.write(d.toObject())}
    );
    return watch.fromIterable(sink, null);
}


async function doAction(client: pb2.PictophoneClient): Promise<void> {
    const req = new pb.JoinGameRequest();
    req.setGameId("asdf");
    const resp = await client.joinGame(req, null);
    console.log("RESPONSE: ", resp.toObject());

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
    gameId: string,
    playerId: string,
} | {
    kind: 'play'
    gameId: string,
    playerId: string,
    etag: number,
};


// export function App({}: AppConfig): Watchable<JSX.Element> {
//     const channel = new Channel();
//     return {
//         wait:() => Promise.race([]),
//         value:() => <div>Check It</div>
//     };
// }
export function App({ server }: AppConfig): Watchable<JSX.Element> {
    // doAction(server).then(()=> console.log("DONE"));

    const navigation = new nav.Nav();

    const authInfoPromise: Promise<AuthInfo> = new Promise((resolve, reject) => auth.onAuthStateChanged((user: firebase.User | null) => resolve({ ready: true, user })));;
    const globals: Watchable<WatchGlobals> = watch.fromConstant({
        authInfo: watch.fromPromise(authInfoPromise, { ready: false }),
        location: navigation.watch(),
    });

    const channel = new Channel<nav.Location>();
    const states: Watchable<ViewData> = pipeWith(globals, flattenGlobals, watch.switchMap(globals => {
        if (!globals.authInfo.ready) {
            return watch.fromConstant({ state: 'LOADING' })
        }
        if (globals.authInfo.user === null) {
            return watch.fromConstant({ state: 'SIGNED_OUT' })
        }

        return flatten(integrate(server)(globals.location))
        // pipeWith(globals, watch.mapintegrate(server))
        // const user = globals.authInfo.user;
        // const initState: nav.Location = { page: 'home' };
        // const states = fromIterable(ixa.from(channel).pipe(
        //     ixaop.scan({ callback: integrate(server), seed: initState }),
        // ), initState);
        // return pipeWith(states, watch.switchMap(s => flatten(user, globals.location)));
    })
    );

    const dispatch = (a: Action):void => {
        switch (a.kind) {
            case 'navigate':
                navigation.push(a.location);
                break;
                case 'join':{
                    const req = new pb.JoinGameRequest();
                    req.setGameId(a.gameId);
                    req.setPlayerId(a.playerId);
                    server.joinGame(req, null).then(
                        resp=>
                    console.log("JOIN RESPONSE: ", resp.toObject()));
                    break
                }
                case 'start':{
                    const req = new pb.StartGameRequest();
                    req.setGameId(a.gameId);
                    req.setPlayerId(a.playerId);
                    server.startGame(req, null).then(
                        resp=>
                    console.log("START RESPONSE: ", resp.toObject()));
                    break
                }
                case 'play':{
                    const req = new pb.MakeMoveRequest();
                    req.setGameId(a.gameId);
                    req.setPlayerId(a.playerId);
                    req.setEtag(a.etag)
                    server.makeMove(req, null).then(
                        resp=>
                    console.log("PLAY RESPONSE: ", resp.toObject()));
                    break
                }
        }
    };

    return pipeWith(states, watch.map(s => <View s={s} dispatch={dispatch} />));



    // return switchMap(states, );
    // yield ;
    // return {
    //     wait:() => Promise.race([]),
    //     value:() => 

    // };
}

// type Intent = {
//     kind: 'LIST_GAMES'
// } | {
//     kind: 'SHOW_GAME'
//     gameId: string,

// };

type State = {
    kind: 'LIST_GAMES'
} | {
    kind: 'SHOW_GAME'
    gameId: string,
    playerId: string,
    game: Watchable<pb.GetGameResponse.AsObject | null>,
};

// function integrate(server: pb2.PictophoneClient) {
//     return function impl(state: State, action: Intent): State {
//         switch (action.kind) {
//             case 'LIST_GAMES':
//                 return {
//                     kind: 'LIST_GAMES'
//                 }
//             case 'SHOW_GAME':
//                 return {
//                     kind: 'SHOW_GAME',
//                     gameId: action.gameId,
//                     gameText: pipeWith(getGame(server, action.gameId),
//                         watch.map(maybeResp => JSON.stringify(maybeResp))),
//                 }
//         }
//     }

// }


function integrate(server: pb2.PictophoneClient) {
    return function impl(location: nav.Location): State {
        switch (location.page) {
            case 'home':
                return {
                    kind: 'LIST_GAMES'
                }
            case 'game':
                return {
                    kind: 'SHOW_GAME',
                    gameId: location.gameId,
                    playerId: location.playerId,
                    game: getGame(server, location.gameId, location.playerId),
                }
                case 'unknown':
                    throw new Error("blah")
        }
    }

}

type ViewData = {
    state: 'LOADING'
} | {
    state: 'SIGNED_OUT'
} | {
    state: 'LIST_GAMES'
} | {
    state: 'SHOW_GAME'
    gameId: string
    playerId: string
    game: pb.GetGameResponse.AsObject | null
};

function flatten(gs: State): Watchable<ViewData> {
    switch (gs.kind) {
        case 'LIST_GAMES':
            return watch.fromConstant({ state: 'LIST_GAMES' });
        case 'SHOW_GAME':
            return pipeWith(gs.game,
                watch.map(game => ({ state: 'SHOW_GAME', gameId: gs.gameId, playerId: gs.playerId, game })));
    }
}

interface CommonProps {
    dispatch: (action: Action) => void
}

interface ViewProps {
    s: ViewData
    // navigate: (location: nav.Location) => void
    dispatch: (action: Action) => void
}

const View: React.FC<ViewProps> = ({ s, dispatch }) => {
    switch (s.state) {
        case 'LOADING': return <div>Loading...</div>;
        case 'SIGNED_OUT': return <SignInPage />;
        case 'LIST_GAMES': return <ListGames dispatch={dispatch}></ListGames>;
        case 'SHOW_GAME': return <Game gameId={s.gameId} playerId={s.playerId} game={s.game} dispatch={dispatch}></Game>;
    }
};


const ListGames: React.FC<CommonProps> = ({ dispatch }) => {
    type Inputs = {
        gameId: string,
        playerId: string,
    };
    const { register, handleSubmit, watch, errors } = useForm<Inputs>();
    const { register: joinRegister, handleSubmit: joinHandleSubmit } = useForm<Inputs>();
    const onSubmit = (i: Inputs) =>
        dispatch({kind: "navigate", location: { page: 'game', ...i }});
    const onJoin = (i: Inputs) => {
        dispatch({kind: "join", ...i });
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

interface GameProps extends CommonProps {
    gameId: string
    playerId: string
    game: pb.GetGameResponse.AsObject | null
}

const Game: React.FC<GameProps> = ({ gameId, playerId, game, dispatch }) => {
    // type Inputs = {
    //     gameId: string
    // };
    // const { register, handleSubmit, watch, errors } = useForm<Inputs>();
    // const onSubmit = ({gameId}: Inputs) => 
    //     dispatch({kind: 'SHOW_GAME', gameId});
    if (!game) {
        return <React.Fragment>
        <h1>Game {gameId}</h1>
        <pre>Loading</pre>
        </React.Fragment>

    }

    if (!game.game) {
        return <React.Fragment>
        <h1>Game {gameId}</h1>
        <pre>{JSON.stringify(game)}</pre>
        </React.Fragment>
    }

    let g = game.game;
    if (g.unstarted) {
        return <React.Fragment>
            <h1>Game {gameId}</h1>
            <pre>
                Players: {JSON.stringify(g.playerIdsList)}
            </pre>
            <button onClick={() => dispatch({kind: 'start', gameId, playerId})}>Start Game</button>
        </React.Fragment>
    } else if (g.started) {
        let etag= g.started.etag;
        return <React.Fragment>
        <h1>Game {gameId}</h1>
        <pre>Players: {JSON.stringify(g.playerIdsList)}</pre>
            <pre>Mistakes: {g.started.numMistakes}</pre>
            <pre>Round: {g.started.roundNum}</pre>
            <pre>Already played: {JSON.stringify(g.started.numbersPlayedList)}</pre>
            <pre>Your hand: {JSON.stringify(g.started.handList)}</pre>
            <button onClick={() => dispatch({kind: 'play', gameId, playerId, etag})}>Play</button>
        <pre>
            All: {JSON.stringify(g)}
        </pre>

    </React.Fragment>
    } else {

        return <React.Fragment>
        <h1>Game {gameId}</h1>
        <pre>Error: {JSON.stringify(game)}</pre>
        </React.Fragment>
    }

   
};

// const app = firebase.initializeApp(Config().firebase)
const auth = app.auth()
const storage = app.storage()

const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
        // Avoid redirects after sign-in.
        signInSuccessWithAuthResult: () => false
    }
}

const SignInPage: React.FC = () => {
    return <React.Fragment>
        <h1>Hey it's Pictophone!</h1>
        <p>Care to sign in?</p>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </React.Fragment>
}

type GamePageProps = {
    playerId: string
    dispatch: base.Dispatch
}

async function getPlayerGame(playerId: string, gameId: string): Promise<model.PlayerGame> {
    const fetched = await fetch(`${Config().backendAddr}/1.1/players/${playerId}/games/${gameId}`, {
        method: 'get',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',       // receive json
        },
    })
    return validateModel('PlayerGame')(await fetched.json())
}

export function usePlayerGame(playerId: string, gameId: string): db.Value<model.PlayerGame> {
    const token = db.useConsistencyToken(`games/${gameId}`)

    const [playerGame, setPlayerGame] = useState<db.Value<model.PlayerGame>>({ state: 'loading' });

    useEffect(() => {
        console.log("LOAD PG")
        getPlayerGame(playerId, gameId).then(gl => setPlayerGame({
            state: 'ready',
            value: gl
        }))
    }, [playerId, token])

    return playerGame
}

const GamePage: React.FC<GamePageProps> = ({ playerId, dispatch }) => {
    const { gameId } = useParams()
    const game = usePlayerGame(playerId, gameId)

    const startGame = () => dispatch.action({
        kind: "start_game",
        playerId: playerId!,
        gameId: gameId!
    })

    const submitWord = (word: string) => dispatch.action({
        kind: "make_move",
        playerId: playerId!,
        gameId: gameId!,
        submission: { kind: "word", word }
    })

    const submitDrawing = async (drawing: Drawing) => {
        const resp = await dispatch.upload(drawing)
        await dispatch.action({
            kind: "make_move",
            playerId: playerId!,
            gameId: gameId!,
            submission: { kind: "drawing", drawingId: resp.id }
        })
    }

    switch (game.state) {
        case 'loading':
            return <span>Loading...</span>
        case 'not_found':
            return <span>Not found :(</span>
        case 'ready':
            return (<GameView
                playerGame={game.value}
                startGame={startGame}
                submitWord={submitWord}
                submitDrawing={submitDrawing}
            />)
    }
}

async function postAction(body: Action): Promise<void> {
    await fetch(Config().backendAddr + '/1.1/action', {
        method: 'post',
        body: JSON.stringify(body),
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',       // receive json
        },
    })
}

function postUpload(auth: AuthInfo): (u: Upload) => Promise<UploadResponse> {
    return async (u: Upload): Promise<UploadResponse> => {
        if (!auth.ready || auth.user === null) {
            throw new Error("can't upload; not logged in.")
        }
        const serialized = JSON.stringify(u);
        const hash = sha256.hex(serialized);
        const blob = new Blob([serialized], { type: 'application/json' });

        const id = `users/${auth.user.uid}/drawings/sha256-${hash}`;
        await storage.ref(id).put(blob);
        return { id }
        // const resp = await fetch(Config().backendAddr + '/upload', {
        //     method: 'post',
        //     body: JSON.stringify(u),
        //     mode: 'cors',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Accept': 'application/json',       // receive json
        //     },
        // })
        // return validateRpc('UploadResponse')(await resp.json())
    }
}

type AuthInfo = { ready: false } | { ready: true, user: firebase.User | null }

const Content: React.FC = () => {

    const onc = () => {
        const x = new pb2.PictophoneClient("http://localhost:8080")
        const req = new pb.GetGameRequest();
        req.setGameId("a");
        const y = x.getGame(req);
        y.on("status", (x: any) => console.log("STATUS: ", x));
        y.on("data", (x: unknown) => console.log("DATA: ", x));
    };


    return <div><button onClick={onc}>BTN</button>Loading!</div>;
    // const location = useLocation()
    // const [authInfo, setAuthInfo] = useState<AuthInfo>({ ready: false })

    // useEffect(() => {
    //     return auth.onAuthStateChanged(user => setAuthInfo({ ready: true, user }))
    // }, [])

    // if (!authInfo.ready) {
    //     return <div>Loading!</div>
    // }

    // (window as any)['signout'] = () => auth.signOut()

    // if (!authInfo.user) {
    //     if (location.pathname !== '/') {
    //         return <Redirect to="/" />
    //     } else {
    //         return <Landing />
    //     }
    // }

    // const dispatch: base.Dispatch = {
    //     action: postAction,
    //     upload: postUpload(authInfo),
    // }

    // return <Switch>
    //     <Route path="/" exact>
    //         {
    //             authInfo.user
    //                 ? <Home playerId={authInfo.user.uid}
    //                     defaultDisplayName={authInfo.user.displayName || ''}
    //                     dispatch={dispatch} />
    //                 : <Landing />
    //         }
    //     </Route>

    //     <Route path="/g/:gameId" exact>
    //         <GamePage playerId={authInfo.user.uid} dispatch={dispatch} />
    //     </Route>
    // </Switch>
}

const AppOld: React.FC = () => {
    return <Router>
        <Content />
    </Router>
}

export default App

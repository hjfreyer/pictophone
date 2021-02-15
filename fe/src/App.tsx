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
import firebase, { firestore } from 'firebase'
import Config from './config'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { UserInfo } from 'os'
import { pipeWith } from 'pipe-ts';

export interface AppConfig {
    server: pb2.PictophoneClient
}

type State = {
    state: 'LOAD_AUTH'
} | {
    state: 'SIGN_IN'
} | {
    state: 'HOME'
    user: firebase.UserInfo
} | {
    state: 'SHOW_GAME'
    user: firebase.UserInfo
    gameId: string
    game: Watchable<FetchedGame>
} | {
    state: '404'
    user: firebase.UserInfo
};

type Action = {
    kind: "navigate",
    location: nav.Location
} | {
    kind: "create",
    gameId: string,
} | {
    kind: "join",
    gameId: string,
} | {
    kind: "start",
} | {
    kind: 'play'
};

function newState(backend: pb2.PictophoneClient, location: nav.Location, user: Fetch<firebase.UserInfo>): State {
    if (user.state === "LOADING") {
        return { state: "LOAD_AUTH" }
    }
    if (user.state === "UNAVAILABLE") {
        return { state: "SIGN_IN" }
    }
    switch (location.page) {
        case 'home': {
            return {
                state: 'HOME',
                user: user.value,
            }
        }
        case 'game': {
            return {
                state: 'SHOW_GAME',
                user: user.value,
                gameId: location.gameId,
                game: getGame(backend, location.gameId, user.value.uid),
            };
        }
        case 'unknown':
            return {
                state: '404',
                user: user.value,
            };
    }
}

function sealState(state: State): Watchable<State> {
    switch (state.state) {
        case 'SIGN_IN':
        case '404':
        case 'HOME':
        case 'LOAD_AUTH':
            return watch.fromConstant(state);
        case 'SHOW_GAME':
            const { gameId, user } = state;
            return {
                value: state,
                next: state.game.next.then(game => sealState({
                    state: 'SHOW_GAME',
                    gameId,
                    user,
                    game,
                }))
            };
    }
}

function stateToUiAndAction(state: State): [JSX.Element, Promise<Action>] {
    const sink = new ixa.AsyncSink<Action>();
    const nextAction = ixa.first(sink).then(a => a!);

    return [<View s={state} dispatch={a => sink.write(a)} />, nextAction];
}

const uiConfig: firebaseui.auth.Config = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
        // Avoid redirects after sign-in.
        signInSuccessWithAuthResult: () => false,
    }
}

const SignInPage: React.FC = () => {
    return <React.Fragment>
        <h1>Hey it's Pictophone!</h1>
        <p>Care to sign in?</p>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </React.Fragment>
}

type Fetch<T> = {
    state: 'LOADING'
} | {
    state: 'UNAVAILABLE'
} | {
    state: 'READY'
    value: T
}

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

function watchableAuthState(): Watchable<Fetch<firebase.UserInfo>> {
    const sink = new ixa.AsyncSink<Fetch<firebase.UserInfo>>();
    firebase.auth().onAuthStateChanged((user) => {
        sink.write(user ? { state: 'READY', value: user } : { state: 'UNAVAILABLE' });
    });

    return watch.fromIterable(sink, { state: 'LOADING' });
}

function watchableUrlBar(): Watchable<nav.Location> {
    return {
        value: nav.parseLocation(document.location.pathname),
        next: new Promise((resolve) => {
            window.addEventListener('popstate', resolve, { once: true });
        }).then(watchableUrlBar)
    };
}

function fetchedUserFromState(state: State): Fetch<firebase.UserInfo> {
    switch (state.state) {
        case 'SIGN_IN':
            return { state: 'UNAVAILABLE' }
        case 'LOAD_AUTH':
            return { state: 'LOADING' }
        default:
            return { state: 'READY', value: state.user }
    }
}

function fold(backend: pb2.PictophoneClient, state: State, action: Action): State {
    switch (action.kind) {
        case 'navigate': {
            return newState(backend, action.location, fetchedUserFromState(state))
        }
        case 'create': {
            if (state.state !== 'HOME') {
                throw new Error("invalid state for creating game.")
            }
            const req = new pb.CreateGameRequest();
            req.setGameId(action.gameId);
            req.setPlayerId(state.user.uid);
            backend.createGame(req, null).then(
                resp => console.log("CREATE RESPONSE: ", resp.toObject()));
            return state;
        }
        case 'join': {
            if (state.state !== 'HOME') {
                throw new Error("invalid state for joining game.")
            }
            const req = new pb.JoinGameRequest();
            req.setGameId(action.gameId);
            req.setPlayerId(state.user.uid);
            backend.joinGame(req, null).then(
                resp => console.log("JOIN RESPONSE: ", resp.toObject()));
            return state;
        }
        case 'play': {
            if (state.state !== 'SHOW_GAME' || state.game.value === null || state.game.value.state !== 'ready' || !state.game.value.game.game) {
                throw new Error("invalid state for starting game.")
            }
            const req = new pb.MakeMoveRequest();
            req.setGameId(state.gameId);
            req.setPlayerId(state.user.uid);
            // req.setEtag(state.game.value.game.game.started.etag);
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
            req.setPlayerId(state.user.uid);
            backend.startGame(req, null).then(
                resp => console.log("START RESPONSE: ", resp.toObject()));
            return state;
        }
    }
}

export function App({ server }: AppConfig): Watchable<JSX.Element> {
    firebase.initializeApp(Config().firebase);

    const urlBar = watchableUrlBar();
    const authState = watchableAuthState();

    return pipeWith(watch.combine(urlBar, authState),
        watch.switchMap(([url, user]) => pipeWith(sealState(newState(server, url, user)),
            watch.mapFold((acc, act) => sealState(fold(server, acc, act)), stateToUiAndAction))
        ),
    );
}

interface ViewProps {
    s: State
    dispatch: (action: Action) => void
}

const View: React.FC<ViewProps> = ({ s, dispatch }) => {
    switch (s.state) {
        case 'LOAD_AUTH': return <h1>Load auth</h1>;
        case 'SIGN_IN': return <SignInPage />;
        case 'HOME': return <ListGames user={s.user} dispatch={dispatch}></ListGames>;
        case 'SHOW_GAME': return <Game gameId={s.gameId} playerId={s.user.uid} game={s.game.value} dispatch={dispatch}></Game>;
        case '404': return <div>404</div>;
    }
};

interface ListGamesProps {
    user: firebase.UserInfo
    dispatch: (a: Action) => void
}

const ListGames: React.FC<ListGamesProps> = ({ user, dispatch }) => {
    type Inputs = {
        gameId: string,
    };
    const { register, handleSubmit, watch, errors } = useForm<Inputs>();
    const { register: joinRegister, handleSubmit: joinHandleSubmit } = useForm<Inputs>();
    const { register: createRegister, handleSubmit: createHandleSubmit } = useForm<Inputs>();
    const onSubmit = (i: Inputs) => {
        const location: nav.Location = { page: 'game', ...i };
        window.history.pushState({}, '', nav.serializeLocation(location));
        dispatch({ kind: "navigate", location });
    }
    const onJoin = (i: Inputs) => {
        dispatch({ kind: "join", ...i });
    };
    const onCreate = (i: Inputs) => {
        dispatch({ kind: "create", ...i });
    };
    return <React.Fragment>
        <pre>UserId: {user.uid}</pre>
        <h1>Create a game</h1>
        <form onSubmit={createHandleSubmit(onCreate)}>
            <label>Game Id: <input name="gameId" required ref={createRegister} /></label>
            <button>Submit</button>
        </form>

        <h1>Go to a game</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
            <label>Game Id: <input name="gameId" required ref={register} /></label>
            <button>Submit</button>
        </form>

        <h1>Join a game</h1>
        <form onSubmit={joinHandleSubmit(onJoin)}>
            <label>Game Id: <input name="gameId" required ref={joinRegister} /></label>
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
            } else {
                throw new Error("unreachable")
            }
        }
    }
};


export default App

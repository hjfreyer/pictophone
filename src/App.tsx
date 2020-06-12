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
import Action from './model/Action'
import { validate as validateExport } from './model/Export.validator'
import { Drawing, Upload, UploadResponse } from './model/rpc'
import { validate as validateRpc } from './model/rpc.validator'
import { ExportedPlayer1_1 } from './model/Export'
import { app } from './context';
import { useValue } from './db';
import * as tables from './tables';
import { sha256 } from 'js-sha256';
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

const Landing: React.FC = () => {
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

const GamePage: React.FC<GamePageProps> = ({ playerId, dispatch }) => {
    const { gameId } = useParams()
    const game = useValue(tables.GAMES_BY_PLAYER, [playerId, gameId])

    const startGame = () => dispatch.action({
        version: base.MODEL_VERSION,
        kind: "start_game",
        playerId: playerId!,
        gameId: gameId!
    })

    const submitWord = (word: string) => dispatch.action({
        version: base.MODEL_VERSION,
        kind: "make_move",
        playerId: playerId!,
        gameId: gameId!,
        submission: { kind: "word", word }
    })

    const submitDrawing = async (drawing: Drawing) => {
        const resp = await dispatch.upload(drawing)
        await dispatch.action({
            version: base.MODEL_VERSION,
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
    await fetch(Config().backendAddr + '/action', {
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
    const location = useLocation()
    const [authInfo, setAuthInfo] = useState<AuthInfo>({ ready: false })

    useEffect(() => {
        return auth.onAuthStateChanged(user => setAuthInfo({ ready: true, user }))
    }, [])

    if (!authInfo.ready) {
        return <div>Loading!</div>
    }

    (window as any)['signout'] = () => auth.signOut()

    if (!authInfo.user) {
        if (location.pathname !== '/') {
            return <Redirect to="/" />
        } else {
            return <Landing />
        }
    }

    const dispatch: base.Dispatch = {
        action: postAction,
        upload: postUpload(authInfo),
    }

    return <Switch>
        <Route path="/" exact>
            {
                authInfo.user
                    ? <Home playerId={authInfo.user.uid}
                        defaultDisplayName={authInfo.user.displayName || ''}
                        dispatch={dispatch} />
                    : <Landing />
            }
        </Route>

        <Route path="/g/:gameId" exact>
            <GamePage playerId={authInfo.user.uid} dispatch={dispatch} />
        </Route>
    </Switch>
}

const App: React.FC = () => {
    return <Router>
        <Content />
    </Router>
}

export default App

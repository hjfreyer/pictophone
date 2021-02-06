import React, { useState, useEffect } from 'react';
import { FirestoreCollection } from 'react-firestore';
import { Link } from 'react-router-dom';
import * as base from './base';
import * as context from './context';
import * as db from './db';
import Config from './config'


// import { TableSpec, useCollection } from './db';
import { validate } from './model/rpc.validator';
import { validate as validateModel } from './model/1.1.validator';
import * as model from './model/1.1'
import * as tables from './tables';
import { dirname } from 'path';

type HomeProps = {
    playerId: string
    defaultDisplayName: string
    dispatch: base.Dispatch
}


async function getGameList(playerId: string): Promise<model.GameList> {
    const fetched = await fetch(`${Config().backendAddr}/1.1/players/${playerId}/games`, {
        method: 'get',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',       // receive json
        },
    })
    return validateModel('GameList')(await fetched.json())
}

export function useGameList(playerId: string): db.Value<model.GameList> {
    const token = db.useConsistencyToken(`players/${playerId}/games/*`)

    const [gameList, setGameList] = useState<db.Value<model.GameList>>({ state: 'loading' });

    useEffect(() => {
        getGameList(playerId).then(gl => setGameList({
            state: 'ready',
            value: gl
        }))
    }, [playerId, token])

    return gameList
}

// function useGamesByPlayer(playerId: string): db.Value<string[]> {
//     const [refGroup, setRefGroup] = useState<db.Value<string[]>>({ state: 'loading' });
//     useEffect(() => {
//         const [playerId, gameId] = key;

//         const db = context.app.firestore();

//         const unsubscribe = db.collection('players').doc(playerId)
//             .collection('games-gamesByPlayer-1.1')
//             .doc(gameId)
//             .onSnapshot((snap: firebase.firestore.DocumentSnapshot) => {
//                 if (snap.exists) {
//                     setValue({
//                         state: 'ready',
//                         value: table.validator(snap.data()!['value'])
//                     })
//                 } else {
//                     setValue({
//                         state: 'not_found',
//                     })
//                 }
//             });

//         return unsubscribe;
//     }, [table, JSON.stringify(key)])
//     return value
// }

// } 

const Home: React.FC<HomeProps> = ({ playerId, defaultDisplayName, dispatch }) => {
    const [gameId, setGameId] = useState("")
    const [displayName, setDisplayName] = useState(defaultDisplayName)

    const joinGame = () => dispatch.action({
        kind: "join_game",
        playerId,
        gameId,
        playerDisplayName: displayName,
    })

    // const games = useCollection(tables.GAMES_BY_PLAYER, [playerId]);
    const games = useGameList(playerId);

    return <div>
        <h1>User page for {playerId}</h1>
        <div>
            <h2>Join A Game</h2>
            <form onSubmit={(e) => { e.preventDefault(); joinGame() }}>
                <div>
                    <label>Game Name
                <input
                            type="text"
                            value={gameId} onChange={e => setGameId(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>Your Name
                <input
                            type="text"
                            value={displayName} onChange={e => setDisplayName(e.target.value)} />
                    </label>
                </div>
                <button>Submit</button>
            </form>
        </div>
        <h2>Existing Games</h2>
        {games.state === 'loading'
            ? <div>Loading...</div>
            : games.state === 'not_found'
            ? <div> something went wrong</div>
            : games.value.gameIds.map(gid =>
                <div key={gid}>
                    <Link to={`/g/${gid}`}>{gid}</Link>
                </div>)
        }
    </div>
}


export default Home

import React, { useState } from 'react';
import { FirestoreCollection } from 'react-firestore';
import { Link } from 'react-router-dom';
import * as base from './base';
import { TableSpec, useCollection } from './db';
import { validate } from './model/Export.validator';
import * as tables from './tables';

type HomeProps = {
    playerId: string
    defaultDisplayName: string
    dispatch: base.Dispatch
}

const Home: React.FC<HomeProps> = ({ playerId, defaultDisplayName, dispatch }) => {
    const [gameId, setGameId] = useState("")
    const [displayName, setDisplayName] = useState(defaultDisplayName)

    const joinGame = () => dispatch.action({
        version: '1.1',
        kind: "join_game",
        playerId,
        gameId,
        playerDisplayName: displayName,
    })

    const games = useCollection(tables.GAMES_BY_PLAYER, [playerId]);

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
            : games.items.map(([[, gid], g]) =>
                <div key={gid}>
                    <Link to={`/g/${gid}`}>{gid}</Link>
                </div>)
        }
    </div>
}

export default Home

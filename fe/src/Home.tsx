import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'
import { FirestoreProvider, FirestoreCollection, FirestoreDocument } from 'react-firestore';

import * as types from './types'

type HomeProps = {
    playerId: string
    dispatch: (a: types.ActionRequest) => void
}

const Home: React.FC<HomeProps> = ({ playerId, dispatch }) => {
    const joinGame = (gameId: string) => dispatch({
        action: {
            kind: "join_game",
            playerId,
            gameId,
        }
    })

    return <div>
        <h1>User page for {playerId}</h1>
        <JoinGame join={joinGame} />
        <h2>Existing Games</h2>
        <FirestoreCollection
            path={`versions/0/players/${playerId}/games`}
            render={({ isLoading, data }: { isLoading: boolean, data: any[] }) => (
                <div>
                    {
                        isLoading
                            ? <span>Loading...</span>
                            : <div>
                                {data.map((r) => (
                                    <div key={r.id}>
                                        <Link to={`/g/${r.id}?u=${playerId}`}>{r.id}</Link></div>))}
                            </div>
                    }
                </div>
            )} />
    </div>
}

const JoinGame = ({ join }: {
    join: (gid: string) => void
}) => {
    const [gid, setGid] = useState("")
    return <div>
        <h2>Join A Game</h2>
        <form onSubmit={(e) => { e.preventDefault(); join(gid) }}>
            <input
                type="text"
                value={gid} onChange={e => setGid(e.target.value)} />
            <button>Submit</button>
        </form>
    </div>
}

export default Home
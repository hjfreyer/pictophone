
import fetch from 'node-fetch';
import {Response} from 'node-fetch';
import * as actions from './actions';

async function postit(body: actions.Action): Promise<void> {
    const res = await fetch('https://pictophone-be-3u2pedngkq-ue.a.run.app', {
        method: 'post',
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });

    console.log(await res.text());
}

async function main(): Promise<void> {
    await postit({
        gameId: '1',
        playerId: 'ehopper',
        kind: 'join_game'
    })
    await postit({
        gameId: '1',
        playerId: 'hjfreyer',
        kind: 'join_game'
    })
}
main()
import produce from 'immer'
import PreviousAction from '../model/v1.1.0/Action'
import Action, { JoinGame, MakeMove, StartGame } from '../model/v1.2.0/Action'
import Export, { PlayerGame, PlayerMap, Series } from '../model/v1.2.0/Export'
import PreviousState from '../model/v1.1.0/State'
import State from '../model/v1.2.0/State'
import { mapValues } from '../util'

export const VERSION = 'v1.2.0'
export const PREVIOUS_VERSION = 'v1.1.0'


// Integration
// ===========
export function initState(gameId: string): State {
    return {
        version: VERSION,
        kind: 'game',
        gameId,
        state: 'UNSTARTED',
        playerOrder: [],
        displayNames: {},
    }
}

export function integrate(state: State, action: Action): State {
    switch (action.kind) {
        case 'join_game':
            return produce(joinGame)(state, action)
        case 'start_game':
            return produce(startGame)(state, action)
        case 'make_move':
            return produce(makeMove)(state, action)
    }
}

function joinGame(game: State, action: JoinGame) {
    if (game.state !== 'UNSTARTED') {
        return
    }

    if (game.playerOrder.indexOf(action.playerId) !== -1) {
        return
    }

    game.displayNames[action.playerId] = action.displayName
    game.playerOrder.push(action.playerId)
}

function startGame(game: State, action: StartGame): State {
    if (game.state !== 'UNSTARTED') {
        return game
    }
    if (game.playerOrder.length === 0) {
        return game
    }

    return {
        ...game,
        state: 'STARTED',
        submissions: mapValues(game.displayNames, () => []),
    }
}

function makeMove(game: State, action: MakeMove) {
    if (game.state !== 'STARTED') {
        return
    }
    const playerId = action.playerId
    if (game.playerOrder.indexOf(playerId) === -1) {
        return
    }

    const roundNum = Math.min(...Object.values(game.submissions).map(s => s.length))
    if (game.submissions[playerId].length !== roundNum) {
        return
    }

    // Game is over.
    if (roundNum === game.playerOrder.length) {
        return
    }

    if (roundNum % 2 === 0 && action.submission.kind === 'drawing') {
        return
    }
    if (roundNum % 2 === 1 && action.submission.kind === 'word') {
        return
    }

    game.submissions[playerId].push(action.submission)
}

// Export
// ======
export function exportState(state: State): Export[] {
    return state.playerOrder.map(playerId => ({
        version: VERSION,
        kind: 'player_game',
        playerId,
        gameId: state.gameId,
        ...exportStateForPlayer(state, playerId)
    }))
}

function exportStateForPlayer(state: State, playerId: string): PlayerGame {
    const players: PlayerMap = {}
    for (const id of state.playerOrder) {
        players[id] = { displayName: state.displayNames[id] }
    }

    if (state.state === 'UNSTARTED') {
        return {
            state: 'UNSTARTED',
            players,
            playerOrder: state.playerOrder,
        }
    }

    const numPlayers = state.playerOrder.length
    const roundNum = Math.min(...Object.values(state.submissions).map(a => a.length))

    // Game is over.
    if (roundNum === numPlayers) {
        const series: Series[] = state.playerOrder.map(() => ({ entries: [] }))
        for (let rIdx = 0; rIdx < numPlayers; rIdx++) {
            for (let pIdx = 0; pIdx < numPlayers; pIdx++) {
                series[(pIdx + rIdx) % numPlayers].entries.push({
                    playerId: state.playerOrder[pIdx],
                    submission: state.submissions[state.playerOrder[pIdx]][rIdx]
                })
            }
        }

        return {
            state: 'GAME_OVER',
            players,
            playerOrder: state.playerOrder,
            series,
        }
    }

    if (state.submissions[playerId].length === 0) {
        return {
            state: 'FIRST_PROMPT',
            playerOrder: state.playerOrder,
            players,
        }
    }

    if (state.submissions[playerId].length === roundNum) {
        const playerIdx = state.playerOrder.indexOf(playerId)
        if (playerIdx === -1) {
            throw new Error('baad')
        }
        const nextPlayerIdx = (playerIdx + 1) % state.playerOrder.length
        return {
            state: 'RESPOND_TO_PROMPT',
            players,
            playerOrder: state.playerOrder,
            prompt: state.submissions[state.playerOrder[nextPlayerIdx]][roundNum - 1]
        }
    }

    return {
        state: 'WAITING_FOR_PROMPT',
        players,
        playerOrder: state.playerOrder,
    }
}

// Transform
// =========
export function upgradeState(gameId: string, state: PreviousState): State {
    return {
        ...state,
        version: VERSION
    }
}

export function downgradeState(state: State): PreviousState {
    return {
        ...state,
        version: PREVIOUS_VERSION
    }
}

export function upgradeAction(action: PreviousAction): Action {
    return {
        ...action,
        version: VERSION
    }
}
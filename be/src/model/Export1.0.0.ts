
import { Submission } from './base'

type Base = {
    version: 'v1.0.0'
    kind: 'player_game'
    playerId: string
    gameId: string
}

export type PlayerMap = {
    [playerId: string]: Player
}

export type Player = {
    displayName: string
}

export type UnstartedGame =  {
    state: 'UNSTARTED'
    players: PlayerMap
}

export type FirstPromptGame ={
    state: 'FIRST_PROMPT'
    players: PlayerMap
}

export type WaitingForPromptGame = {
    state: 'WAITING_FOR_PROMPT'
    players: PlayerMap
}

export type RespondToPromptGame =  {
    state: 'RESPOND_TO_PROMPT'
    players: PlayerMap
    prompt: Submission
}

export type FinishedGame =  {
    state: 'GAME_OVER'
    players: PlayerMap
    series: Series[]
}

export type Series = {
    entries: SeriesEntry[]
}

export type SeriesEntry = {
    playerId: string
    submission: Submission
}

export type PlayerGame = (
    UnstartedGame
    | FirstPromptGame
    | WaitingForPromptGame
    | RespondToPromptGame
    | FinishedGame
)

export type Export1_0_0 = Base&PlayerGame
export default Export1_0_0

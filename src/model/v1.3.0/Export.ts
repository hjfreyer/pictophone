
const VERSION = 'v1.3.0'

type Base = {
    version: typeof VERSION
}

type PlayerGameBase = Base & {
    kind: 'player_game'
    playerId: string
    gameId: string
}

type WithPlayers = {
    players: PlayerMap
    playerOrder: string[]
}

export type PlayerMap = {
    [playerId: string]: Player
}

export type Player = {
    displayName: string
}

export type UnstartedGame = WithPlayers & {
    state: 'UNSTARTED'
}

export type FirstPromptGame = WithPlayers & {
    state: 'FIRST_PROMPT'
}

export type WaitingForPromptGame = WithPlayers & {
    state: 'WAITING_FOR_PROMPT'
}

export type RespondToPromptGame = WithPlayers & {
    state: 'RESPOND_TO_PROMPT'
    prompt: Submission
}

export type FinishedGame = WithPlayers & {
    state: 'GAME_OVER'
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

export type Submission = {
    kind: 'word'
    word: string
} | {
    kind: 'drawing'
    drawingId: string
}

export type ShortCode = Base & {
    kind: 'short_code'
    gameId: string
    shortCode: string
}

export type Export = (PlayerGameBase & PlayerGame) | ShortCode
export default Export

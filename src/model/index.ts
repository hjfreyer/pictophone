// Base

export interface NumberValue {
    value: number
}

export interface LiveUnknown {
    actionId: string
    value: unknown
}

export type Diff<V> = {
    key: string[]
    kind: 'add'
    value: V
} | {
    key: string[]
    kind: 'delete'
    value: V
} | {
    key: string[]
    kind: 'replace'
    oldValue: V
    newValue: V
}

export type SavedAction = {
    parents: string[]
    action: AnyAction
}

export type AnyAction = Action1_0
export type AnyError = Error1_0

// Shared

export type Submission = {
    kind: 'word'
    word: string
} | {
    kind: 'drawing'
    drawingId: string
}

// 1.0

export interface JoinGameAction1_0 {
    version: '1.0'
    kind: 'join_game'
    gameId: string
    playerId: string
}

export interface StartGameAction1_0 {
    version: '1.0'
    kind: 'start_game'
    gameId: string
    playerId: string
}

export type MakeMoveAction1_0 = {
    version: '1.0'
    kind: 'make_move'
    gameId: string
    playerId: string
    submission: Submission
}

export type Action1_0 = JoinGameAction1_0 | StartGameAction1_0 | MakeMoveAction1_0

export interface UnstartedGame1_0 {
    state: 'UNSTARTED'
    players: string[]
}

export interface StartedGame1_0 {
    state: 'STARTED'
    players: string[]
    submissions: Record<string, Submission[]>
}

export type Game1_0 = UnstartedGame1_0 | StartedGame1_0

export type Error1_0 = {
    version: '1.0'
    status: 'GAME_NOT_STARTED'
    gameId: string
} | {
    version: '1.0'
    status: 'PLAYER_NOT_IN_GAME'
    gameId: string
    playerId: string
} | {
    version: '1.0'
    status: 'MOVE_PLAYED_OUT_OF_TURN'
    gameId: string
    playerId: string
} | {
    version: '1.0'
    status: 'GAME_IS_OVER'
    gameId: string
} | {
    version: '1.0'
    status: 'INCORRECT_SUBMISSION_KIND'
    wanted: Submission['kind']
    got: Submission['kind']
} | {
    version: '1.0'
    status: 'GAME_ALREADY_STARTED'
    gameId: string
}

export type BoringPlayerGame1_0 = {
    state: 'UNSTARTED' | 'FIRST_PROMPT' | 'WAITING_FOR_PROMPT'
    players: string[]
}

export type RespondToPromptPlayerGame1_0 = {
    state: 'RESPOND_TO_PROMPT'
    players: string[]
    prompt: Submission
}

export type FinishedPlayerGame1_0 = {
    state: 'GAME_OVER'
    players: string[]
    series: Series[]
}

export type Series = {
    entries: SeriesEntry[]
}

export type SeriesEntry = {
    playerId: string
    submission: Submission
}

export type PlayerGame1_0 = BoringPlayerGame1_0 | RespondToPromptPlayerGame1_0 | FinishedPlayerGame1_0


export type BoringPlayerGame1_1 = {
    state: 'UNSTARTED' | 'FIRST_PROMPT' | 'WAITING_FOR_PROMPT'
    players: ExportedPlayer1_1[]
}

export type RespondToPromptPlayerGame1_1 = {
    state: 'RESPOND_TO_PROMPT'
    players: ExportedPlayer1_1[]
    prompt: ActionSubmission1_0
}

export type FinishedPlayerGame1_1 = {
    state: 'GAME_OVER'
    players: ExportedPlayer1_1[]
    series: ExportedSeries1_0[]
}

export interface ExportedPlayer1_1 {
    id: string
    displayName: string
}


export type ExportedSeries1_0 = {
    entries: ExportedSeriesEntry1_0[]
}

export type ExportedSeriesEntry1_0 = {
    playerId: string
    submission: ActionSubmission1_0
}

export type ActionSubmission1_0 = {
    kind: 'word'

    /**
     * @minLength 1
     * @maxLength 1024
     * @contentMediaType text/plain
     */
    word: string
} | {
    kind: 'drawing'
    drawingId: string
}
export type PlayerGame1_1 = BoringPlayerGame1_1 | RespondToPromptPlayerGame1_1 | FinishedPlayerGame1_1


export interface JoinGameAction1_1 {
    version: '1.1'
    kind: 'join_game'
    /**
     * @minLength 1
     * @maxLength 1024
     * @pattern ^[a-zA-Z0-9_-]*$
     */
    gameId: string

    /**
     * @minLength 1
     * @maxLength 1024
     * @pattern ^[a-zA-Z0-9_-]*$
     */
    playerId: string

    /**
     * @minLength 1
     * @maxLength 1024
     * @contentMediaType text/plain
     */
    playerDisplayName: string
}

export interface StartGameAction1_1 {
    version: '1.1'
    kind: 'start_game'

    /**
 * @minLength 1
 * @maxLength 1024
 * @pattern ^[a-zA-Z0-9_-]*$
 */
    gameId: string

    /**
     * @minLength 1
     * @maxLength 1024
     * @pattern ^[a-zA-Z0-9_-]*$
     */
    playerId: string
}

export type MakeMoveAction1_1 = {
    version: '1.1'
    kind: 'make_move'
    /**
    * @minLength 1
    * @maxLength 1024
    * @pattern ^[a-zA-Z0-9_-]*$
    */
    gameId: string

    /**
     * @minLength 1
     * @maxLength 1024
     * @pattern ^[a-zA-Z0-9_-]*$
     */
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

export type Action = JoinGameAction1_1 | StartGameAction1_1 | MakeMoveAction1_1
export default Action
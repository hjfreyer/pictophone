import * as jspb from 'google-protobuf'



export class ActionRequest extends jspb.Message {
  getJoinGameRequest(): JoinGameRequest | undefined;
  setJoinGameRequest(value?: JoinGameRequest): ActionRequest;
  hasJoinGameRequest(): boolean;
  clearJoinGameRequest(): ActionRequest;

  getStartGameRequest(): StartGameRequest | undefined;
  setStartGameRequest(value?: StartGameRequest): ActionRequest;
  hasStartGameRequest(): boolean;
  clearStartGameRequest(): ActionRequest;

  getMakeMoveRequest(): MakeMoveRequest | undefined;
  setMakeMoveRequest(value?: MakeMoveRequest): ActionRequest;
  hasMakeMoveRequest(): boolean;
  clearMakeMoveRequest(): ActionRequest;

  getMethodCase(): ActionRequest.MethodCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ActionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ActionRequest): ActionRequest.AsObject;
  static serializeBinaryToWriter(message: ActionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ActionRequest;
  static deserializeBinaryFromReader(message: ActionRequest, reader: jspb.BinaryReader): ActionRequest;
}

export namespace ActionRequest {
  export type AsObject = {
    joinGameRequest?: JoinGameRequest.AsObject,
    startGameRequest?: StartGameRequest.AsObject,
    makeMoveRequest?: MakeMoveRequest.AsObject,
  }

  export enum MethodCase { 
    METHOD_NOT_SET = 0,
    JOIN_GAME_REQUEST = 1,
    START_GAME_REQUEST = 2,
    MAKE_MOVE_REQUEST = 3,
  }
}

export class ActionResponse extends jspb.Message {
  getJoinGameResponse(): JoinGameResponse | undefined;
  setJoinGameResponse(value?: JoinGameResponse): ActionResponse;
  hasJoinGameResponse(): boolean;
  clearJoinGameResponse(): ActionResponse;

  getStartGameResponse(): StartGameResponse | undefined;
  setStartGameResponse(value?: StartGameResponse): ActionResponse;
  hasStartGameResponse(): boolean;
  clearStartGameResponse(): ActionResponse;

  getMakeMoveResponse(): MakeMoveResponse | undefined;
  setMakeMoveResponse(value?: MakeMoveResponse): ActionResponse;
  hasMakeMoveResponse(): boolean;
  clearMakeMoveResponse(): ActionResponse;

  getMethodCase(): ActionResponse.MethodCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ActionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ActionResponse): ActionResponse.AsObject;
  static serializeBinaryToWriter(message: ActionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ActionResponse;
  static deserializeBinaryFromReader(message: ActionResponse, reader: jspb.BinaryReader): ActionResponse;
}

export namespace ActionResponse {
  export type AsObject = {
    joinGameResponse?: JoinGameResponse.AsObject,
    startGameResponse?: StartGameResponse.AsObject,
    makeMoveResponse?: MakeMoveResponse.AsObject,
  }

  export enum MethodCase { 
    METHOD_NOT_SET = 0,
    JOIN_GAME_RESPONSE = 1,
    START_GAME_RESPONSE = 2,
    MAKE_MOVE_RESPONSE = 3,
  }
}

export class QueryRequest extends jspb.Message {
  getGetGameRequest(): GetGameRequest | undefined;
  setGetGameRequest(value?: GetGameRequest): QueryRequest;
  hasGetGameRequest(): boolean;
  clearGetGameRequest(): QueryRequest;

  getMethodCase(): QueryRequest.MethodCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QueryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: QueryRequest): QueryRequest.AsObject;
  static serializeBinaryToWriter(message: QueryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QueryRequest;
  static deserializeBinaryFromReader(message: QueryRequest, reader: jspb.BinaryReader): QueryRequest;
}

export namespace QueryRequest {
  export type AsObject = {
    getGameRequest?: GetGameRequest.AsObject,
  }

  export enum MethodCase { 
    METHOD_NOT_SET = 0,
    GET_GAME_REQUEST = 1,
  }
}

export class QueryResponse extends jspb.Message {
  getGetGameResponse(): GetGameResponse | undefined;
  setGetGameResponse(value?: GetGameResponse): QueryResponse;
  hasGetGameResponse(): boolean;
  clearGetGameResponse(): QueryResponse;

  getMethodCase(): QueryResponse.MethodCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QueryResponse.AsObject;
  static toObject(includeInstance: boolean, msg: QueryResponse): QueryResponse.AsObject;
  static serializeBinaryToWriter(message: QueryResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QueryResponse;
  static deserializeBinaryFromReader(message: QueryResponse, reader: jspb.BinaryReader): QueryResponse;
}

export namespace QueryResponse {
  export type AsObject = {
    getGameResponse?: GetGameResponse.AsObject,
  }

  export enum MethodCase { 
    METHOD_NOT_SET = 0,
    GET_GAME_RESPONSE = 1,
  }
}

export class JoinGameRequest extends jspb.Message {
  getGameId(): string;
  setGameId(value: string): JoinGameRequest;

  getPlayerId(): string;
  setPlayerId(value: string): JoinGameRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JoinGameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: JoinGameRequest): JoinGameRequest.AsObject;
  static serializeBinaryToWriter(message: JoinGameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JoinGameRequest;
  static deserializeBinaryFromReader(message: JoinGameRequest, reader: jspb.BinaryReader): JoinGameRequest;
}

export namespace JoinGameRequest {
  export type AsObject = {
    gameId: string,
    playerId: string,
  }
}

export class JoinGameResponse extends jspb.Message {
  getUnknownError(): UnknownError | undefined;
  setUnknownError(value?: UnknownError): JoinGameResponse;
  hasUnknownError(): boolean;
  clearUnknownError(): JoinGameResponse;

  getGameAlreadyStartedError(): GameAlreadyStartedError | undefined;
  setGameAlreadyStartedError(value?: GameAlreadyStartedError): JoinGameResponse;
  hasGameAlreadyStartedError(): boolean;
  clearGameAlreadyStartedError(): JoinGameResponse;

  getErrorCase(): JoinGameResponse.ErrorCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JoinGameResponse.AsObject;
  static toObject(includeInstance: boolean, msg: JoinGameResponse): JoinGameResponse.AsObject;
  static serializeBinaryToWriter(message: JoinGameResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JoinGameResponse;
  static deserializeBinaryFromReader(message: JoinGameResponse, reader: jspb.BinaryReader): JoinGameResponse;
}

export namespace JoinGameResponse {
  export type AsObject = {
    unknownError?: UnknownError.AsObject,
    gameAlreadyStartedError?: GameAlreadyStartedError.AsObject,
  }

  export enum ErrorCase { 
    ERROR_NOT_SET = 0,
    UNKNOWN_ERROR = 1,
    GAME_ALREADY_STARTED_ERROR = 2,
  }
}

export class StartGameRequest extends jspb.Message {
  getGameId(): string;
  setGameId(value: string): StartGameRequest;

  getPlayerId(): string;
  setPlayerId(value: string): StartGameRequest;

  getRandomSeed(): number;
  setRandomSeed(value: number): StartGameRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartGameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StartGameRequest): StartGameRequest.AsObject;
  static serializeBinaryToWriter(message: StartGameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StartGameRequest;
  static deserializeBinaryFromReader(message: StartGameRequest, reader: jspb.BinaryReader): StartGameRequest;
}

export namespace StartGameRequest {
  export type AsObject = {
    gameId: string,
    playerId: string,
    randomSeed: number,
  }
}

export class StartGameResponse extends jspb.Message {
  getUnknownError(): UnknownError | undefined;
  setUnknownError(value?: UnknownError): StartGameResponse;
  hasUnknownError(): boolean;
  clearUnknownError(): StartGameResponse;

  getPlayerNotInGameError(): PlayerNotInGameError | undefined;
  setPlayerNotInGameError(value?: PlayerNotInGameError): StartGameResponse;
  hasPlayerNotInGameError(): boolean;
  clearPlayerNotInGameError(): StartGameResponse;

  getErrorCase(): StartGameResponse.ErrorCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartGameResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StartGameResponse): StartGameResponse.AsObject;
  static serializeBinaryToWriter(message: StartGameResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StartGameResponse;
  static deserializeBinaryFromReader(message: StartGameResponse, reader: jspb.BinaryReader): StartGameResponse;
}

export namespace StartGameResponse {
  export type AsObject = {
    unknownError?: UnknownError.AsObject,
    playerNotInGameError?: PlayerNotInGameError.AsObject,
  }

  export enum ErrorCase { 
    ERROR_NOT_SET = 0,
    UNKNOWN_ERROR = 1,
    PLAYER_NOT_IN_GAME_ERROR = 2,
  }
}

export class MakeMoveRequest extends jspb.Message {
  getGameId(): string;
  setGameId(value: string): MakeMoveRequest;

  getPlayerId(): string;
  setPlayerId(value: string): MakeMoveRequest;

  getEtag(): number;
  setEtag(value: number): MakeMoveRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MakeMoveRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MakeMoveRequest): MakeMoveRequest.AsObject;
  static serializeBinaryToWriter(message: MakeMoveRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MakeMoveRequest;
  static deserializeBinaryFromReader(message: MakeMoveRequest, reader: jspb.BinaryReader): MakeMoveRequest;
}

export namespace MakeMoveRequest {
  export type AsObject = {
    gameId: string,
    playerId: string,
    etag: number,
  }
}

export class MakeMoveResponse extends jspb.Message {
  getUnknownError(): UnknownError | undefined;
  setUnknownError(value?: UnknownError): MakeMoveResponse;
  hasUnknownError(): boolean;
  clearUnknownError(): MakeMoveResponse;

  getMoveAbortedError(): MoveAbortedError | undefined;
  setMoveAbortedError(value?: MoveAbortedError): MakeMoveResponse;
  hasMoveAbortedError(): boolean;
  clearMoveAbortedError(): MakeMoveResponse;

  getPlayerNotInGameError(): PlayerNotInGameError | undefined;
  setPlayerNotInGameError(value?: PlayerNotInGameError): MakeMoveResponse;
  hasPlayerNotInGameError(): boolean;
  clearPlayerNotInGameError(): MakeMoveResponse;

  getGameNotStartedError(): GameNotStartedError | undefined;
  setGameNotStartedError(value?: GameNotStartedError): MakeMoveResponse;
  hasGameNotStartedError(): boolean;
  clearGameNotStartedError(): MakeMoveResponse;

  getEmptyHandError(): EmptyHandError | undefined;
  setEmptyHandError(value?: EmptyHandError): MakeMoveResponse;
  hasEmptyHandError(): boolean;
  clearEmptyHandError(): MakeMoveResponse;

  getErrorCase(): MakeMoveResponse.ErrorCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MakeMoveResponse.AsObject;
  static toObject(includeInstance: boolean, msg: MakeMoveResponse): MakeMoveResponse.AsObject;
  static serializeBinaryToWriter(message: MakeMoveResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MakeMoveResponse;
  static deserializeBinaryFromReader(message: MakeMoveResponse, reader: jspb.BinaryReader): MakeMoveResponse;
}

export namespace MakeMoveResponse {
  export type AsObject = {
    unknownError?: UnknownError.AsObject,
    moveAbortedError?: MoveAbortedError.AsObject,
    playerNotInGameError?: PlayerNotInGameError.AsObject,
    gameNotStartedError?: GameNotStartedError.AsObject,
    emptyHandError?: EmptyHandError.AsObject,
  }

  export enum ErrorCase { 
    ERROR_NOT_SET = 0,
    UNKNOWN_ERROR = 1,
    MOVE_ABORTED_ERROR = 2,
    PLAYER_NOT_IN_GAME_ERROR = 3,
    GAME_NOT_STARTED_ERROR = 4,
    EMPTY_HAND_ERROR = 5,
  }
}

export class GetGameRequest extends jspb.Message {
  getGameId(): string;
  setGameId(value: string): GetGameRequest;

  getPlayerId(): string;
  setPlayerId(value: string): GetGameRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetGameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetGameRequest): GetGameRequest.AsObject;
  static serializeBinaryToWriter(message: GetGameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetGameRequest;
  static deserializeBinaryFromReader(message: GetGameRequest, reader: jspb.BinaryReader): GetGameRequest;
}

export namespace GetGameRequest {
  export type AsObject = {
    gameId: string,
    playerId: string,
  }
}

export class GetGameResponse extends jspb.Message {
  getUnknownError(): UnknownError | undefined;
  setUnknownError(value?: UnknownError): GetGameResponse;
  hasUnknownError(): boolean;
  clearUnknownError(): GetGameResponse;

  getPlayerNotInGameError(): PlayerNotInGameError | undefined;
  setPlayerNotInGameError(value?: PlayerNotInGameError): GetGameResponse;
  hasPlayerNotInGameError(): boolean;
  clearPlayerNotInGameError(): GetGameResponse;

  getGame(): Game | undefined;
  setGame(value?: Game): GetGameResponse;
  hasGame(): boolean;
  clearGame(): GetGameResponse;

  getErrorCase(): GetGameResponse.ErrorCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetGameResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetGameResponse): GetGameResponse.AsObject;
  static serializeBinaryToWriter(message: GetGameResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetGameResponse;
  static deserializeBinaryFromReader(message: GetGameResponse, reader: jspb.BinaryReader): GetGameResponse;
}

export namespace GetGameResponse {
  export type AsObject = {
    unknownError?: UnknownError.AsObject,
    playerNotInGameError?: PlayerNotInGameError.AsObject,
    game?: Game.AsObject,
  }

  export enum ErrorCase { 
    ERROR_NOT_SET = 0,
    UNKNOWN_ERROR = 1,
    PLAYER_NOT_IN_GAME_ERROR = 2,
  }
}

export class Game extends jspb.Message {
  getPlayerIdsList(): Array<string>;
  setPlayerIdsList(value: Array<string>): Game;
  clearPlayerIdsList(): Game;
  addPlayerIds(value: string, index?: number): Game;

  getUnstarted(): Game.Unstarted | undefined;
  setUnstarted(value?: Game.Unstarted): Game;
  hasUnstarted(): boolean;
  clearUnstarted(): Game;

  getStarted(): Game.Started | undefined;
  setStarted(value?: Game.Started): Game;
  hasStarted(): boolean;
  clearStarted(): Game;

  getStateCase(): Game.StateCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Game.AsObject;
  static toObject(includeInstance: boolean, msg: Game): Game.AsObject;
  static serializeBinaryToWriter(message: Game, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Game;
  static deserializeBinaryFromReader(message: Game, reader: jspb.BinaryReader): Game;
}

export namespace Game {
  export type AsObject = {
    playerIdsList: Array<string>,
    unstarted?: Game.Unstarted.AsObject,
    started?: Game.Started.AsObject,
  }

  export class Unstarted extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Unstarted.AsObject;
    static toObject(includeInstance: boolean, msg: Unstarted): Unstarted.AsObject;
    static serializeBinaryToWriter(message: Unstarted, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Unstarted;
    static deserializeBinaryFromReader(message: Unstarted, reader: jspb.BinaryReader): Unstarted;
  }

  export namespace Unstarted {
    export type AsObject = {
    }
  }


  export class Started extends jspb.Message {
    getEtag(): number;
    setEtag(value: number): Started;

    getNumMistakes(): number;
    setNumMistakes(value: number): Started;

    getRoundNum(): number;
    setRoundNum(value: number): Started;

    getNumbersPlayedList(): Array<number>;
    setNumbersPlayedList(value: Array<number>): Started;
    clearNumbersPlayedList(): Started;
    addNumbersPlayed(value: number, index?: number): Started;

    getHandList(): Array<number>;
    setHandList(value: Array<number>): Started;
    clearHandList(): Started;
    addHand(value: number, index?: number): Started;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Started.AsObject;
    static toObject(includeInstance: boolean, msg: Started): Started.AsObject;
    static serializeBinaryToWriter(message: Started, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Started;
    static deserializeBinaryFromReader(message: Started, reader: jspb.BinaryReader): Started;
  }

  export namespace Started {
    export type AsObject = {
      etag: number,
      numMistakes: number,
      roundNum: number,
      numbersPlayedList: Array<number>,
      handList: Array<number>,
    }
  }


  export enum StateCase { 
    STATE_NOT_SET = 0,
    UNSTARTED = 2,
    STARTED = 3,
  }
}

export class UnknownError extends jspb.Message {
  getError(): string;
  setError(value: string): UnknownError;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UnknownError.AsObject;
  static toObject(includeInstance: boolean, msg: UnknownError): UnknownError.AsObject;
  static serializeBinaryToWriter(message: UnknownError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UnknownError;
  static deserializeBinaryFromReader(message: UnknownError, reader: jspb.BinaryReader): UnknownError;
}

export namespace UnknownError {
  export type AsObject = {
    error: string,
  }
}

export class GameAlreadyStartedError extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GameAlreadyStartedError.AsObject;
  static toObject(includeInstance: boolean, msg: GameAlreadyStartedError): GameAlreadyStartedError.AsObject;
  static serializeBinaryToWriter(message: GameAlreadyStartedError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GameAlreadyStartedError;
  static deserializeBinaryFromReader(message: GameAlreadyStartedError, reader: jspb.BinaryReader): GameAlreadyStartedError;
}

export namespace GameAlreadyStartedError {
  export type AsObject = {
  }
}

export class GameNotStartedError extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GameNotStartedError.AsObject;
  static toObject(includeInstance: boolean, msg: GameNotStartedError): GameNotStartedError.AsObject;
  static serializeBinaryToWriter(message: GameNotStartedError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GameNotStartedError;
  static deserializeBinaryFromReader(message: GameNotStartedError, reader: jspb.BinaryReader): GameNotStartedError;
}

export namespace GameNotStartedError {
  export type AsObject = {
  }
}

export class PlayerNotInGameError extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlayerNotInGameError.AsObject;
  static toObject(includeInstance: boolean, msg: PlayerNotInGameError): PlayerNotInGameError.AsObject;
  static serializeBinaryToWriter(message: PlayerNotInGameError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlayerNotInGameError;
  static deserializeBinaryFromReader(message: PlayerNotInGameError, reader: jspb.BinaryReader): PlayerNotInGameError;
}

export namespace PlayerNotInGameError {
  export type AsObject = {
  }
}

export class MoveAbortedError extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MoveAbortedError.AsObject;
  static toObject(includeInstance: boolean, msg: MoveAbortedError): MoveAbortedError.AsObject;
  static serializeBinaryToWriter(message: MoveAbortedError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MoveAbortedError;
  static deserializeBinaryFromReader(message: MoveAbortedError, reader: jspb.BinaryReader): MoveAbortedError;
}

export namespace MoveAbortedError {
  export type AsObject = {
  }
}

export class EmptyHandError extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EmptyHandError.AsObject;
  static toObject(includeInstance: boolean, msg: EmptyHandError): EmptyHandError.AsObject;
  static serializeBinaryToWriter(message: EmptyHandError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EmptyHandError;
  static deserializeBinaryFromReader(message: EmptyHandError, reader: jspb.BinaryReader): EmptyHandError;
}

export namespace EmptyHandError {
  export type AsObject = {
  }
}


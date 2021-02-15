import * as jspb from 'google-protobuf'



export class CreateGameRequest extends jspb.Message {
  getGameId(): string;
  setGameId(value: string): CreateGameRequest;

  getPlayerId(): string;
  setPlayerId(value: string): CreateGameRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateGameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateGameRequest): CreateGameRequest.AsObject;
  static serializeBinaryToWriter(message: CreateGameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateGameRequest;
  static deserializeBinaryFromReader(message: CreateGameRequest, reader: jspb.BinaryReader): CreateGameRequest;
}

export namespace CreateGameRequest {
  export type AsObject = {
    gameId: string,
    playerId: string,
  }
}

export class CreateGameResponse extends jspb.Message {
  getUnknownError(): UnknownError | undefined;
  setUnknownError(value?: UnknownError): CreateGameResponse;
  hasUnknownError(): boolean;
  clearUnknownError(): CreateGameResponse;

  getGameAlreadyExistsError(): GameAlreadyExistsError | undefined;
  setGameAlreadyExistsError(value?: GameAlreadyExistsError): CreateGameResponse;
  hasGameAlreadyExistsError(): boolean;
  clearGameAlreadyExistsError(): CreateGameResponse;

  getErrorCase(): CreateGameResponse.ErrorCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateGameResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CreateGameResponse): CreateGameResponse.AsObject;
  static serializeBinaryToWriter(message: CreateGameResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateGameResponse;
  static deserializeBinaryFromReader(message: CreateGameResponse, reader: jspb.BinaryReader): CreateGameResponse;
}

export namespace CreateGameResponse {
  export type AsObject = {
    unknownError?: UnknownError.AsObject,
    gameAlreadyExistsError?: GameAlreadyExistsError.AsObject,
  }

  export enum ErrorCase { 
    ERROR_NOT_SET = 0,
    UNKNOWN_ERROR = 1,
    GAME_ALREADY_EXISTS_ERROR = 2,
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

  getGameNotFoundError(): GameNotFoundError | undefined;
  setGameNotFoundError(value?: GameNotFoundError): JoinGameResponse;
  hasGameNotFoundError(): boolean;
  clearGameNotFoundError(): JoinGameResponse;

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
    gameNotFoundError?: GameNotFoundError.AsObject,
    gameAlreadyStartedError?: GameAlreadyStartedError.AsObject,
  }

  export enum ErrorCase { 
    ERROR_NOT_SET = 0,
    UNKNOWN_ERROR = 1,
    GAME_NOT_FOUND_ERROR = 2,
    GAME_ALREADY_STARTED_ERROR = 3,
  }
}

export class StartGameRequest extends jspb.Message {
  getGameId(): string;
  setGameId(value: string): StartGameRequest;

  getPlayerId(): string;
  setPlayerId(value: string): StartGameRequest;

  getWindowSize(): number;
  setWindowSize(value: number): StartGameRequest;

  getLength(): number;
  setLength(value: number): StartGameRequest;

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
    windowSize: number,
    length: number,
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

  getInvalidGameParametersError(): InvalidGameParametersError | undefined;
  setInvalidGameParametersError(value?: InvalidGameParametersError): StartGameResponse;
  hasInvalidGameParametersError(): boolean;
  clearInvalidGameParametersError(): StartGameResponse;

  getGameAlreadyStartedError(): GameAlreadyStartedError | undefined;
  setGameAlreadyStartedError(value?: GameAlreadyStartedError): StartGameResponse;
  hasGameAlreadyStartedError(): boolean;
  clearGameAlreadyStartedError(): StartGameResponse;

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
    invalidGameParametersError?: InvalidGameParametersError.AsObject,
    gameAlreadyStartedError?: GameAlreadyStartedError.AsObject,
  }

  export enum ErrorCase { 
    ERROR_NOT_SET = 0,
    UNKNOWN_ERROR = 1,
    PLAYER_NOT_IN_GAME_ERROR = 2,
    INVALID_GAME_PARAMETERS_ERROR = 3,
    GAME_ALREADY_STARTED_ERROR = 4,
  }
}

export class MakeMoveRequest extends jspb.Message {
  getGameId(): string;
  setGameId(value: string): MakeMoveRequest;

  getPlayerId(): string;
  setPlayerId(value: string): MakeMoveRequest;

  getSentence(): string;
  setSentence(value: string): MakeMoveRequest;

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
    sentence: string,
  }
}

export class MakeMoveResponse extends jspb.Message {
  getUnknownError(): UnknownError | undefined;
  setUnknownError(value?: UnknownError): MakeMoveResponse;
  hasUnknownError(): boolean;
  clearUnknownError(): MakeMoveResponse;

  getNotYourTurnError(): NotYourTurnError | undefined;
  setNotYourTurnError(value?: NotYourTurnError): MakeMoveResponse;
  hasNotYourTurnError(): boolean;
  clearNotYourTurnError(): MakeMoveResponse;

  getGameNotStartedError(): GameNotStartedError | undefined;
  setGameNotStartedError(value?: GameNotStartedError): MakeMoveResponse;
  hasGameNotStartedError(): boolean;
  clearGameNotStartedError(): MakeMoveResponse;

  getGameAlreadyOverError(): GameAlreadyOverError | undefined;
  setGameAlreadyOverError(value?: GameAlreadyOverError): MakeMoveResponse;
  hasGameAlreadyOverError(): boolean;
  clearGameAlreadyOverError(): MakeMoveResponse;

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
    notYourTurnError?: NotYourTurnError.AsObject,
    gameNotStartedError?: GameNotStartedError.AsObject,
    gameAlreadyOverError?: GameAlreadyOverError.AsObject,
  }

  export enum ErrorCase { 
    ERROR_NOT_SET = 0,
    UNKNOWN_ERROR = 1,
    NOT_YOUR_TURN_ERROR = 2,
    GAME_NOT_STARTED_ERROR = 3,
    GAME_ALREADY_OVER_ERROR = 4,
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

  getYourTurn(): Game.YourTurn | undefined;
  setYourTurn(value?: Game.YourTurn): Game;
  hasYourTurn(): boolean;
  clearYourTurn(): Game;

  getNotYourTurn(): Game.NotYourTurn | undefined;
  setNotYourTurn(value?: Game.NotYourTurn): Game;
  hasNotYourTurn(): boolean;
  clearNotYourTurn(): Game;

  getGameOver(): Game.GameOver | undefined;
  setGameOver(value?: Game.GameOver): Game;
  hasGameOver(): boolean;
  clearGameOver(): Game;

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
    yourTurn?: Game.YourTurn.AsObject,
    notYourTurn?: Game.NotYourTurn.AsObject,
    gameOver?: Game.GameOver.AsObject,
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


  export class YourTurn extends jspb.Message {
    getContextList(): Array<string>;
    setContextList(value: Array<string>): YourTurn;
    clearContextList(): YourTurn;
    addContext(value: string, index?: number): YourTurn;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): YourTurn.AsObject;
    static toObject(includeInstance: boolean, msg: YourTurn): YourTurn.AsObject;
    static serializeBinaryToWriter(message: YourTurn, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): YourTurn;
    static deserializeBinaryFromReader(message: YourTurn, reader: jspb.BinaryReader): YourTurn;
  }

  export namespace YourTurn {
    export type AsObject = {
      contextList: Array<string>,
    }
  }


  export class NotYourTurn extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): NotYourTurn.AsObject;
    static toObject(includeInstance: boolean, msg: NotYourTurn): NotYourTurn.AsObject;
    static serializeBinaryToWriter(message: NotYourTurn, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): NotYourTurn;
    static deserializeBinaryFromReader(message: NotYourTurn, reader: jspb.BinaryReader): NotYourTurn;
  }

  export namespace NotYourTurn {
    export type AsObject = {
    }
  }


  export class GameOver extends jspb.Message {
    getSentencesList(): Array<string>;
    setSentencesList(value: Array<string>): GameOver;
    clearSentencesList(): GameOver;
    addSentences(value: string, index?: number): GameOver;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GameOver.AsObject;
    static toObject(includeInstance: boolean, msg: GameOver): GameOver.AsObject;
    static serializeBinaryToWriter(message: GameOver, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GameOver;
    static deserializeBinaryFromReader(message: GameOver, reader: jspb.BinaryReader): GameOver;
  }

  export namespace GameOver {
    export type AsObject = {
      sentencesList: Array<string>,
    }
  }


  export enum StateCase { 
    STATE_NOT_SET = 0,
    UNSTARTED = 2,
    YOUR_TURN = 3,
    NOT_YOUR_TURN = 4,
    GAME_OVER = 5,
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

export class GameAlreadyExistsError extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GameAlreadyExistsError.AsObject;
  static toObject(includeInstance: boolean, msg: GameAlreadyExistsError): GameAlreadyExistsError.AsObject;
  static serializeBinaryToWriter(message: GameAlreadyExistsError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GameAlreadyExistsError;
  static deserializeBinaryFromReader(message: GameAlreadyExistsError, reader: jspb.BinaryReader): GameAlreadyExistsError;
}

export namespace GameAlreadyExistsError {
  export type AsObject = {
  }
}

export class InvalidGameParametersError extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InvalidGameParametersError.AsObject;
  static toObject(includeInstance: boolean, msg: InvalidGameParametersError): InvalidGameParametersError.AsObject;
  static serializeBinaryToWriter(message: InvalidGameParametersError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InvalidGameParametersError;
  static deserializeBinaryFromReader(message: InvalidGameParametersError, reader: jspb.BinaryReader): InvalidGameParametersError;
}

export namespace InvalidGameParametersError {
  export type AsObject = {
  }
}

export class NotYourTurnError extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NotYourTurnError.AsObject;
  static toObject(includeInstance: boolean, msg: NotYourTurnError): NotYourTurnError.AsObject;
  static serializeBinaryToWriter(message: NotYourTurnError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NotYourTurnError;
  static deserializeBinaryFromReader(message: NotYourTurnError, reader: jspb.BinaryReader): NotYourTurnError;
}

export namespace NotYourTurnError {
  export type AsObject = {
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

export class GameAlreadyOverError extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GameAlreadyOverError.AsObject;
  static toObject(includeInstance: boolean, msg: GameAlreadyOverError): GameAlreadyOverError.AsObject;
  static serializeBinaryToWriter(message: GameAlreadyOverError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GameAlreadyOverError;
  static deserializeBinaryFromReader(message: GameAlreadyOverError, reader: jspb.BinaryReader): GameAlreadyOverError;
}

export namespace GameAlreadyOverError {
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

export class GameNotFoundError extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GameNotFoundError.AsObject;
  static toObject(includeInstance: boolean, msg: GameNotFoundError): GameNotFoundError.AsObject;
  static serializeBinaryToWriter(message: GameNotFoundError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GameNotFoundError;
  static deserializeBinaryFromReader(message: GameNotFoundError, reader: jspb.BinaryReader): GameNotFoundError;
}

export namespace GameNotFoundError {
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


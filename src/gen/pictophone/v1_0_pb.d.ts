import * as jspb from 'google-protobuf'



export class Action extends jspb.Message {
  getCreateGameRequest(): CreateGameRequest | undefined;
  setCreateGameRequest(value?: CreateGameRequest): Action;
  hasCreateGameRequest(): boolean;
  clearCreateGameRequest(): Action;

  getDeleteGameRequest(): DeleteGameRequest | undefined;
  setDeleteGameRequest(value?: DeleteGameRequest): Action;
  hasDeleteGameRequest(): boolean;
  clearDeleteGameRequest(): Action;

  getMethodCase(): Action.MethodCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Action.AsObject;
  static toObject(includeInstance: boolean, msg: Action): Action.AsObject;
  static serializeBinaryToWriter(message: Action, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Action;
  static deserializeBinaryFromReader(message: Action, reader: jspb.BinaryReader): Action;
}

export namespace Action {
  export type AsObject = {
    createGameRequest?: CreateGameRequest.AsObject,
    deleteGameRequest?: DeleteGameRequest.AsObject,
  }

  export enum MethodCase { 
    METHOD_NOT_SET = 0,
    CREATE_GAME_REQUEST = 1,
    DELETE_GAME_REQUEST = 2,
  }
}

export class Response extends jspb.Message {
  getCreateGameResponse(): CreateGameResponse | undefined;
  setCreateGameResponse(value?: CreateGameResponse): Response;
  hasCreateGameResponse(): boolean;
  clearCreateGameResponse(): Response;

  getDeleteGameResponse(): DeleteGameResponse | undefined;
  setDeleteGameResponse(value?: DeleteGameResponse): Response;
  hasDeleteGameResponse(): boolean;
  clearDeleteGameResponse(): Response;

  getMethodCase(): Response.MethodCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Response.AsObject;
  static toObject(includeInstance: boolean, msg: Response): Response.AsObject;
  static serializeBinaryToWriter(message: Response, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Response;
  static deserializeBinaryFromReader(message: Response, reader: jspb.BinaryReader): Response;
}

export namespace Response {
  export type AsObject = {
    createGameResponse?: CreateGameResponse.AsObject,
    deleteGameResponse?: DeleteGameResponse.AsObject,
  }

  export enum MethodCase { 
    METHOD_NOT_SET = 0,
    CREATE_GAME_RESPONSE = 1,
    DELETE_GAME_RESPONSE = 2,
  }
}

export class QueryRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QueryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: QueryRequest): QueryRequest.AsObject;
  static serializeBinaryToWriter(message: QueryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QueryRequest;
  static deserializeBinaryFromReader(message: QueryRequest, reader: jspb.BinaryReader): QueryRequest;
}

export namespace QueryRequest {
  export type AsObject = {
  }
}

export class QueryResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QueryResponse.AsObject;
  static toObject(includeInstance: boolean, msg: QueryResponse): QueryResponse.AsObject;
  static serializeBinaryToWriter(message: QueryResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QueryResponse;
  static deserializeBinaryFromReader(message: QueryResponse, reader: jspb.BinaryReader): QueryResponse;
}

export namespace QueryResponse {
  export type AsObject = {
  }
}

export class CreateGameRequest extends jspb.Message {
  getGameId(): string;
  setGameId(value: string): CreateGameRequest;

  getShortCode(): string;
  setShortCode(value: string): CreateGameRequest;

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
    shortCode: string,
  }
}

export class CreateGameResponse extends jspb.Message {
  getGameAlreadyExistsError(): GameAlreadyExistsError | undefined;
  setGameAlreadyExistsError(value?: GameAlreadyExistsError): CreateGameResponse;
  hasGameAlreadyExistsError(): boolean;
  clearGameAlreadyExistsError(): CreateGameResponse;

  getShortCodeInUseError(): ShortCodeInUseError | undefined;
  setShortCodeInUseError(value?: ShortCodeInUseError): CreateGameResponse;
  hasShortCodeInUseError(): boolean;
  clearShortCodeInUseError(): CreateGameResponse;

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
    gameAlreadyExistsError?: GameAlreadyExistsError.AsObject,
    shortCodeInUseError?: ShortCodeInUseError.AsObject,
  }

  export enum ErrorCase { 
    ERROR_NOT_SET = 0,
    GAME_ALREADY_EXISTS_ERROR = 1,
    SHORT_CODE_IN_USE_ERROR = 2,
  }
}

export class GameAlreadyExistsError extends jspb.Message {
  getGameId(): string;
  setGameId(value: string): GameAlreadyExistsError;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GameAlreadyExistsError.AsObject;
  static toObject(includeInstance: boolean, msg: GameAlreadyExistsError): GameAlreadyExistsError.AsObject;
  static serializeBinaryToWriter(message: GameAlreadyExistsError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GameAlreadyExistsError;
  static deserializeBinaryFromReader(message: GameAlreadyExistsError, reader: jspb.BinaryReader): GameAlreadyExistsError;
}

export namespace GameAlreadyExistsError {
  export type AsObject = {
    gameId: string,
  }
}

export class ShortCodeInUseError extends jspb.Message {
  getShortCode(): string;
  setShortCode(value: string): ShortCodeInUseError;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShortCodeInUseError.AsObject;
  static toObject(includeInstance: boolean, msg: ShortCodeInUseError): ShortCodeInUseError.AsObject;
  static serializeBinaryToWriter(message: ShortCodeInUseError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShortCodeInUseError;
  static deserializeBinaryFromReader(message: ShortCodeInUseError, reader: jspb.BinaryReader): ShortCodeInUseError;
}

export namespace ShortCodeInUseError {
  export type AsObject = {
    shortCode: string,
  }
}

export class DeleteGameRequest extends jspb.Message {
  getGameId(): string;
  setGameId(value: string): DeleteGameRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteGameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteGameRequest): DeleteGameRequest.AsObject;
  static serializeBinaryToWriter(message: DeleteGameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteGameRequest;
  static deserializeBinaryFromReader(message: DeleteGameRequest, reader: jspb.BinaryReader): DeleteGameRequest;
}

export namespace DeleteGameRequest {
  export type AsObject = {
    gameId: string,
  }
}

export class DeleteGameResponse extends jspb.Message {
  getGameNotFoundError(): GameNotFoundError | undefined;
  setGameNotFoundError(value?: GameNotFoundError): DeleteGameResponse;
  hasGameNotFoundError(): boolean;
  clearGameNotFoundError(): DeleteGameResponse;

  getErrorCase(): DeleteGameResponse.ErrorCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteGameResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteGameResponse): DeleteGameResponse.AsObject;
  static serializeBinaryToWriter(message: DeleteGameResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteGameResponse;
  static deserializeBinaryFromReader(message: DeleteGameResponse, reader: jspb.BinaryReader): DeleteGameResponse;
}

export namespace DeleteGameResponse {
  export type AsObject = {
    gameNotFoundError?: GameNotFoundError.AsObject,
  }

  export enum ErrorCase { 
    ERROR_NOT_SET = 0,
    GAME_NOT_FOUND_ERROR = 1,
  }
}

export class GameNotFoundError extends jspb.Message {
  getGameId(): string;
  setGameId(value: string): GameNotFoundError;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GameNotFoundError.AsObject;
  static toObject(includeInstance: boolean, msg: GameNotFoundError): GameNotFoundError.AsObject;
  static serializeBinaryToWriter(message: GameNotFoundError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GameNotFoundError;
  static deserializeBinaryFromReader(message: GameNotFoundError, reader: jspb.BinaryReader): GameNotFoundError;
}

export namespace GameNotFoundError {
  export type AsObject = {
    gameId: string,
  }
}


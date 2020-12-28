import * as jspb from 'google-protobuf'

import * as pictophone_v1_0_pb from '../pictophone/v1_0_pb';


export class Action extends jspb.Message {
  getCreateGameRequest(): pictophone_v1_0_pb.CreateGameRequest | undefined;
  setCreateGameRequest(value?: pictophone_v1_0_pb.CreateGameRequest): Action;
  hasCreateGameRequest(): boolean;
  clearCreateGameRequest(): Action;

  getDeleteGameRequest(): pictophone_v1_0_pb.DeleteGameRequest | undefined;
  setDeleteGameRequest(value?: pictophone_v1_0_pb.DeleteGameRequest): Action;
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
    createGameRequest?: pictophone_v1_0_pb.CreateGameRequest.AsObject,
    deleteGameRequest?: pictophone_v1_0_pb.DeleteGameRequest.AsObject,
  }

  export enum MethodCase { 
    METHOD_NOT_SET = 0,
    CREATE_GAME_REQUEST = 1,
    DELETE_GAME_REQUEST = 2,
  }
}

export class Response extends jspb.Message {
  getCreateGameResponse(): pictophone_v1_0_pb.CreateGameResponse | undefined;
  setCreateGameResponse(value?: pictophone_v1_0_pb.CreateGameResponse): Response;
  hasCreateGameResponse(): boolean;
  clearCreateGameResponse(): Response;

  getDeleteGameResponse(): pictophone_v1_0_pb.DeleteGameResponse | undefined;
  setDeleteGameResponse(value?: pictophone_v1_0_pb.DeleteGameResponse): Response;
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
    createGameResponse?: pictophone_v1_0_pb.CreateGameResponse.AsObject,
    deleteGameResponse?: pictophone_v1_0_pb.DeleteGameResponse.AsObject,
  }

  export enum MethodCase { 
    METHOD_NOT_SET = 0,
    CREATE_GAME_RESPONSE = 1,
    DELETE_GAME_RESPONSE = 2,
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

export class GetGameRequest extends jspb.Message {
  getGameId(): string;
  setGameId(value: string): GetGameRequest;

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
  }
}

export class GetGameResponse extends jspb.Message {
  getGame(): Game | undefined;
  setGame(value?: Game): GetGameResponse;
  hasGame(): boolean;
  clearGame(): GetGameResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetGameResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetGameResponse): GetGameResponse.AsObject;
  static serializeBinaryToWriter(message: GetGameResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetGameResponse;
  static deserializeBinaryFromReader(message: GetGameResponse, reader: jspb.BinaryReader): GetGameResponse;
}

export namespace GetGameResponse {
  export type AsObject = {
    game?: Game.AsObject,
  }
}

export class Game extends jspb.Message {
  getShortCode(): string;
  setShortCode(value: string): Game;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Game.AsObject;
  static toObject(includeInstance: boolean, msg: Game): Game.AsObject;
  static serializeBinaryToWriter(message: Game, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Game;
  static deserializeBinaryFromReader(message: Game, reader: jspb.BinaryReader): Game;
}

export namespace Game {
  export type AsObject = {
    shortCode: string,
  }
}


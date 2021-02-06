/**
 * @fileoverview gRPC-Web generated client stub for pictophone.v0_1
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck


import * as grpcWeb from 'grpc-web';

import * as pictophone_v0_1_pb from '../pictophone/v0_1_pb';


export class PictophoneClient {
  client_: grpcWeb.AbstractClientBase;
  hostname_: string;
  credentials_: null | { [index: string]: string; };
  options_: null | { [index: string]: any; };

  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; }) {
    if (!options) options = {};
    if (!credentials) credentials = {};
    options['format'] = 'text';

    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname;
    this.credentials_ = credentials;
    this.options_ = options;
  }

  methodInfoJoinGame = new grpcWeb.AbstractClientBase.MethodInfo(
    pictophone_v0_1_pb.JoinGameResponse,
    (request: pictophone_v0_1_pb.JoinGameRequest) => {
      return request.serializeBinary();
    },
    pictophone_v0_1_pb.JoinGameResponse.deserializeBinary
  );

  joinGame(
    request: pictophone_v0_1_pb.JoinGameRequest,
    metadata: grpcWeb.Metadata | null): Promise<pictophone_v0_1_pb.JoinGameResponse>;

  joinGame(
    request: pictophone_v0_1_pb.JoinGameRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: pictophone_v0_1_pb.JoinGameResponse) => void): grpcWeb.ClientReadableStream<pictophone_v0_1_pb.JoinGameResponse>;

  joinGame(
    request: pictophone_v0_1_pb.JoinGameRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: pictophone_v0_1_pb.JoinGameResponse) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/pictophone.v0_1.Pictophone/JoinGame',
        request,
        metadata || {},
        this.methodInfoJoinGame,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/pictophone.v0_1.Pictophone/JoinGame',
    request,
    metadata || {},
    this.methodInfoJoinGame);
  }

  methodInfoStartGame = new grpcWeb.AbstractClientBase.MethodInfo(
    pictophone_v0_1_pb.StartGameResponse,
    (request: pictophone_v0_1_pb.StartGameRequest) => {
      return request.serializeBinary();
    },
    pictophone_v0_1_pb.StartGameResponse.deserializeBinary
  );

  startGame(
    request: pictophone_v0_1_pb.StartGameRequest,
    metadata: grpcWeb.Metadata | null): Promise<pictophone_v0_1_pb.StartGameResponse>;

  startGame(
    request: pictophone_v0_1_pb.StartGameRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: pictophone_v0_1_pb.StartGameResponse) => void): grpcWeb.ClientReadableStream<pictophone_v0_1_pb.StartGameResponse>;

  startGame(
    request: pictophone_v0_1_pb.StartGameRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: pictophone_v0_1_pb.StartGameResponse) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/pictophone.v0_1.Pictophone/StartGame',
        request,
        metadata || {},
        this.methodInfoStartGame,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/pictophone.v0_1.Pictophone/StartGame',
    request,
    metadata || {},
    this.methodInfoStartGame);
  }

  methodInfoMakeMove = new grpcWeb.AbstractClientBase.MethodInfo(
    pictophone_v0_1_pb.MakeMoveResponse,
    (request: pictophone_v0_1_pb.MakeMoveRequest) => {
      return request.serializeBinary();
    },
    pictophone_v0_1_pb.MakeMoveResponse.deserializeBinary
  );

  makeMove(
    request: pictophone_v0_1_pb.MakeMoveRequest,
    metadata: grpcWeb.Metadata | null): Promise<pictophone_v0_1_pb.MakeMoveResponse>;

  makeMove(
    request: pictophone_v0_1_pb.MakeMoveRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: pictophone_v0_1_pb.MakeMoveResponse) => void): grpcWeb.ClientReadableStream<pictophone_v0_1_pb.MakeMoveResponse>;

  makeMove(
    request: pictophone_v0_1_pb.MakeMoveRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: pictophone_v0_1_pb.MakeMoveResponse) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/pictophone.v0_1.Pictophone/MakeMove',
        request,
        metadata || {},
        this.methodInfoMakeMove,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/pictophone.v0_1.Pictophone/MakeMove',
    request,
    metadata || {},
    this.methodInfoMakeMove);
  }

  methodInfoGetGame = new grpcWeb.AbstractClientBase.MethodInfo(
    pictophone_v0_1_pb.GetGameResponse,
    (request: pictophone_v0_1_pb.GetGameRequest) => {
      return request.serializeBinary();
    },
    pictophone_v0_1_pb.GetGameResponse.deserializeBinary
  );

  getGame(
    request: pictophone_v0_1_pb.GetGameRequest,
    metadata?: grpcWeb.Metadata) {
    return this.client_.serverStreaming(
      this.hostname_ +
        '/pictophone.v0_1.Pictophone/GetGame',
      request,
      metadata || {},
      this.methodInfoGetGame);
  }

}


/**
 * @fileoverview gRPC-Web generated client stub for pictophone.v1_1
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck


import * as grpcWeb from 'grpc-web';

import * as pictophone_v1_0_pb from '../pictophone/v1_0_pb';
import * as pictophone_v1_1_pb from '../pictophone/v1_1_pb';


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

  methodInfoCreateGame = new grpcWeb.AbstractClientBase.MethodInfo(
    pictophone_v1_0_pb.CreateGameResponse,
    (request: pictophone_v1_0_pb.CreateGameRequest) => {
      return request.serializeBinary();
    },
    pictophone_v1_0_pb.CreateGameResponse.deserializeBinary
  );

  createGame(
    request: pictophone_v1_0_pb.CreateGameRequest,
    metadata: grpcWeb.Metadata | null): Promise<pictophone_v1_0_pb.CreateGameResponse>;

  createGame(
    request: pictophone_v1_0_pb.CreateGameRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: pictophone_v1_0_pb.CreateGameResponse) => void): grpcWeb.ClientReadableStream<pictophone_v1_0_pb.CreateGameResponse>;

  createGame(
    request: pictophone_v1_0_pb.CreateGameRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: pictophone_v1_0_pb.CreateGameResponse) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/pictophone.v1_1.Pictophone/CreateGame',
        request,
        metadata || {},
        this.methodInfoCreateGame,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/pictophone.v1_1.Pictophone/CreateGame',
    request,
    metadata || {},
    this.methodInfoCreateGame);
  }

  methodInfoDeleteGame = new grpcWeb.AbstractClientBase.MethodInfo(
    pictophone_v1_0_pb.DeleteGameResponse,
    (request: pictophone_v1_0_pb.DeleteGameRequest) => {
      return request.serializeBinary();
    },
    pictophone_v1_0_pb.DeleteGameResponse.deserializeBinary
  );

  deleteGame(
    request: pictophone_v1_0_pb.DeleteGameRequest,
    metadata: grpcWeb.Metadata | null): Promise<pictophone_v1_0_pb.DeleteGameResponse>;

  deleteGame(
    request: pictophone_v1_0_pb.DeleteGameRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: pictophone_v1_0_pb.DeleteGameResponse) => void): grpcWeb.ClientReadableStream<pictophone_v1_0_pb.DeleteGameResponse>;

  deleteGame(
    request: pictophone_v1_0_pb.DeleteGameRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: pictophone_v1_0_pb.DeleteGameResponse) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/pictophone.v1_1.Pictophone/DeleteGame',
        request,
        metadata || {},
        this.methodInfoDeleteGame,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/pictophone.v1_1.Pictophone/DeleteGame',
    request,
    metadata || {},
    this.methodInfoDeleteGame);
  }

  methodInfoGetGame = new grpcWeb.AbstractClientBase.MethodInfo(
    pictophone_v1_1_pb.GetGameResponse,
    (request: pictophone_v1_1_pb.GetGameRequest) => {
      return request.serializeBinary();
    },
    pictophone_v1_1_pb.GetGameResponse.deserializeBinary
  );

  getGame(
    request: pictophone_v1_1_pb.GetGameRequest,
    metadata?: grpcWeb.Metadata) {
    return this.client_.serverStreaming(
      this.hostname_ +
        '/pictophone.v1_1.Pictophone/GetGame',
      request,
      metadata || {},
      this.methodInfoGetGame);
  }

}


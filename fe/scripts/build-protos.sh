#!/bin/bash

# BASEDIR=$(dirname "$0")
# cd ${BASEDIR}/../

OUT_DIR=src/gen

PROTO_DIR=../be/proto
mkdir -p ${OUT_DIR}

protoc -I=$PROTO_DIR/client $PROTO_DIR/client/pictophone/v0_1.proto \
    --js_out=import_style=commonjs:$OUT_DIR \
    --grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUT_DIR

# # TypeScript code generation
# yarn run grpc_tools_node_protoc \
#     --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
#     --ts_out=${PROTO_DEST} \
#     -I ../be/proto/ \
#     ../be/proto/pictophone/v0_1.proto

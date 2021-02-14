#[derive(thiserror::Error, Debug)]
#[error("wrong oneof selected: wanted {wanted}, got {got}")]
pub struct WrongOneofSelected {
    wanted: &'static str,
    got: String,
}

macro_rules! oneof_convert {
    ($container_type:ident, $oneof_field:ident, $($elem_type:ident, )*) => {
        oneof_convert!($container_type, $oneof_field, $(($elem_type, $elem_type), )*);
    };
    ($container_type:ident, $oneof_field:ident, $(($elem_type:ty, $elem_field_name:ident), )*) => {
        $(
            paste::paste!{
                impl From<$elem_type> for $container_type {
                    fn from(e: $elem_type) -> Self {
                        Self {
                            $oneof_field: Some([<$container_type:snake>] ::[<$oneof_field:camel>]::$elem_field_name(e)),
                        }
                    }
                }

                impl std::convert::TryFrom<$container_type> for $elem_type {
                    type Error = $crate::proto::WrongOneofSelected;
                    fn try_from(value: $container_type) -> Result<Self, Self::Error> {
                        match value.$oneof_field {
                            Some([<$container_type:snake>] ::[<$oneof_field:camel>]::$elem_field_name(e)) => Ok(e),
                            _ => Err($crate::proto::WrongOneofSelected{
                                wanted: stringify!([<$container_type:snake>] ::[<$oneof_field:camel>]::$elem_field_name),
                                got:format!("{:?}", value),
                            }),
                        }
                    }
                }
            }
        )*
    };
}

macro_rules! oneof_enum_convert {
    ($enum_type:ty, $($elem_type:ident, )+) => {
        oneof_enum_convert!($enum_type, $(($elem_type, $elem_type), )+);
    };
    ($enum_type:ty, $(($elem_type:ty, $elem_field_name:ident), )*) => {
        paste::paste!{
            $(
                impl From<$elem_type> for $enum_type {
                    fn from(e: $elem_type) -> Self {
                        $enum_type::$elem_field_name(e)
                    }
                }

                impl std::convert::TryFrom<$enum_type> for $elem_type {
                    type Error = $crate::proto::WrongOneofSelected;
                    fn try_from(value: $enum_type) -> Result<Self, Self::Error> {
                        match value {
                            $enum_type :: $elem_field_name(e) => Ok(e),
                            _ => Err($crate::proto::WrongOneofSelected{
                                wanted: stringify!($enum_type :: $elem_field_name),
                                got:format!("{:?}", value),
                            }),
                        }
                    }
                }
            )*
        }
    };
}

pub mod dolt {
    tonic::include_proto!("dolt");

    oneof_convert!(Request, method, ActionRequest, QueryRequest,);
    oneof_convert!(Response, method, ActionResponse, QueryResponse,);

    macro_rules! typed_bytes {
        ($name:ident) => {
            paste::paste! {
                #[derive(Debug, Clone)]
                pub struct $name(Vec<u8>);

                impl $name {
                    pub fn new(bytes: Vec<u8>) -> Self {
                        Self(bytes)
                    }

                    pub fn into_bytes(self) -> Vec<u8> {
                        self.0
                    }
                }
            }
        };
    }

    typed_bytes!(ActionRequestBytes);
    typed_bytes!(ActionResponseBytes);
    typed_bytes!(QueryRequestBytes);
    typed_bytes!(QueryResponseBytes);

    #[tonic::async_trait]
    pub trait Server: Send + Sync + 'static {
        async fn handle_action(
            &self,
            action: ActionRequestBytes,
            metadata: tonic::metadata::MetadataMap,
        ) -> Result<ActionResponseBytes, anyhow::Error>;

        type QueryStream: futures::Stream<Item = Result<QueryResponseBytes, anyhow::Error>>
            + Send
            + Sync;

        async fn handle_query(
            &self,
            query: QueryRequestBytes,
            metadata: tonic::metadata::MetadataMap,
        ) -> Result<Self::QueryStream, anyhow::Error>;
    }
}

pub mod pictophone {
    pub mod messages {
        tonic::include_proto!("pictophone.messages");
    }

    pub mod log {
        tonic::include_proto!("pictophone.log");

        macro_rules! oneof_log_enum_convert {
            ($enum_type:ty, $($elem_type:ident, )+) => {
                oneof_enum_convert!($enum_type, $((super::messages::$elem_type, $elem_type), )+);
            };
        }

        oneof_log_enum_convert!(
            action_request::Method,
            JoinGameRequest,
            StartGameRequest,
            MakeMoveRequest,
        );
        oneof_log_enum_convert!(
            action_response::Method,
            JoinGameResponse,
            StartGameResponse,
            MakeMoveResponse,
        );

        oneof_log_enum_convert!(query_request::Method, GetGameRequest,);
        oneof_log_enum_convert!(query_response::Method, GetGameResponse,);

        macro_rules! serialize {
            ($name:ident) => {
                paste::paste!{
                    impl std::convert::TryFrom<$name> for super::super::dolt::[<$name Bytes>] {
                        type Error = prost::EncodeError;

                        fn try_from(value: $name) -> Result<Self, Self::Error> {
                            use prost::Message;
                            let mut bytes = vec![];
                            value.encode(&mut bytes)?;
                            Ok(Self::new(bytes))
                        }
                    }


                    impl std::convert::TryFrom<super::super::dolt::[<$name Bytes>]> for $name  {
                        type Error = prost::DecodeError;

                        fn try_from(value: super::super::dolt::[<$name Bytes>]) -> Result<Self, Self::Error> {
                            use prost::Message;
                            Self::decode(value.into_bytes().as_slice())
                        }
                    }
                }
            };
        }

        serialize!(ActionRequest);
        serialize!(ActionResponse);
        serialize!(QueryRequest);
        serialize!(QueryResponse);
    }
    pub mod v0_1 {
        use super::messages::*;

        tonic::include_proto!("pictophone.v0_1");

        fn into_internal(error: anyhow::Error) -> tonic::Status {
            tonic::Status::internal(format!("Unexpected error: {:#}", &error))
        }

        #[tonic::async_trait]
        impl<T: super::super::dolt::Server> pictophone_server::Pictophone for T {
            async fn join_game(
                &self,
                request: tonic::Request<JoinGameRequest>,
            ) -> Result<tonic::Response<JoinGameResponse>, tonic::Status> {
                use anyhow::Context;
                use std::convert::TryFrom;
                use std::convert::TryInto;
                let metadata = request.metadata().to_owned();

                let action_request_bytes = super::log::ActionRequest {
                    method: Some(request.into_inner().into()),
                }
                .try_into()
                .context("while deserializing ActionRequest")
                .map_err(into_internal)?;

                let response = self
                    .handle_action(action_request_bytes, metadata)
                    .await
                    .context("while calling handle_action")
                    .map_err(into_internal)?;

                let response = super::log::ActionResponse::try_from(response)
                    .context("while parsing action_response")
                    .map_err(into_internal)?;

                Ok(tonic::Response::new(
                    response
                        .method
                        .unwrap()
                        .try_into()
                        .context("while selecting method")
                        .map_err(into_internal)?,
                ))
            }

            async fn start_game(
                &self,
                request: tonic::Request<StartGameRequest>,
            ) -> Result<tonic::Response<StartGameResponse>, tonic::Status> {
                use anyhow::Context;
                use std::convert::TryFrom;
                use std::convert::TryInto;
                let metadata = request.metadata().to_owned();

                let action_request_bytes = super::log::ActionRequest {
                    method: Some(request.into_inner().into()),
                }
                .try_into()
                .context("while deserializing ActionRequest")
                .map_err(into_internal)?;

                let response = self
                    .handle_action(action_request_bytes, metadata)
                    .await
                    .context("while calling handle_action")
                    .map_err(into_internal)?;

                let response = super::log::ActionResponse::try_from(response)
                    .context("while parsing action_response")
                    .map_err(into_internal)?;

                Ok(tonic::Response::new(
                    response
                        .method
                        .unwrap()
                        .try_into()
                        .context("while selecting method")
                        .map_err(into_internal)?,
                ))
            }

            async fn make_move(
                &self,
                request: tonic::Request<MakeMoveRequest>,
            ) -> Result<tonic::Response<MakeMoveResponse>, tonic::Status> {
                use anyhow::Context;
                use std::convert::TryFrom;
                use std::convert::TryInto;
                let metadata = request.metadata().to_owned();

                let action_request_bytes = super::log::ActionRequest {
                    method: Some(request.into_inner().into()),
                }
                .try_into()
                .context("while serializing ActionRequest")
                .map_err(into_internal)?;

                let response = self
                    .handle_action(action_request_bytes, metadata)
                    .await
                    .context("while calling handle_action")
                    .map_err(into_internal)?;

                let response = super::log::ActionResponse::try_from(response)
                    .context("while parsing action_response")
                    .map_err(into_internal)?;

                Ok(tonic::Response::new(
                    response
                        .method
                        .unwrap()
                        .try_into()
                        .context("while selecting method")
                        .map_err(into_internal)?,
                ))
            }

            type GetGameStream = std::pin::Pin<
                Box<
                    dyn futures::Stream<Item = Result<GetGameResponse, tonic::Status>>
                        + Send
                        + Sync,
                >,
            >;

            async fn get_game(
                &self,
                request: tonic::Request<GetGameRequest>,
            ) -> Result<tonic::Response<Self::GetGameStream>, tonic::Status> {
                use anyhow::Context;
                use futures::StreamExt;
                use futures::TryStreamExt;
                use std::convert::TryFrom;
                use std::convert::TryInto;
                let metadata = request.metadata().to_owned();

                let query_request_bytes = super::log::QueryRequest {
                    method: Some(request.into_inner().into()),
                }
                .try_into()
                .context("while serializing QueryRequest")
                .map_err(into_internal)?;

                let stream = self
                    .handle_query(query_request_bytes,
                        metadata,
                    )
                    .await
                    .map_err(into_internal)?
                    .map(|response| -> Result<GetGameResponse, anyhow::Error> {

                        let response = super::log::QueryResponse::try_from(response?)
                        .context("while parsing query_response")
                        .map_err(into_internal)?;

    
                    Ok(
                        response
                            .method
                            .unwrap()
                            .try_into()
                            .context("while selecting method")
                            .map_err(into_internal)?,)
                    })
                    .map_err(|e| tonic::Status::internal(format!("Internal error: {:#}", e)));

                Ok(tonic::Response::new(Box::pin(stream)))
            }
        }
    }
}

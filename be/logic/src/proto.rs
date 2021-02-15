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
            )*
        }
    };
}

pub mod messages {
    include!(concat!(env!("OUT_DIR"), "/pictophone.messages.rs"));

    oneof_enum_convert!(
        create_game_response::Error,
        UnknownError,
        GameAlreadyExistsError,
    );

    oneof_enum_convert!(
        start_game_response::Error,
        UnknownError,
        PlayerNotInGameError,
        InvalidGameParametersError,
    );

    oneof_enum_convert!(
        make_move_response::Error,
        UnknownError,
        NotYourTurnError,
        GameNotStartedError,
        GameAlreadyOverError,
    );

    oneof_enum_convert!(get_game_response::Error, UnknownError, PlayerNotInGameError,);
}

pub mod log {
    include!(concat!(env!("OUT_DIR"), "/pictophone.log.rs"));

    macro_rules! oneof_log_enum_convert {
        ($enum_type:ty, $($elem_type:ident, )+) => {
            oneof_enum_convert!($enum_type, $((super::messages::$elem_type, $elem_type), )+);
        };
    }

    oneof_log_enum_convert!(
        action_request::Method,
        CreateGameRequest,
        JoinGameRequest,
        StartGameRequest,
        MakeMoveRequest,
    );
    oneof_log_enum_convert!(
        action_response::Method,
        CreateGameResponse,
        JoinGameResponse,
        StartGameResponse,
        MakeMoveResponse,
    );

    oneof_log_enum_convert!(query_request::Method, GetGameRequest,);
    oneof_log_enum_convert!(query_response::Method, GetGameResponse,);
}

pub mod dolt {
    include!(concat!(env!("OUT_DIR"), "/dolt.rs"));

    oneof_enum_convert!(request::Method, ActionRequest, QueryRequest,);
    oneof_enum_convert!(response::Method, ActionResponse, QueryResponse,);
}

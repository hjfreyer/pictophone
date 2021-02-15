use crate::proto::dolt as dpb;
use crate::proto::log as lpb;
use crate::proto::messages as api;

macro_rules! action_decl {
    ($action:ident) => {
        paste::paste! {
            fn $action(
                state: Option<Self::State>,
                request: api::[<$action:camel Request>],
            ) -> Result<Option<Self::State>, api:: [<$action _response>] ::Error>;
        }
    };
}

pub trait Handler {
    type State: serde::de::DeserializeOwned + serde::Serialize;

    action_decl!(create_game);
    action_decl!(join_game);
    action_decl!(start_game);
    action_decl!(make_move);

    fn get_game(
        state: Option<Self::State>,
        request: api::GetGameRequest,
    ) -> Result<api::Game, api::get_game_response::Error>;
}

pub fn main<H: Handler>() -> Result<(), anyhow::Error> {
    use prost::Message;
    use std::io::{Read, Write};

    let mut req_buf = vec![];
    let _ = std::io::stdin().read_to_end(&mut req_buf)?;

    let request = dpb::Request::decode(req_buf.as_slice())?;

    let response_method = match request.method.unwrap() {
        dpb::request::Method::ActionRequest(request) => handle_action::<H>(request)?.into(),
        dpb::request::Method::QueryRequest(request) => handle_query::<H>(request)?.into(),
    };

    let response = dpb::Response {
        method: Some(response_method),
    };

    let mut resp_buf = vec![];
    let () = response.encode(&mut resp_buf)?;
    let _ = std::io::stdout().lock().write(&resp_buf)?;
    Ok(())
}

fn handle_action<H: Handler>(request: dpb::ActionRequest) -> anyhow::Result<dpb::ActionResponse> {
    use prost::Message;

    let state = request
        .state
        .map(|state| serde_json::from_slice(state.serialized.as_slice()))
        .transpose()?;
    let action_request = lpb::ActionRequest::decode(request.action.as_slice())?;

    let (new_state, response) = handle_parsed_action::<H>(state, action_request)?;

    let mut response_buf = vec![];
    let () = response.encode(&mut response_buf)?;
    Ok(dpb::ActionResponse {
        state: new_state
            .map(|state| -> anyhow::Result<dpb::State> {
                Ok(dpb::State {
                    serialized: serde_json::to_vec(&state)?,
                })
            })
            .transpose()?,
        response: response_buf,
    })
}

fn handle_query<H: Handler>(request: dpb::QueryRequest) -> anyhow::Result<dpb::QueryResponse> {
    use prost::Message;

    let state = request
        .state
        .map(|state| serde_json::from_slice(state.serialized.as_slice()))
        .transpose()?;
    let query_request = lpb::QueryRequest::decode(request.query.as_slice())?;

    let response = handle_parsed_query::<H>(state, query_request)?;

    let mut response_buf = vec![];
    let () = response.encode(&mut response_buf)?;
    Ok(dpb::QueryResponse {
        response: response_buf,
    })
}

fn handle_parsed_action<H: Handler>(
    state: Option<H::State>,
    request: lpb::ActionRequest,
) -> anyhow::Result<(Option<H::State>, lpb::ActionResponse)> {
    let (new_state, response): (Option<H::State>, lpb::action_response::Method) =
        match request.method.unwrap() {
            lpb::action_request::Method::CreateGameRequest(request) => {
                let (state, error) = H::create_game(state, request)
                    .map(|state| (state, None))
                    .unwrap_or_else(|error| (None, Some(error)));
                (state, api::CreateGameResponse { error }.into())
            }
            lpb::action_request::Method::JoinGameRequest(request) => {
                let (state, error) = H::join_game(state, request)
                    .map(|state| (state, None))
                    .unwrap_or_else(|error| (None, Some(error)));
                (state, api::JoinGameResponse { error }.into())
            }
            lpb::action_request::Method::StartGameRequest(request) => {
                let (state, error) = H::start_game(state, request)
                    .map(|state| (state, None))
                    .unwrap_or_else(|error| (None, Some(error)));
                (state, api::StartGameResponse { error }.into())
            }
            lpb::action_request::Method::MakeMoveRequest(request) => {
                let (state, error) = H::make_move(state, request)
                    .map(|state| (state, None))
                    .unwrap_or_else(|error| (None, Some(error)));
                (state, api::MakeMoveResponse { error }.into())
            }
        };
    Ok((
        new_state,
        lpb::ActionResponse {
            method: Some(response),
        }
        .into(),
    ))
}

fn handle_parsed_query<H: Handler>(
    state: Option<H::State>,
    request: lpb::QueryRequest,
) -> anyhow::Result<lpb::QueryResponse> {
    let method = match request.method.unwrap() {
        lpb::query_request::Method::GetGameRequest(request) => H::get_game(state, request)
            .map(|game| api::GetGameResponse {
                game: Some(game),
                error: None,
            })
            .unwrap_or_else(|error| api::GetGameResponse {
                game: None,
                error: Some(error),
            })
            .into(),
    };

    Ok(lpb::QueryResponse {
        method: Some(method),
    })
}

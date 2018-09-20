import * as actions from './actions';
import * as status from './status';
import * as states from './states';

export type Id = {
  collection: string;
  id: string;
}

export interface DB {
  get(id: Id): any | null;
  update(updates: Mutation[]): status.Status;
}

export type Update = {
  kind: 'UPDATE';
  collection: string;
  id: string;
  state: any;
}

export type Insert = {
  kind: 'INSERT';
  collection: string;
  id: string;
  state: any;
};

export type Mutation = Update | Insert;

type CreateRequest = {
  kind: 'CREATE';
  collection: string;
};

type CreateResponse = {
  kind: 'CREATE';
  collection: string;
  id: string;
}

type GetRequest = {
  kind: 'GET';
  collection: string;
  id: string;
}

type GetResponse = {
  kind: 'GET';
  collection: string;
  id: string;
  state: any | null;
}

type Request = CreateRequest | GetRequest;
type Response = CreateResponse | GetResponse;

type Requests = { [id: string]: Request }
type Responses = { [id: string]: Response }
//
// type IdBundle = { [kind: string]: states.Id<states.Kind> };
// type StateBundle = { [kind: string]: states.State };

type GetMore = {
  kind: 'GET_MORE';
  requests: Requests;
};

type Finish = {
  kind: 'FINISH';
  result: any;
  action: actions.Action;
  updates: { [id: string]: any };
};


type ActorResult = GetMore | Finish;
type Actor = (responses: Responses) => ActorResult;

function mkDefault<K extends states.Kind>(k: K): states.ForKind<K> {
  const defaults: { [K in states.Kind]: states.ForKind<K> } = {
    [states.ROOM]: { kind: states.ROOM, players: [] },
    [states.PLAYER]: { kind: states.PLAYER, roomId: null },
    [states.GAME]: {
      kind: states.GAME,
      players: [],
      permutation: [],
    },
  };
  return defaults[k];
}

function mkId(): string {
  return Math.random().toString(36).substring(7);
}

function getAll(db: DB, requests: Requests): Responses {
  const res: Responses = {};

  for (const key in requests) {
    const req = requests[key];
    switch (req.kind) {
      case 'CREATE':
        res[key] = {
          kind: "CREATE",
          collection: req.collection,
          id: mkId(),
        };
        break;

      case 'GET':
        res[key] = {
          kind: "GET",
          collection: req.collection,
          id: req.id,
          state: db.get({ collection: req.collection, id: req.id }),
        };
        break;
    }
  }

  return res;
}

export function apply(db: DB, actor: Actor): any {

  while (true) {
    const res: { result: any, updates: Mutation[] } = (function() {
      let lastRequests: Requests = {};

      while (true) {
        let responses = getAll(db, lastRequests);
        let res = actor(responses);
        switch (res.kind) {
          case 'GET_MORE':
            lastRequests = res.requests;
            continue;

          case 'FINISH': {
            const updates: Mutation[] = [];
            for (let key in responses) {
              if (!(key in res.updates)) {
                throw 'missing key!';
              }
              if (responses[key].kind == "CREATE") {
                updates.push({
                  kind: "INSERT",
                  collection: responses[key].collection,
                  id: responses[key].id,
                  state: res.updates[key],
                });
              } else {
                updates.push({
                  kind: "UPDATE",
                  collection: responses[key].collection,
                  id: responses[key].id,
                  state: res.updates[key],
                });
              }
            }
            return {
              result: res.result,
              updates: updates,
            };
          }
        }
      }
    }());

    const stat = db.update(res.updates);
    if (status.isOk(stat)) {
      return res.result;
    }
  }
}

function addUnique(arr: string[], val: string): string[] {
  return arr.indexOf(val) == -1 ? [...arr, val] : arr;
}

export function getActor(a: actions.Action): Actor {
  function curry<A>(fn: (action: A, responses: Responses) => ActorResult, action: A) {
    return (requests: Responses) => fn(action, requests);
  }

  switch (a.kind) {
    case actions.JOIN_ROOM: return curry(joinRoomAction, a);
    case actions.CREATE_GAME: return curry(createGameAction, a);
  }
}


export function playerId(id: string): Id {
  return { collection: "players", id };
}

export function roomId(id: string): Id {
  return { collection: "rooms", id };
}

export function gameId(id: string): Id {
  return { collection: "games", id };
}

function getState<K extends states.Kind>(kind: K, obj: any): states.ForKind<K> {
  const getResp = obj as GetResponse;
  if (getResp.state === null) {
    return mkDefault(kind);
  }
  return getResp.state as states.ForKind<K>;
}

function joinRoomAction(a: actions.JoinRoom, responses: Responses): ActorResult {
  if (!('player' in responses)) {
    return {
      kind: 'GET_MORE',
      requests: {
        player: {
          kind: "GET",
          ...playerId(a.playerId),
        },
        newRoom: {
          kind: "GET",
          ...roomId(a.roomId),
        }
      }
    }
  }

  const player = getState(states.PLAYER, responses.player);

  if (player.roomId == a.roomId) {
    console.log("already here");
    // Already in room.
    return {
      kind: 'FINISH',
      action: a,
      result: { status: status.ok() },
      updates: { player: player },
    };
  }

  if (player.roomId != null && !('oldRoom' in responses)) {
    return {
      kind: 'GET_MORE',
      requests: {
        player: { kind: "GET", ...playerId(a.playerId) },
        newRoom: { kind: "GET", ...roomId(a.roomId) },
        oldRoom: { kind: "GET", ...roomId(player.roomId) },
      },
    }
  }

  const newRoom = getState(states.ROOM, responses.newRoom);

  let res: any = {};

  if (player.roomId != null) {
    const oldRoom = getState(states.ROOM, responses.oldRoom);

    const playerIdx = oldRoom.players.indexOf(a.playerId);
    if (playerIdx == -1) {
      return {
        kind: 'FINISH',
        action: a,
        result: { status: status.internal() },
        updates: { player, newRoom, oldRoom },
      };
    }
    let newOldRoom: states.RoomState = {
      ...oldRoom,
      players: [
        ...oldRoom.players.slice(0, playerIdx),
        ...oldRoom.players.slice(playerIdx + 1),
      ],
    };
    res.oldRoom = newOldRoom;
  }

  res.player = {
    ...player,
    roomId: a.roomId,
  };

  res.newRoom = {
    ...newRoom,
    players: addUnique(newRoom.players, a.playerId),
  }

  return {
    kind: 'FINISH',
    action: a,
    result: { status: status.ok() },
    updates: res,
  };
}

function createGameAction(a: actions.CreateGame, responses: Responses): ActorResult {
  if (!('room' in responses)) {
    return {
      kind: 'GET_MORE',
      requests: {
        room: { kind: "GET", ...roomId(a.roomId) },
        game: { kind: "CREATE", collection: "games" },
      }
    }
  }

  const room = getState(states.ROOM, responses.room);
  const gameId = (responses.game as CreateResponse).id;
  if (room.players.length === 0) {
    return {
      kind: 'FINISH',
      action: a,
      result: { status: status.notFound() },
      updates: { room, game: null },
    }
  }
  return {
    kind: 'FINISH',
    action: a,
    result: { status: status.ok() },
    updates: { room, game: null }
  };
}

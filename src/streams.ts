//import * as actions from './actions';
import * as status from './status';


export const JoinRoom = 'JOIN_ROOM';
type JoinRoom = typeof JoinRoom;

export type ActionMap = {
  [JoinRoom]: JoinRoomAction;
}

type ActionKind = keyof ActionMap;
export type Action = ActionMap[ActionKind];

type JoinRoomAction = {
  kind: JoinRoom;
  playerId: string;
  roomId: string;
};

export const Room = 'ROOM';
export type Room = typeof Room;
export const Player = 'PLAYER';
export type Player = typeof Player;

export type StateMap = {
  [Room]: RoomState;
  [Player]: PlayerState;
}

export type State = StateMap[keyof StateMap];

export type StreamKinds = keyof StateMap;

export type RoomState = {
  kind: Room;
  players: string[];
};

export type PlayerState = {
  kind: Player;
  roomId: string | null;
};

export type Id<K> = {
  kind: K;
  id: string;
};

export type Update<S extends State> = {
  id: Id<S['kind']>;
  state: S;
}


export interface DB {
  get<K extends StreamKinds>(id: Id<K>): StateMap[K] | null;
  update(action: Action, updates: Update<State>[]): status.Status;
}

type IdBundle = { [kind: string]: Id<StreamKinds> };
type StateBundle = { [kind: string]: State };

type GetMore = {
  kind: 'GET_MORE';
  ids: IdBundle;
};

type Commit = {
  kind: 'COMMIT';
  action: Action;
  updates: StateBundle;
};

type Error = {
  kind: 'ERROR';
  status: status.Status;
};

type ActorResult = GetMore | Commit | Error;
type Actor = (state: StateBundle) => ActorResult;

function mkDefault<K extends StreamKinds>(k: K): StateMap[K] {
  switch (k as StreamKinds) {
    case Room: return { kind: Room, players: [] }
    case Player: return { kind: Player, roomId: null }
  }
}

function getAll(db: DB, ids: IdBundle): { [key: string]: State } {
  const res: StateBundle = {};

  for (const key in ids) {
    res[key] = db.get(ids[key]) || mkDefault(ids[key].kind);
  }

  return res;
}

export function apply(db: DB, actor: Actor): status.Status {
  let lastRequest: IdBundle | null = null;
  let objs = {};

  while (true) {
    let res = actor(objs);

    switch (res.kind) {
      case 'GET_MORE':
        lastRequest = res.ids;
        objs = getAll(db, res.ids);
        continue;

      case 'ERROR':
        return res.status;

      case 'COMMIT': {
        const updates: Update<State>[] = [];
        for (let key in lastRequest!) {
          updates.push({
            id: lastRequest![key],
            state: res.updates[key],
          });
        }
        return db.update(res.action, updates);
      }
    }
  }
}

function addUnique(arr: string[], val: string): string[] {
  return arr.indexOf(val) == -1 ? [...arr, val] : arr;
}

function roomId(id: string): Id<Room> {
  return { kind: Room, id };
}

function playerId(id: string): Id<Player> {
  return { kind: Player, id };
}

export function getActor(a: Action): Actor {
  switch (a.kind) {
    case JoinRoom: return (states: StateBundle) => joinRoomAction(a, states);
  }
}

function joinRoomAction(a: JoinRoomAction, states: StateBundle): ActorResult {
  if (!('player' in states)) {
    return {
      kind: 'GET_MORE',
      ids: { player: playerId(a.playerId), newRoom: roomId(a.roomId) },
    }
  }
  const res: StateBundle = {};

  const player = states.player as PlayerState;

  if (player.roomId == a.roomId) {
    // Already in room.
    return { kind: 'ERROR', status: status.ok() };
  }

  if (player.roomId != null && !('oldRoom' in states)) {
    return {
      kind: 'GET_MORE',
      ids: {
        player: playerId(a.playerId),
        newRoom: roomId(a.roomId),
        oldRoom: roomId(player.roomId),
      },
    }
  }

  const oldRoom = states.oldRoom as (RoomState | null);
  const newRoom = states.newRoom as RoomState;

  if (oldRoom != null) {
    const playerIdx = oldRoom.players.indexOf(a.playerId);
    if (playerIdx == -1) {
      return { kind: 'ERROR', status: status.internal() };
    }
    res.oldRoom = {
      ...oldRoom,
      players: [
        ...oldRoom.players.slice(0, playerIdx),
        ...oldRoom.players.slice(playerIdx + 1),
      ],
    };
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
    kind: 'COMMIT',
    action: a,
    updates: res,
  };
}


//
// MyTypeModel = {
// };
//
// type Foo = MyTypeModel extends Model ? string : never;
//
// const x: Foo = '234';
//
//
// type State<TypeModel, K extends keyof TypeModel> = TypeModel[K];
//
// type Ids<TypeModel> = {
//   [id: string]: Id<keyof TypeModel>;
// }
//
// type States<TypeModel, Obj extends Ids<TypeModel>> = {
//   [id in keyof Obj]: TypeModel[Obj[id]['kind']];
// };

//
// type AdditionalRequests<TypeModel> = {
//   kind: 'MORE';
//   ids: Ids<TypeModel>;
// };
//
// type Result<TypeModel, Lookups extends Ids<TypeModel>> = {
//   kind: 'RESULT';
//   status: status.Status;
//   results: States<TypeModel, Lookups>;
// }
//
// type Commit<TypeModel, Action, Lookups extends Ids<TypeModel>> = {
//   action: Action;
//   states: States<TypeModel, Lookups>;
// };
//
// type Actor<TypeModel, Lookups extends Ids<TypeModel>> =
//   (lookups: Lookups) =>
//     AdditionalRequests<TypeModel> | Result<TypeModel, Lookups>
//
//
// function applyAction<TypeModel, L>(db: DB, actor: Actor<TypeModel, )

//
// type StreamState<T extends StreamKind> =
//   T extends StreamKind.ROOM ? actions.CreateRoom | actions.JoinRoom | actions.JoinRoomResult :
//   T extends StreamType.PLAYER ? actions.CreatePlayer | actions.JoinRoom | actions.JoinRoomResult :
//   T extends StreamType.PLAYER_JOINS_ROOM ? actions.JoinRoom :
//   never;
//
// type StreamAction2 = {
//   [StreamType.ROOM]: StreamType.PLAYER;
//   [StreamType.PLAYER_JOINS_ROOM]: StreamType.ROOM;
//
// }
//
// type foo = StreamAction<StreamType.PLAYER>
//
//
// export type StreamId<T extends StreamType> = {
//   stream: T;
//   id: string
// };
//
// function dispatch<T extends StreamType>(id: StreamId<T>, action: StreamAction<T>): void {
//
// }
//
//
//
// // ========
// // = ROOM =
// // ========
//
//
// export interface Room {
//   created: boolean;
//   playerIds: string[];
// }
//
// export function room(state: Room = undefined,
//   action: actions.RoomAction): [states.Room, status.Status, actions.Action[]] {
//   switch (action.type) {
//     case 'CREATE_ROOM': {
//       if (state.created) {
//         return [state, status.alreadyExists(), []];
//       }
//       return [{ ...state, created: true }, status.ok(), []];
//     }
//     case 'JOIN_ROOM': {
//       if (!state.created) {
//         return [state, status.notFound(), []];
//       }
//       const playerAction: actions.PlayerEntersRoomAction = {
//         ...action,
//         type: 'PLAYER_ENTERS_ROOM',
//       }
//       let next: states.Room = {
//         ...state,
//         players: { ...state.players, [action.playerId]: {} },
//       };
//       return [next, status.ok(), [playerAction]];
//     }
//   }
// }
//
// // ==========
// // = PLAYER =
// // ==========
//
// export interface Player {
//   currentRoomId: string | null;
// }
//
// const initalPlayer = {
//   currentRoomId: null,
// };
//
// export function player(state: states.Player = initalPlayer,
//   action: actions.PlayerAction): [states.Player, status.Status, actions.Action[]] {
//   switch (action.type) {
//     case 'PLAYER_ENTERS_ROOM': {
//       return [{ ...state, currentRoomId: action.roomId }, status.ok(), []];
//     }
//   }
// }

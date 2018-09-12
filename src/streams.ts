import * as actions from './actions';
import * as status from './status';
import * as states from './states';


export interface DB {
  get<K extends states.StreamKinds>(id: states.Id<K>): states.StateMap[K] | null;
  update(action: actions.Action, updates: states.Update<states.State>[]): status.Status;
}

type IdBundle = { [kind: string]: states.Id<states.StreamKinds> };
type StateBundle = { [kind: string]: states.State };

type GetMore = {
  kind: 'GET_MORE';
  ids: IdBundle;
};

type Commit = {
  kind: 'COMMIT';
  action: actions.Action;
  updates: StateBundle;
};

type Error = {
  kind: 'ERROR';
  status: status.Status;
};

type ActorResult = GetMore | Commit | Error;
type Actor = (state: StateBundle) => ActorResult;

function mkDefault<K extends states.StreamKinds>(k: K): states.StateMap[K] {
  switch (k as states.StreamKinds) {
    case states.Room: return { kind: states.Room, players: [] }
    case states.Player: return { kind: states.Player, roomId: null }
  }
}

function getAll(db: DB, ids: IdBundle): { [key: string]: states.State } {
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
        const updates: states.Update<states.State>[] = [];
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

export function getActor(a: actions.Action): Actor {
  switch (a.kind) {
    case actions.JOIN_ROOM:
      return (bundle: StateBundle) => joinRoomAction(a, bundle);
  }
}

function joinRoomAction(a: actions.JoinRoomAction, bundle: StateBundle): ActorResult {
  if (!('player' in bundle)) {
    return {
      kind: 'GET_MORE',
      ids: { player: states.playerId(a.playerId), newRoom: states.roomId(a.roomId) },
    }
  }
  const res: StateBundle = {};

  const player = bundle.player as states.PlayerState;

  if (player.roomId == a.roomId) {
    // Already in room.
    return { kind: 'ERROR', status: status.ok() };
  }

  if (player.roomId != null && !('oldRoom' in bundle)) {
    return {
      kind: 'GET_MORE',
      ids: {
        player: states.playerId(a.playerId),
        newRoom: states.roomId(a.roomId),
        oldRoom: states.roomId(player.roomId),
      },
    }
  }

  const oldRoom = bundle.oldRoom as (states.RoomState | null);
  const newRoom = bundle.newRoom as states.RoomState;

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

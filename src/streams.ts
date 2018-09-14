import * as actions from './actions';
import * as status from './status';
import * as states from './states';
import produce from "immer";

export interface DB {
  get<K extends states.State>(id: states.Id<K['kind']>): K | null;
  update(action: actions.Action, updates: states.Update<states.State>[]): status.Status;
}

type IdBundle = { [kind: string]: states.Id<states.Kind> };
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
  function curry<A>(fn: (action: A, bundle: StateBundle) => ActorResult, action: A) {
    return (bundle: StateBundle) => fn(action, bundle);
  }

  switch (a.kind) {
    case actions.JOIN_ROOM: return curry(joinRoomAction, a);
    case actions.CREATE_GAME: return curry(createGameAction, a);
  }
}

function joinRoomAction(a: actions.JoinRoom, bundle: StateBundle): ActorResult {
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

function createGameAction(a: actions.CreateGame, bundle: StateBundle): ActorResult {
  if (!('room' in bundle)) {
    return {
      kind: 'GET_MORE',
      ids: {
        room: states.roomId(a.roomId),
        game: states.gameId(a.gameId),
      },
    }
  }

  const room = bundle.room as states.RoomState;
  const game = bundle.game as states.GameState;
  if (room.players.length === 0) {
    return {
      kind: 'ERROR',
      status: status.notFound()
    };
  }
  if (game.players.length !== 0) {
    return {
      kind: 'ERROR',
      status: status.alreadyExists()
    };
  }

  return {
    kind: 'ERROR',
    status: status.ok()
  };
}

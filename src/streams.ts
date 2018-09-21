import * as actions from './actions';
import * as status from './status';
import * as states from './states';
import Prando from 'prando';

export type Id = {
  collection: string;
  id: string;
}

export interface DB {
  get(id: Id): any | null;
  update(updates: Update[]): status.Status;
}

export type Update = {
  collection: string;
  id: string;
  state: any;
}

//
// type IdBundle = { [kind: string]: states.Id<states.Kind> };
// type StateBundle = { [kind: string]: states.State };

type Graft = {
  kind: 'GRAFT';
  additionalIds: Id[];
  extra: any;
};

type Finish = {
  kind: 'FINISH';
  result: any;
  updates: any[];
};

type ActorResult = Graft | Finish;
type Actor = (action: string, ids: Id[], states: any[], extra?: any) => ActorResult;

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

export function apply(db: DB, actor: Actor, action: string): any {
  let ids: Id[] = [];
  let states: any[] = [];
  let extra: any | undefined;

  while (true) {
    const res = actor(action, [...ids], [...states], extra);
    if (res.kind == "FINISH") {
      const updates: Update[] = ids.map((id, idx) => ({
        ...id,
        state: res.updates[idx],
      }));
      const s = db.update(updates);
      if (!status.isOk(s)) {
        throw 'errr what?';
      }
      return res.result;
    }

    ids = [...ids, ...res.additionalIds];
    states = [...states, ...res.additionalIds.map(id => db.get(id))];
    extra = res.extra;
  }
}

function addUnique(arr: string[], val: string): string[] {
  return arr.indexOf(val) == -1 ? [...arr, val] : arr;
}

export function actor2(actionStr: string, ids: Id[], states: any[], extra?: any): ActorResult {
  const action = JSON.parse(actionStr) as actions.Action;

  switch (action.kind) {
    case actions.JOIN_ROOM:
      return joinRoomAction(action, extra, ids, states);
    case actions.CREATE_GAME:
      return createGameAction(action, ids, states, extra);
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

function joinRoomAction(a: actions.JoinRoom, extra: any,
  ids: Id[], sts: any[]): ActorResult {
  if (ids.length == 0) {
    return {
      kind: "GRAFT",
      extra: null,
      additionalIds: [playerId(a.playerId), roomId(a.roomId)]
    };
  }

  const player = (sts[0] as states.PlayerState) || mkDefault(states.PLAYER);


  if (player.roomId == a.roomId) {
    // Already in room.
    return {
      kind: 'FINISH',
      result: { status: status.ok() },
      updates: sts,
    };
  }

  if (player.roomId != null && ids.length == 2) {
    return {
      kind: 'GRAFT',
      extra: null,
      additionalIds: [roomId(player.roomId)],
    };
  }

  const newRoom = (sts[1] as states.RoomState) || mkDefault(states.ROOM);
  if (sts.length == 3) {
    const oldRoom = sts[2] as states.RoomState;

    const playerIdx = oldRoom.players.indexOf(a.playerId);
    if (playerIdx == -1) {
      return {
        kind: 'FINISH',
        result: { status: status.internal() },
        updates: sts,
      };
    }
    const newOldRoom: states.RoomState = {
      ...oldRoom,
      players: [
        ...oldRoom.players.slice(0, playerIdx),
        ...oldRoom.players.slice(playerIdx + 1),
      ],
    };
    sts[2] = newOldRoom;
  }

  sts[0] = {
    ...player,
    roomId: a.roomId,
  };

  sts[1] = {
    ...newRoom,
    players: addUnique(newRoom.players, a.playerId),
  }

  return {
    kind: 'FINISH',
    result: { status: status.ok() },
    updates: sts,
  };
}

type CreateGameExtra = {
  gameAttempts: number,
}

function createGameAction(a: actions.CreateGame, ids: Id[], sts: any[], extra: CreateGameExtra = { gameAttempts: 0 }): ActorResult {
  console.log(ids, sts, extra);
  const rng = new Prando(JSON.stringify(a) + ':' + extra.gameAttempts);
  if (ids.length == 0) {
    const extra: CreateGameExtra = { gameAttempts: 1 };
    return {
      kind: "GRAFT",
      extra,
      additionalIds: [roomId(a.roomId), gameId(rng.nextString())],
    }
  }

  const room = sts[0] as states.RoomState;
  if (!room) {
    return {
      kind: "FINISH",
      result: { status: status.notFound() },
      updates: sts,
    };
  }

  const game = sts[extra.gameAttempts] as states.GameState | null;
  if (game != null) {
    return {
      kind: "GRAFT",
      extra: { ...extra, gameAttempts: extra.gameAttempts + 1 },
      additionalIds: [gameId(rng.nextString())],
    }
  }

  // No players fetched
  if (ids.length == 1 + extra.gameAttempts) {
    return {
      kind: "GRAFT",
      extra,
      additionalIds: room.players.map(playerId),
    }
  }

  const players: states.PlayerState[] = sts.slice(1 + extra.gameAttempts);
  if (players.length != room.players.length) {
    throw "bad";
  }

  for (const player of players) {
    if (player == null) {
      return {
        kind: "FINISH",
        result: { status: status.internal() },
        updates: sts,
      }
    }
  }

  const newStates: any[] = [];
  newStates.push(null);
  newStates.push(...sts.splice(1, extra.gameAttempts - 1));

  const newGame: states.GameState = {
    kind: "GAME",
    players: ids.slice(1 + extra.gameAttempts).map(id => id.id),
    permutation: randperm(rng, players.length),
  };
  newStates.push(newGame);


  const newPlayers: states.PlayerState[] = players.map((player): states.PlayerState => ({
    ...player,
    roomId: null,
  }));
  newStates.push(...newPlayers);

  return {
    kind: 'FINISH',
    result: { status: status.ok(), gameId: ids[extra.gameAttempts] },
    updates: newStates,
  };
}


// return a random permutation of a range (similar to randperm in Matlab)
function randperm(rng: Prando, maxValue: number): number[] {
  // first generate number sequence
  var permArray = new Array(maxValue);
  for (var i = 0; i < maxValue; i++) {
    permArray[i] = i;
  }
  // draw out of the number sequence
  for (var i = (maxValue - 1); i >= 0; --i) {
    var randPos = Math.floor(i * rng.next());
    var tmpStore = permArray[i];
    permArray[i] = permArray[randPos];
    permArray[randPos] = tmpStore;
  }
  return permArray;
}

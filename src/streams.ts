import * as actions from './actions';
import * as status from './status';
import * as states from './states';
import * as base from './base';
import Prando from 'prando';

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

function addUnique(arr: string[], val: string): string[] {
  return arr.indexOf(val) == -1 ? [...arr, val] : arr;
}

export function actor2(action: base.Action, states: base.States): base.ActorResult {
  const parsedAction = JSON.parse(action.action) as actions.Action;

  switch (parsedAction.kind) {
    case actions.JOIN_ROOM:
      return joinRoomAction(parsedAction, action.timeMillis, states);
    case actions.CREATE_GAME:
      return createGameAction(parsedAction, action.timeMillis, states);
  }
}

export function playerId(id: string): string {
  return `players/${id}`;
}

export function roomId(id: string): string {
  return `rooms/${id}`;
}

export function gameId(id: string): string {
  return `games/${id}`;
}

function joinRoomAction(a: actions.JoinRoom, timeMillis: number, sts: base.States): base.ActorResult {
  const playerKey = playerId(a.playerId);
  const newRoomKey = roomId(a.roomId);
  if (!(playerKey in sts)) {
    return base.graft(playerKey, newRoomKey);
  }

  const player = (sts[playerKey] as states.PlayerState) || mkDefault(states.PLAYER);
  if (player.roomId == a.roomId) {
    // Already in room.
    return {
      kind: 'FINISH',
      result: { status: status.ok() },
      updates: sts,
    };
  }

  if (player.roomId != null && !(roomId(player.roomId) in sts)) {
    return base.graft(roomId(player.roomId));
  }

  if (player.roomId != null) {
    const oldRoom = sts[roomId(player.roomId)] as states.RoomState;

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
    sts[roomId(player.roomId)] = newOldRoom;
  }

  const newRoom = (sts[newRoomKey] as states.RoomState) || mkDefault(states.ROOM);

  sts[playerKey] = {
    ...player,
    roomId: a.roomId,
  };

  sts[newRoomKey] = {
    ...newRoom,
    players: addUnique(newRoom.players, a.playerId),
  }

  return {
    kind: 'FINISH',
    result: { status: status.ok() },
    updates: sts,
  };
}


function createGameAction(a: actions.CreateGame, timeMillis: number, sts: base.States): base.ActorResult {
  const rng = new Prando(`${JSON.stringify(a)}:${timeMillis}`);

  const roomKey = roomId(a.roomId);
  let gameKey = gameId(rng.nextString());
  if (!(roomKey in sts)) {
    return base.graft(roomKey, gameKey);
  }

  const room = sts[roomKey] as states.RoomState;
  if (room === null) {
    return {
      kind: "FINISH",
      result: { status: status.notFound() },
      updates: sts,
    };
  }

  while (true) {
    console.log(gameKey);
    if (sts[gameKey] === null) { break; }
    gameKey = gameId(rng.nextString());
    if (!(gameKey in sts)) {
      return base.graft(gameKey);
    }
  }

  // No players fetched
  const playerKeys = room.players.map(playerId);
  if (!(playerKeys[0] in sts)) {
    return base.graft(...playerKeys);
  }

  const players: states.PlayerState[] = playerKeys.map(key => sts[key]);

  for (const player of players) {
    if (player == null) {
      return {
        kind: "FINISH",
        result: { status: status.internal() },
        updates: sts,
      }
    }
  }

  sts[roomKey] = null;
  const newGame: states.GameState = {
    kind: "GAME",
    players: room.players,
    permutation: randperm(rng, players.length),
  };
  sts[gameKey] = newGame;

  for (const playerKey of playerKeys) {
    const newPlayer: states.PlayerState = {
      ...sts[playerKey],
      roomId: null,
    };
    sts[playerKey] = newPlayer;
  }

  return {
    kind: 'FINISH',
    result: { status: status.ok(), gameId: gameKey },
    updates: sts,
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

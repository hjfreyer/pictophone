import * as actions from './actions';
import * as status from 'status';
import * as model from './model';
import * as base from 'knit';
import Prando from 'prando';

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

function joinRoomAction(a: actions.JoinRoom, timeMillis: number, states: base.States): base.ActorResult {
  const playerKey = playerId(a.playerId);
  const newRoomKey = roomId(a.roomId);
  if (!(playerKey in states)) {
    return base.graft(playerKey, newRoomKey);
  }

  const player = (states[playerKey] as model.PlayerState) || model.mkDefault(model.PLAYER);
  if (player.roomId == a.roomId) {
    // Already in room.
    return {
      kind: 'FINISH',
      result: { status: status.ok() },
      updates: states,
    };
  }

  if (player.roomId != null && !(roomId(player.roomId) in states)) {
    return base.graft(roomId(player.roomId));
  }

  if (player.roomId != null) {
    const oldRoom = states[roomId(player.roomId)] as model.RoomState;

    const playerIdx = oldRoom.players.indexOf(a.playerId);
    if (playerIdx == -1) {
      return {
        kind: 'FINISH',
        result: { status: status.internal() },
        updates: states,
      };
    }
    const newOldRoom: model.RoomState = {
      ...oldRoom,
      players: [
        ...oldRoom.players.slice(0, playerIdx),
        ...oldRoom.players.slice(playerIdx + 1),
      ],
    };
    states[roomId(player.roomId)] = newOldRoom;
  }

  const newRoom = (states[newRoomKey] as model.RoomState) || model.mkDefault(model.ROOM);

  states[playerKey] = {
    ...player,
    roomId: a.roomId,
  };

  states[newRoomKey] = {
    ...newRoom,
    players: addUnique(newRoom.players, a.playerId),
  }

  return {
    kind: 'FINISH',
    result: { status: status.ok() },
    updates: states,
  };
}


function createGameAction(a: actions.CreateGame, timeMillis: number, states: base.States): base.ActorResult {
  const rng = new Prando(`${JSON.stringify(a)}:${timeMillis}`);

  const roomKey = roomId(a.roomId);
  let gameKey = gameId(rng.nextString());
  if (!(roomKey in states)) {
    return base.graft(roomKey, gameKey);
  }

  const room = states[roomKey] as model.RoomState;
  if (room === null) {
    return {
      kind: "FINISH",
      result: { status: status.notFound() },
      updates: states,
    };
  }

  while (true) {
    console.log(gameKey);
    if (states[gameKey] === null) { break; }
    gameKey = gameId(rng.nextString());
    if (!(gameKey in states)) {
      return base.graft(gameKey);
    }
  }

  // No players fetched
  const playerKeys = room.players.map(playerId);
  if (!(playerKeys[0] in states)) {
    return base.graft(...playerKeys);
  }

  const players: model.PlayerState[] = playerKeys.map(key => states[key]);

  for (const player of players) {
    if (player == null) {
      return {
        kind: "FINISH",
        result: { status: status.internal() },
        updates: states,
      }
    }
  }

  states[roomKey] = null;
  const newGame: model.GameState = {
    kind: "GAME",
    players: room.players,
    permutation: randperm(rng, players.length),
  };
  states[gameKey] = newGame;

  for (const playerKey of playerKeys) {
    const newPlayer: model.PlayerState = {
      ...states[playerKey],
      roomId: null,
    };
    states[playerKey] = newPlayer;
  }

  return {
    kind: 'FINISH',
    result: { status: status.ok(), gameId: gameKey },
    updates: states,
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

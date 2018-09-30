import * as actions from './actions';
import * as status from 'status';
import * as model from './model';
import * as base from 'knit';
import Prando from 'prando';

export function actor2(action: base.Action, states: base.States): base.ActorResult {
  const parsedAction = JSON.parse(action.action) as actions.Action;

  switch (parsedAction.kind) {
    case actions.JOIN_ROOM:
      return joinRoomAction(parsedAction, action.timeMillis, states);
    case actions.CREATE_GAME:
      return createGameAction(parsedAction, action.timeMillis, states);
  }
}

function joinRoomAction(a: actions.JoinRoom, timeMillis: number, states: base.States): base.ActorResult {
  {
    const toGraft = [];
    if (!(a.player in states)) { toGraft.push(a.player); }
    if (a.room != '' && !(a.room in states)) { toGraft.push(a.room) };
    if (toGraft.length != 0) {
      return base.graft(...toGraft);
    }
  }

  const player = (states[a.player] as model.PlayerState) || model.mkDefault(model.PLAYER);
  if (player.room == a.room) {
    // Already in room.
    return {
      kind: 'FINISH',
      result: { status: status.ok() },
      updates: states,
    };
  }

  if (player.room != '') {
    if (!(player.room in states)) {
      return base.graft(player.room);
    }

    const oldRoom = states[player.room] as model.RoomState;

    const playerIdx = oldRoom.players.indexOf(a.player);
    if (playerIdx == -1) {
      return {
        kind: 'FINISH',
        result: { status: status.internal() },
        updates: states,
      };
    }
    let newOldRoom: model.RoomState = {
      ...oldRoom,
      players: [
        ...oldRoom.players.slice(0, playerIdx),
        ...oldRoom.players.slice(playerIdx + 1),
      ],
    };
    states[player.room] = newOldRoom;
  }

  states[a.player] = {
    ...player,
    room: a.room,
  };

  if (a.room != '') {
    const newRoom = (states[a.room] as model.RoomState) || model.mkDefault(model.ROOM);

    states[a.room] = {
      ...newRoom,
      players: [...newRoom.players, a.player],
    };
  }

  return {
    kind: 'FINISH',
    result: { status: status.ok() },
    updates: states,
  };
}

function createGameAction(a: actions.CreateGame, timeMillis: number, states: base.States): base.ActorResult {
  const rng = new Prando(`${JSON.stringify(a)}:${timeMillis}`);

  let gameName = model.gameId(rng.nextString());
  if (!(a.room in states)) {
    return base.graft(a.room, gameName);
  }

  const room = states[a.room] as model.RoomState || model.mkDefault(model.ROOM);
  if (room.players.length == 0) {
    return {
      kind: "FINISH",
      result: { status: status.notFound() },
      updates: states,
    };
  }

  // Find an unused gameName.
  while (true) {
    if (states[gameName] === null) { break; }
    gameName = model.gameId(rng.nextString());
    if (!(gameName in states)) {
      return base.graft(gameName);
    }
  }

  // No players fetched.
  if (!(room.players[0] in states)) {
    return base.graft(...room.players);
  }

  const players: model.PlayerState[] = room.players.map(key => states[key]);

  for (const player of players) {
    if (player == null) {
      return {
        kind: "FINISH",
        result: { status: status.internal() },
        updates: states,
      }
    }
  }

  states[a.room] = null;
  const newGame: model.GameState = {
    kind: "GAME",
    players: room.players,
    permutation: randperm(rng, players.length),
  };
  states[gameName] = newGame;

  for (const playerName of room.players) {
    const newPlayer: model.PlayerState = {
      ...states[playerName],
      room: '',
    };
    states[playerName] = newPlayer;
  }

  return {
    kind: 'FINISH',
    result: { status: status.ok(), gameId: gameName },
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

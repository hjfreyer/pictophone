
import * as knit from './knit/index';
import Prando from 'prando';
import * as status from '@hjfreyer/status';
import * as actions from './actions';
import * as gp from './gameplay';
import * as model from './model';

export function actor2(action: knit.Action, states: knit.States): knit.ActorResult {
  const parsedAction = JSON.parse(action.action) as actions.Action;

  switch (parsedAction.kind) {
    case actions.JOIN_ROOM:
      return joinRoomAction(parsedAction, action.timeMillis, states);
    case actions.CREATE_GAME:
      return createGameAction(parsedAction, action.timeMillis, states);
  }
}

function parseOrDefault<K extends model.Kind>(k: K, value: string | null): model.ForKind<K> {
  if (!value) {
    return model.mkDefault(k);
  }
  return JSON.parse(value);
}

function joinRoomAction(a: actions.JoinRoom, timeMillis: number, states: knit.States): knit.ActorResult {
  {
    const toGraft = [];
    if (!(a.player in states)) { toGraft.push(a.player); }
    if (a.room != '' && !(a.room in states)) { toGraft.push(a.room) };
    if (toGraft.length != 0) {
      return knit.graft(...toGraft);
    }
  }

  const player = parseOrDefault(model.PLAYER, states[a.player]);
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
      return knit.graft(player.room);
    }

    const oldRoom = JSON.parse(states[player.room]!) as model.RoomState;

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
    states[player.room] = JSON.stringify(newOldRoom);
  }

  states[a.player] = JSON.stringify({
    ...player,
    room: a.room,
  });

  if (a.room != '') {
    const newRoom = parseOrDefault(model.ROOM, states[a.room]);

    states[a.room] = JSON.stringify({
      ...newRoom,
      players: [...newRoom.players, a.player],
    });
  }

  return {
    kind: 'FINISH',
    result: { status: status.ok() },
    updates: states,
  };
}

function createGameAction(a: actions.CreateGame, timeMillis: number, states: knit.States): knit.ActorResult {
  const rng = new Prando(`${JSON.stringify(a)}:${timeMillis}`);

  let gameName = model.gameId(rng.nextString());
  if (!(a.room in states)) {
    return knit.graft(a.room, gameName);
  }

  const room = parseOrDefault(model.ROOM, states[a.room]);
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
      return knit.graft(gameName);
    }
  }

  // No players fetched.
  if (!(room.players[0] in states)) {
    return knit.graft(...room.players);
  }

  for (const playerKey of room.players) {
    if (states[playerKey] == null) {
      return {
        kind: "FINISH",
        result: { status: status.internal() },
        updates: states,
      }
    }
  }

  const players: model.PlayerState[] =
    room.players.map(key => JSON.parse(states[key]!));

  states[a.room] = null;
  const newGame: model.GameState = {
    kind: "GAME",
    players: room.players,
    permutation: randperm(rng, players.length),
  };
  states[gameName] = JSON.stringify(newGame);

  room.players.forEach((playerName, idx) => {
    const newPlayer: model.PlayerState = {
      ...JSON.parse(states[playerName]!),
      room: '',
    };
    states[playerName] = JSON.stringify(newPlayer);

    const viewState: model.PlayerGameView = {
      kind: "PLAYER_GAME_VIEW",
      view: gp.project(gp.newGame(newGame.permutation), idx),
    }
    states[model.playerGameViewId(playerName, gameName)] =
      JSON.stringify(viewState);
  });

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

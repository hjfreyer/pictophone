
import * as actions from './actions';
import * as reducers from './reducers';
import * as states from './states';
import * as status from './status';

export type RoomHistory = {
  snapshots: RoomSnapshot[];
};

export type RoomSnapshot = {
  action: actions.RoomAction;
  state: states.Room;
};

export type PlayerHistory = {
  snapshots: PlayerSnapshot[];
};

export type PlayerSnapshot = {
  action: actions.PlayerAction;
  state: states.Player;
};

export interface Datastore {
  getRoomState(id: string): states.Room | undefined;
  getPlayerState(id: string): states.Player | undefined;

  appendRoomSnapshot(
    id: string, snpashot: RoomSnapshot): void
  appendPlayerSnapshot(
    id: string, snpashot: PlayerSnapshot): void
};

export function processAction(ds: Datastore, action: actions.Action): status.Status {
  switch (action.type) {
    case 'CREATE_ROOM':
    case 'JOIN_ROOM':
      return processRoomAction(ds, action);
    case 'PLAYER_ENTERS_ROOM':
      return processPlayerAction(ds, action);
  }
}

function processRoomAction(ds: Datastore, action: actions.RoomAction): status.Status {
  const currentState = ds.getRoomState(action.roomId);
  const [nextState, s, nextActions] = reducers.room(currentState, action);
  if (!status.isOk(s)) {
    return s;
  }
  ds.appendRoomSnapshot(action.roomId, action, nextState);
  for (const a of nextActions) {
    const s = processAction(ds, a);
    if (!status.isOk(s)) {
      return s;
    }
  }
  return status.ok();
}

function processPlayerAction(ds: Datastore, action: actions.PlayerAction): status.Status {
  const currentState = ds.getPlayerState(action.playerId);
  const [nextState, s, nextActions] = reducers.player(currentState, action);
  if (!status.isOk(s)) {
    return s;
  }
  ds.appendPlayerSnapshot(action.playerId, action, nextState);
  for (const a of nextActions) {
    const s = processAction(ds, a);
    if (!status.isOk(s)) {
      return s;
    }
  }
  return status.ok();
}

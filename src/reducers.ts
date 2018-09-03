import * as actions from './actions';
import * as states from './states';
import * as status from './status';

const initalRoom = {
  created: false,
  players: {},
};

export function room(state: states.Room = initalRoom,
  action: actions.RoomAction): [states.Room, status.Status, actions.Action[]] {
  switch (action.type) {
    case 'CREATE_ROOM': {
      if (state.created) {
        return [state, status.alreadyExists(), []];
      }
      return [{ ...state, created: true }, status.ok(), []];
    }
    case 'JOIN_ROOM': {
      if (!state.created) {
        return [state, status.notFound(), []];
      }
      const playerAction: actions.PlayerEntersRoomAction = {
        ...action,
        type: 'PLAYER_ENTERS_ROOM',
      }
      let next: states.Room = {
        ...state,
        players: {...state.players, [action.playerId]: {}},
      };
      return [next, status.ok(), [playerAction]];
    }
  }
}

const initalPlayer = {
  currentRoomId: null,
};

export function player(state: states.Player = initalPlayer,
  action: actions.PlayerAction): [states.Player, status.Status, actions.Action[]] {
  switch (action.type) {
    case 'PLAYER_ENTERS_ROOM': {
      return [{ ...state, currentRoomId: action.roomId }, status.ok(), []];
    }
  }
}

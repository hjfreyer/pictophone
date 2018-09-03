
export interface CreateRoomAction {
  type: 'CREATE_ROOM';
  roomId: string;
}

export interface JoinRoomAction {
  type: 'JOIN_ROOM';
  roomId: string;
  playerId: string;
}

export type RoomAction = CreateRoomAction | JoinRoomAction;

export interface PlayerEntersRoomAction {
  type: 'PLAYER_ENTERS_ROOM';
  roomId: string;
  playerId: string;
}

export type PlayerAction = PlayerEntersRoomAction;

export type Action = RoomAction | PlayerAction;

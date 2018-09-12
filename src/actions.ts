
export const JOIN_ROOM = 'JOIN_ROOM';
export type JOIN_ROOM = typeof JOIN_ROOM;

type ActionMap = {
  [JOIN_ROOM]: JoinRoomAction;
}

export type Kind = keyof ActionMap;
export type Action = ActionMap[Kind];

export type JoinRoomAction = {
  kind: JOIN_ROOM;
  playerId: string;
  roomId: string;
};

export function joinRoom(playerId: string, roomId: string): Action {
  return { kind: JOIN_ROOM, playerId, roomId };
}

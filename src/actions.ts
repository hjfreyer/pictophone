
export type Kind = keyof ActionMap;
export type Action = ActionMap[Kind];
export type ForKind<K extends Kind> = ActionMap[K];

export const JOIN_ROOM = 'JOIN_ROOM';
export type JOIN_ROOM = typeof JOIN_ROOM;
interface ActionMap { [JOIN_ROOM]: JoinRoom; }

export type JoinRoom = {
  kind: JOIN_ROOM;
  playerId: string;
  roomId: string;
};

export function joinRoom(playerId: string, roomId: string): Action {
  return { kind: JOIN_ROOM, playerId, roomId };
}

export const CREATE_GAME = 'CREATE_GAME';
export type CREATE_GAME = typeof CREATE_GAME;
interface ActionMap { [CREATE_GAME]: CreateGame; }

export type CreateGame = {
  kind: CREATE_GAME;
  roomId: string;
  gameId: string;
};

export function createGame(roomId: string, gameId: string): Action {
  return { kind: CREATE_GAME, roomId, gameId };
}

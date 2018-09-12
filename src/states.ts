
export const ROOM = 'ROOM';
export type ROOM = typeof ROOM;
export const PLAYER = 'PLAYER';
export type PLAYER = typeof PLAYER;

type StateMap = {
  [ROOM]: RoomState;
  [PLAYER]: PlayerState;
}

export type Kind = keyof StateMap;
export type State = StateMap[Kind];
export type ForKind<K extends Kind> = StateMap[K];

export type RoomState = {
  kind: ROOM;
  players: string[];
};

export type PlayerState = {
  kind: PLAYER;
  roomId: string | null;
};

export function roomId(id: string): Id<ROOM> {
  return { kind: ROOM, id };
}

export function playerId(id: string): Id<PLAYER> {
  return { kind: PLAYER, id };
}

export type Id<K> = {
  kind: K;
  id: string;
};

export type Update<S extends State> = {
  id: Id<S['kind']>;
  state: S;
}


export const ROOM = 'ROOM';
export type ROOM = typeof ROOM;
interface StateMap { [ROOM]: RoomState; }

export type RoomState = {
  kind: ROOM;
  players: string[];
};

export function roomId(id: string): Id<ROOM> {
  return { kind: ROOM, id };
}

export const PLAYER = 'PLAYER';
export type PLAYER = typeof PLAYER;
interface StateMap { [PLAYER]: PlayerState; }

export type PlayerState = {
  kind: PLAYER;
  roomId: string | null;
};

export function playerId(id: string): Id<PLAYER> {
  return { kind: PLAYER, id };
}

export const GAME = 'GAME';
export type GAME = typeof GAME;
interface StateMap { [GAME]: GameState; }

export type GameState = {
  kind: GAME;
  players: string[];
  permutation: number[];
};

export function gameId(id: string): Id<GAME> {
  return { kind: GAME, id };
}

export type Kind = keyof StateMap;
export type State = StateMap[Kind];
export type ForKind<K extends Kind> = StateMap[K];

export type Id<K> = {
  kind: K;
  id: string;
};

export type Update<S extends State> = {
  id: Id<S['kind']>;
  state: S;
}

export function mkDefault<K extends Kind>(k: K): ForKind<K> {
  const defaults: { [K in Kind]: ForKind<K> } = {
    [ROOM]: { kind: ROOM, players: [] },
    [PLAYER]: { kind: PLAYER, roomId: null },
    [GAME]: {
      kind: GAME,
      players: [],
      permutation: [],
    },
  };
  return defaults[k];
}


export const ROOM = 'ROOM';
export type ROOM = typeof ROOM;
interface StateMap { [ROOM]: RoomState; }

export type RoomState = {
  kind: ROOM;

  // List of player names.
  players: string[];
};

export const PLAYER = 'PLAYER';
export type PLAYER = typeof PLAYER;
interface StateMap { [PLAYER]: PlayerState; }

export type PlayerState = {
  kind: PLAYER;

  // If the empty string, indicates the player isn't in a room. Otherwise, the
  // name of a room.
  room: string;
};

export const GAME = 'GAME';
export type GAME = typeof GAME;
interface StateMap { [GAME]: GameState; }

export type GameState = {
  kind: GAME;
  players: string[];
  permutation: number[];
};

export type Kind = keyof StateMap;
export type State = StateMap[Kind];
export type ForKind<K extends Kind> = StateMap[K];

export function mkDefault<K extends Kind>(k: K): ForKind<K> {
  const defaults: { [K in Kind]: ForKind<K> } = {
    [ROOM]: { kind: ROOM, players: [] },
    [PLAYER]: { kind: PLAYER, room: '' },
    [GAME]: {
      kind: GAME,
      players: [],
      permutation: [],
    },
  };
  return defaults[k];
}

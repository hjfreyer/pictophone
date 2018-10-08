
import * as gp from './gameplay';

export const ROOM = 'ROOM';
export type ROOM = typeof ROOM;
interface StateMap { [ROOM]: RoomState; }

export function roomId(id: string): string {
  return `rooms/${id}`;
}

export type RoomState = {
  kind: ROOM;

  // List of player names.
  players: string[];
};

export const PLAYER = 'PLAYER';
export type PLAYER = typeof PLAYER;
interface StateMap { [PLAYER]: PlayerState; }

export function playerId(id: string): string {
  return `players/${id}`;
}

export type PlayerState = {
  kind: PLAYER;

  // If the empty string, indicates the player isn't in a room. Otherwise, the
  // name of a room.
  room: string;
};

export const PLAYER_GAME_VIEW = 'PLAYER_GAME_VIEW';
export type PLAYER_GAME_VIEW = typeof PLAYER_GAME_VIEW;

export function playerGameViewId(player: string, game: string): string {
  return `${player}/${game}`;
}

export type PlayerGameView = {
  kind: PLAYER_GAME_VIEW;
  view: gp.PlayerView;
};

export const GAME = 'GAME';
export type GAME = typeof GAME;
interface StateMap { [GAME]: GameState; }

export function gameId(id: string): string {
  return `games/${id}`;
}

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

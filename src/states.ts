
export const Room = 'ROOM';
export type Room = typeof Room;
export const Player = 'PLAYER';
export type Player = typeof Player;

export type StateMap = {
  [Room]: RoomState;
  [Player]: PlayerState;
}

export type State = StateMap[keyof StateMap];

export type StreamKinds = keyof StateMap;

export type RoomState = {
  kind: Room;
  players: string[];
};

export type PlayerState = {
  kind: Player;
  roomId: string | null;
};

export function roomId(id: string): Id<Room> {
  return { kind: Room, id };
}

export function playerId(id: string): Id<Player> {
  return { kind: Player, id };
}


export type Id<K> = {
  kind: K;
  id: string;
};

export type Update<S extends State> = {
  id: Id<S['kind']>;
  state: S;
}

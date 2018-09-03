
export interface Room {
  created: boolean;
  players: {[id: string]: {}};
}

export interface Player {
  currentRoomId: string | null;
}

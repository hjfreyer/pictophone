import * as actions from '../src/actions';
import * as controllers from '../src/controller';
import * as states from '../src/states';

export class Datastore implements controllers.Datastore {
  rooms: Map<string, controllers.RoomHistory> = new Map();
  players: Map<string, controllers.PlayerHistory> = new Map();

  stagedRooms: Map<string, controllers.RoomSnapshot> = new Map();
  stagedPlayers: Map<string, controllers.PlayerSnapshot> = new Map();

  getRoomState(id: string): states.Room | undefined {
    const hist = this.rooms.get(id);
    if (hist === undefined) {
      return undefined;
    }

    if (hist.snapshots.length == 0) {
      throw "empty history";
    }
    const lastSnap = hist.snapshots[hist.snapshots.length - 1];
    return lastSnap.state;
  }

  getPlayerState(id: string): states.Player | undefined {
    const hist = this.players.get(id);
    if (hist === undefined) {
      return undefined;
    }

    if (hist.snapshots.length == 0) {
      throw "empty history";
    }
    const lastSnap = hist.snapshots[hist.snapshots.length - 1];
    return lastSnap.state;
  }

  appendRoomSnapshot(id: string, action: actions.RoomAction, state: states.Room): void {
    if (this.stagedRooms.has(id)) {
      throw new Error("can't append multiple snapshots for the same item");
    }
    this.stagedRooms.set(id, { action, state });
  }

  appendPlayerSnapshot(id: string, action: actions.PlayerAction, state: states.Player): void {
    if (this.stagedPlayers.has(id)) {
      throw new Error("can't append multiple snapshots for the same item");
    }
    this.stagedPlayers.set(id, { action, state });
  }

  commit() {
    this.stagedRooms.forEach((snap, id) => {
      let hist = this.rooms.get(id);
      if (hist === undefined) {
        hist = { snapshots: [] };
        this.rooms.set(id, hist);
      }
      hist.snapshots.push(snap);
    });
    this.stagedRooms.clear();

    this.stagedPlayers.forEach((snap, id) => {
      let hist = this.players.get(id);
      if (hist === undefined) {
        hist = { snapshots: [] };
        this.players.set(id, hist);
      }
      hist.snapshots.push(snap);
    });
    this.stagedPlayers.clear();
  }
}
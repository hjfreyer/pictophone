
// import * as actions from '../src/actions';
// import * as controller from '../src/controller';
import * as fake_ds from './fake_ds';
import * as status from '../src/status';
import * as streams from '../src/streams';

function set(...ts: string[]): { [v: string]: {} } {
  const res: { [v: string]: {} } = {};
  for (let t of ts) {
    res[t] = {};
  }
  return res;
}

function roomId(id: string): streams.Id<streams.Room> {
  return { kind: streams.Room, id };
}

function playerId(id: string): streams.Id<streams.Player> {
  return { kind: streams.Player, id };
}

describe('basic room creation and joining', () => {
  let ds: fake_ds.Datastore;

  beforeEach(() => {
    ds = new fake_ds.Datastore();
  })

  test('rooms and players start null', () => {
    expect(ds.get(roomId('r1'))).toBeNull();
    expect(ds.get(playerId('p1'))).toBeNull();
  });

  const doAction = (a: streams.Action) => streams.apply(ds, streams.getActor(a));

  test('join creates lazily', () => {
    expect(doAction({
      kind: 'JOIN_ROOM',
      roomId: 'r1',
      playerId: 'p1'
    })).toEqual(status.ok());
    expect(ds.get(roomId('r1'))).toEqual({
      kind: streams.Room,
      players: ['p1'],
    });
    expect(ds.get(playerId('p1'))).toEqual({
      kind: streams.Player,
      roomId: 'r1'
    });
  });

  test('join creates lazily', () => {
    expect(doAction({
      kind: 'JOIN_ROOM',
      roomId: 'r1',
      playerId: 'p1'
    })).toEqual(status.ok());
    expect(ds.get(roomId('r1'))).toEqual({
      kind: streams.Room,
      players: ['p1'],
    });
    expect(ds.get(playerId('p1'))).toEqual({
      kind: streams.Player,
      roomId: 'r1'
    });
  });

  test('multiple players join', () => {
    expect(doAction({
      kind: 'JOIN_ROOM',
      roomId: 'r1',
      playerId: 'p1'
    })).toEqual(status.ok());
    expect(doAction({
      kind: 'JOIN_ROOM',
      roomId: 'r1',
      playerId: 'p2'
    })).toEqual(status.ok());
    expect(ds.get(roomId('r1'))).toEqual({
      kind: streams.Room,
      players: ['p1', 'p2'],
    });
    expect(ds.get(playerId('p2'))).toEqual({
      kind: streams.Player,
      roomId: 'r1'
    });
  });

  test('join idempotent', () => {
    expect(doAction({
      kind: 'JOIN_ROOM',
      roomId: 'r1',
      playerId: 'p1'
    })).toEqual(status.ok());
    expect(doAction({
      kind: 'JOIN_ROOM',
      roomId: 'r1',
      playerId: 'p1'
    })).toEqual(status.ok());
    expect(ds.get(roomId('r1'))).toEqual({
      kind: streams.Room,
      players: ['p1'],
    });
    expect(ds.get(playerId('p1'))).toEqual({
      kind: streams.Player,
      roomId: 'r1'
    });
  });

  test('move between rooms', () => {
    expect(doAction({
      kind: 'JOIN_ROOM',
      roomId: 'r1',
      playerId: 'p1'
    })).toEqual(status.ok());
    expect(doAction({
      kind: 'JOIN_ROOM',
      roomId: 'r2',
      playerId: 'p1'
    })).toEqual(status.ok());
    expect(ds.get(roomId('r1'))).toEqual({
      kind: streams.Room,
      players: [],
    });
    expect(ds.get(roomId('r2'))).toEqual({
      kind: streams.Room,
      players: ['p1'],
    });
    expect(ds.get(playerId('p1'))).toEqual({
      kind: streams.Player,
      roomId: 'r2'
    });
  });
});

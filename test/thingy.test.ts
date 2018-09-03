
import * as actions from '../src/actions';
import * as controller from '../src/controller';
import * as fake_ds from './fake_ds';
import * as status from '../src/status';

function set(...ts: string[]): { [v: string]: {} } {
  const res: { [v: string]: {} } = {};
  for (let t of ts) {
    res[t] = {};
  }
  return res;
}

describe('basic room creation and joining', () => {
  let ds: fake_ds.Datastore;

  beforeEach(() => {
    ds = new fake_ds.Datastore();
  })

  test('rooms start undefined', () => {
    expect(ds.getRoomState('r1')).toBeUndefined();
  });

  const doAction = (a: actions.Action) => {
    const s = controller.processAction(ds, a);
    if (status.isOk(s)) {
      ds.commit();
    }
    return s;
  }

  test('cant join if doesnt exist', () => {
    expect(doAction({
      type: 'JOIN_ROOM',
      roomId: 'r1',
      playerId: 'p1'
    })).toEqual(status.notFound());
    expect(ds.getRoomState('r1')).toBeUndefined();
    expect(ds.getPlayerState('p1')).toBeUndefined();
  });

  describe('room exists', () => {
    beforeEach(() => {
      expect(doAction({
        type: 'CREATE_ROOM',
        roomId: 'r1',
      })).toEqual(status.ok());

      expect(ds.getRoomState('r1')).toEqual({
        created: true,
        players: {},
      });
      expect(doAction({
        type: 'CREATE_ROOM',
        roomId: 'r2',
      })).toEqual(status.ok());

      expect(ds.getRoomState('r2')).toEqual({
        created: true,
        players: {},
      });
    })

    test('trivial', () => { });

    test('cant recreate', () => {
      expect(doAction({
        type: 'CREATE_ROOM',
        roomId: 'r1',
      })).toEqual(status.alreadyExists());

      expect(ds.getRoomState('r1')).toEqual({
        created: true,
        players: {},
      });
    });

    describe('player joins successfully', () => {
      beforeEach(() => {
        expect(doAction({
          type: 'JOIN_ROOM',
          roomId: 'r1',
          playerId: 'p1',
        })).toEqual(status.ok());

        expect(ds.getRoomState('r1')).toEqual({
          created: true,
          players: set('p1'),
        });
        expect(ds.getPlayerState('p1')).toEqual({
          currentRoomId: 'r1',
        });
      });

      test('trivial', () => { });

      test('join idempotent', () => {
        expect(doAction({
          type: 'JOIN_ROOM',
          roomId: 'r1',
          playerId: 'p1',
        })).toEqual(status.ok());

        expect(ds.getRoomState('r1')).toEqual({
          created: true,
          players: set('p1'),
        });
        expect(ds.getPlayerState('p1')).toEqual({
          currentRoomId: 'r1',
        });
      });

      test('multiple players', () => {
        expect(doAction({
          type: 'JOIN_ROOM',
          roomId: 'r1',
          playerId: 'p2'
        })).toEqual(status.ok());
        expect(ds.getRoomState('r1')).toEqual({
          created: true,
          players: set('p1', 'p2'),
        });
        expect(ds.getPlayerState('p1')).toEqual({
          currentRoomId: 'r1',
        });
        expect(ds.getPlayerState('p2')).toEqual({
          currentRoomId: 'r1',
        });
      });

      test('switchRoom', () => {
        expect(doAction({
          type: 'JOIN_ROOM',
          roomId: 'r2',
          playerId: 'p1'
        })).toEqual(status.ok());

        expect(ds.getRoomState('r1')).toEqual({
          created: true,
          players: set(),
        });
        expect(ds.getRoomState('r2')).toEqual({
          created: true,
          players: set('p1'),
        });
        expect(ds.getPlayerState('p1')).toEqual({
          currentRoomId: 'r2',
        });
      });
    });
  });
});

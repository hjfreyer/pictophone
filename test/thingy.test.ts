
import * as actions from '../src/actions';
import * as fake_ds from './fake_ds';
import * as status from '../src/status';
import * as streams from '../src/streams';
import * as states from '../src/states';
import { roomId, playerId } from '../src/states';

let ds: fake_ds.Datastore;

beforeEach(() => {
  ds = new fake_ds.Datastore();
});

function doAction(a: actions.Action): status.Status {
  return streams.apply(ds, streams.getActor(a));
}

describe('basic rooms', () => {
  test('start null', () => {
    expect(ds.get(roomId('r1'))).toBeNull();
    expect(ds.get(playerId('p1'))).toBeNull();
  });

  test('join creates lazily', () => {
    expect(doAction(actions.joinRoom('p1', 'r1'))).toEqual(status.ok());
    expect(ds.get(roomId('r1'))).toEqual({
      kind: states.ROOM,
      players: ['p1'],
    });
    expect(ds.get(playerId('p1'))).toEqual({
      kind: states.PLAYER,
      roomId: 'r1'
    });
  });

  test('multiple players join', () => {
    expect(doAction(actions.joinRoom('p1', 'r1'))).toEqual(status.ok());
    expect(doAction(actions.joinRoom('p2', 'r1'))).toEqual(status.ok());

    expect(ds.get(roomId('r1'))).toEqual({
      kind: states.ROOM,
      players: ['p1', 'p2'],
    });
    expect(ds.get(playerId('p2'))).toEqual({
      kind: states.PLAYER,
      roomId: 'r1'
    });
  });

  test('join idempotent', () => {
    expect(doAction(actions.joinRoom('p1', 'r1'))).toEqual(status.ok());
    expect(doAction(actions.joinRoom('p1', 'r1'))).toEqual(status.ok());

    expect(ds.get(roomId('r1'))).toEqual({
      kind: states.ROOM,
      players: ['p1'],
    });
    expect(ds.get(playerId('p1'))).toEqual({
      kind: states.PLAYER,
      roomId: 'r1'
    });
  });

  test('move between rooms', () => {
    expect(doAction(actions.joinRoom('p1', 'r1'))).toEqual(status.ok());
    expect(doAction(actions.joinRoom('p1', 'r2'))).toEqual(status.ok());

    expect(ds.get(roomId('r1'))).toEqual({
      kind: states.ROOM,
      players: [],
    });
    expect(ds.get(roomId('r2'))).toEqual({
      kind: states.ROOM,
      players: ['p1'],
    });
    expect(ds.get(playerId('p1'))).toEqual({
      kind: states.PLAYER,
      roomId: 'r2'
    });
  });

  test('p1 moves, p2 stays', () => {
    expect(doAction(actions.joinRoom('p1', 'r1'))).toEqual(status.ok());
    expect(doAction(actions.joinRoom('p2', 'r1'))).toEqual(status.ok());
    expect(doAction(actions.joinRoom('p1', 'r2'))).toEqual(status.ok());

    expect(ds.get(roomId('r1'))).toEqual({
      kind: states.ROOM,
      players: ['p2'],
    });
    expect(ds.get(roomId('r2'))).toEqual({
      kind: states.ROOM,
      players: ['p1'],
    });
    expect(ds.get(playerId('p1'))).toEqual({
      kind: states.PLAYER,
      roomId: 'r2'
    });
    expect(ds.get(playerId('p2'))).toEqual({
      kind: states.PLAYER,
      roomId: 'r1'
    });
  });
});

describe('create game', () => {
  beforeEach(() => {
    expect(doAction(actions.joinRoom('p1', 'r1'))).toEqual(status.ok());
    expect(doAction(actions.joinRoom('p2', 'r1'))).toEqual(status.ok());
  });

  test('create empty room', () => {
    expect(doAction(actions.createGame('r_bogus'))).toEqual(status.notFound());
  });

  test('create real room', () => {
    expect(doAction(actions.createGame('r1'))).toEqual(status.ok());
    expect(ds.get(roomId('r1'))).toEqual({
      kind: states.ROOM,
      players: [],
    });
    expect(ds.get(roomId('r1'))).toEqual({
      kind: states.ROOM,
      players: [],
    });
  });
});

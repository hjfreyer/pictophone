
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

function expectAction(a: actions.Action): jest.Matchers<status.Status> {
  return expect(streams.apply(ds, streams.getActor(a)));
}

describe('basic rooms', () => {
  test('start null', () => {
    expect(ds.get(roomId('r1'))).toBeNull();
    expect(ds.get(playerId('p1'))).toBeNull();
  });

  test('join creates lazily', () => {
    expectAction(actions.joinRoom('p1', 'r1')).toEqual(status.ok());
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
    expectAction(actions.joinRoom('p1', 'r1')).toEqual(status.ok());
    expectAction(actions.joinRoom('p2', 'r1')).toEqual(status.ok());

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
    expectAction(actions.joinRoom('p1', 'r1')).toEqual(status.ok());
    expectAction(actions.joinRoom('p1', 'r1')).toEqual(status.ok());

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
    expectAction(actions.joinRoom('p1', 'r1')).toEqual(status.ok());
    expectAction(actions.joinRoom('p1', 'r2')).toEqual(status.ok());

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
    expectAction(actions.joinRoom('p1', 'r1')).toEqual(status.ok());
    expectAction(actions.joinRoom('p2', 'r1')).toEqual(status.ok());
    expectAction(actions.joinRoom('p1', 'r2')).toEqual(status.ok());

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
    expectAction(actions.joinRoom('p1', 'r1')).toEqual(status.ok());
    expectAction(actions.joinRoom('p2', 'r1')).toEqual(status.ok());
  });

  test('create empty room', () => {
    expectAction(actions.createGame('r_bogus', 'g1'))
      .toEqual(status.notFound());
  });


  test('game id collision', () => {
    expectAction(actions.joinRoom('p3', 'r1')).toEqual(status.ok());
    expectAction(actions.createGame('r1', 'g1')).toEqual(status.ok());
    expectAction(actions.createGame('r2', 'g1')).toEqual(status.alreadyExists());
  });


  test('create real room', () => {
    expectAction(actions.createGame('r1', 'g1')).toEqual(status.ok());
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


import * as actions from '../src/actions';
import * as fake_ds from './fake_ds';
import * as status from '../src/status';
import * as base from '../src/base';
import * as streams from '../src/streams';
import * as states from '../src/states';
import { roomId, playerId, gameId } from '../src/streams';

let ds: fake_ds.Datastore;

beforeEach(() => {
  ds = new fake_ds.Datastore();
});

function doAction(a: actions.Action): any {
  return base.apply(ds, streams.actor2, JSON.stringify(a));
}

function expectAction(a: actions.Action): jest.Matchers<status.Status> {
  return expect(doAction(a).status);
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
    expectAction(actions.createGame('r_bogus'))
      .toEqual(status.notFound());
  });

  //
  // test('game id collision', () => {
  //   expectAction(actions.joinRoom('p3', 'r1')).toEqual(status.ok());
  //   expectAction(actions.createGame('r1')).toEqual(status.ok());
  //   expectAction(actions.createGame('r2')).toEqual(status.alreadyExists());
  // });


  test('create real game', () => {
    const res = doAction(actions.createGame('r1'));
    expect(res.status).toEqual(status.ok());
    expect(ds.get(roomId('r1'))).toBeNull();
    expect(ds.get(playerId('p1'))).toEqual({
      kind: states.PLAYER,
      roomId: null,
    });
    expect(ds.get(playerId('p2'))).toEqual({
      kind: states.PLAYER,
      roomId: null,
    });
    expect(res.gameId).toEqual(gameId('eyk3YYeOG3Q0ybkg'));
    expect(ds.get(gameId(res.gameId.id))).toEqual({
      kind: states.GAME,
      permutation: [1, 0],
      players: ['p1', 'p2'],
    });
  });

  test('games from same room dont collide', () => {
    doAction(actions.createGame('r1'));
    expectAction(actions.joinRoom('p3', 'r1')).toEqual(status.ok());
    expectAction(actions.joinRoom('p4', 'r1')).toEqual(status.ok());
    expectAction(actions.joinRoom('p5', 'r1')).toEqual(status.ok());

    expect(ds.get(roomId('r1'))).toEqual({
      kind: states.ROOM,
      players: ['p3', 'p4', 'p5'],
    });

    const res = doAction(actions.createGame('r1'));
    expect(res.status).toEqual(status.ok());
    expect(res.gameId).toEqual(gameId('dA3OecVB5gcgsu0x'));
    expect(ds.get(gameId(res.gameId.id))).toEqual({
      kind: states.GAME,
      permutation: [1, 2, 0],
      players: ['p3', 'p4', 'p5'],
    });
  });
});

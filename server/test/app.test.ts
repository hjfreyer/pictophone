
import * as actions from '../src/actions';
import * as fake_ds from './fake_ds';
import * as status from 'status';
import * as base from 'knit';
import * as streams from '../src/streams';
import * as model from '../src/model';
import { roomId, playerId, gameId } from '../src/streams';

let ds: fake_ds.Datastore;
const [p1, p2, p3, p4, p5] = 'p1,p2,p3,p4,p5'.split(',').map(playerId);
const [r1, r2] = 'r1,r2'.split(',').map(roomId);

beforeEach(() => {
  ds = new fake_ds.Datastore();
});

let timeMillis = 1000;
function doAction(a: actions.Action): any {
  timeMillis++;
  return base.apply(ds, streams.actor2, { action: JSON.stringify(a), timeMillis });
}

function expectAction(a: actions.Action): jest.Matchers<status.Status> {
  return expect(doAction(a).status);
}

describe('basic rooms', () => {
  test('start null', () => {
    expect(ds.get(r1)).toBeNull();
    expect(ds.get(p1)).toBeNull();
  });

  test('join creates lazily', () => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expect(ds.get(r1)).toEqual({
      kind: model.ROOM,
      players: [p1],
    });
    expect(ds.get(p1)).toEqual({
      kind: model.PLAYER,
      room: r1
    });
  });

  test('multiple players join', () => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p2, r1)).toEqual(status.ok());

    expect(ds.get(r1)).toEqual({
      kind: model.ROOM,
      players: [p1, p2],
    });
    expect(ds.get(p2)).toEqual({
      kind: model.PLAYER,
      room: r1
    });
  });

  test('join idempotent', () => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());

    expect(ds.get(r1)).toEqual({
      kind: model.ROOM,
      players: [p1],
    });
    expect(ds.get(p1)).toEqual({
      kind: model.PLAYER,
      room: r1
    });
  });

  test('move between rooms', () => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p1, r2)).toEqual(status.ok());

    expect(ds.get(r1)).toEqual({
      kind: model.ROOM,
      players: [],
    });
    expect(ds.get(r2)).toEqual({
      kind: model.ROOM,
      players: [p1],
    });
    expect(ds.get(p1)).toEqual({
      kind: model.PLAYER,
      room: r2
    });
  });

  test('p1 moves, p2 stays', () => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p2, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p1, r2)).toEqual(status.ok());

    expect(ds.get(r1)).toEqual({
      kind: model.ROOM,
      players: [p2],
    });
    expect(ds.get(r2)).toEqual({
      kind: model.ROOM,
      players: [p1],
    });
    expect(ds.get(p1)).toEqual({
      kind: model.PLAYER,
      room: r2
    });
    expect(ds.get(p2)).toEqual({
      kind: model.PLAYER,
      room: r1
    });
  });
});

describe('create game', () => {
  beforeEach(() => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p2, r1)).toEqual(status.ok());
  });

  test('create empty room', () => {
    expectAction(actions.createGame('r_bogus'))
      .toEqual(status.notFound());
  });

  test('create real game', () => {
    const res = doAction(actions.createGame(r1));
    expect(res.status).toEqual(status.ok());
    expect(ds.get(r1)).toBeNull();
    expect(ds.get(p1)).toEqual({
      kind: model.PLAYER,
      room: '',
    });
    expect(ds.get(p2)).toEqual({
      kind: model.PLAYER,
      room: '',
    });
    expect(res.gameId).toEqual(gameId('oTaxL2lLrlTQzNVA'));
    expect(ds.get(res.gameId)).toEqual({
      kind: model.GAME,
      permutation: [1, 0],
      players: [p1, p2],
    });
  });

  test('games from same room dont collide', () => {
    doAction(actions.createGame(r1));
    expectAction(actions.joinRoom(p3, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p4, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p5, r1)).toEqual(status.ok());

    expect(ds.get(r1)).toEqual({
      kind: model.ROOM,
      players: [p3, p4, p5],
    });

    const res = doAction(actions.createGame(r1));
    expect(res.status).toEqual(status.ok());
    expect(res.gameId).toEqual(gameId('U9mBGCVUaWD5uPE9'));
    expect(ds.get(res.gameId)).toEqual({
      kind: model.GAME,
      permutation: [2, 0, 1],
      players: [p3, p4, p5],
    });
  });
});

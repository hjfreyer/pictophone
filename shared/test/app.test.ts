
import { unittest } from '../src/knit';
import * as status from '@hjfreyer/status';
import * as actions from '../src/actions';
import * as model from '../src/model';
import * as streams from '../src/streams';

const [p1, p2, p3, p4, p5] = 'p1,p2,p3,p4,p5'.split(',').map(model.playerId);
const [r1, r2] = 'r1,r2'.split(',').map(model.roomId);

let t: unittest.Tester;
beforeEach(() => {
  t = new unittest.Tester(streams.actor2);
});

function doAction(a: actions.Action): any {
  return t.do(JSON.stringify(a));
}

function expectAction(a: actions.Action): jest.Matchers<status.Status> {
  return expect(doAction(a).status);
}

describe('basic rooms', () => {
  test('start null', () => {
    expect(t.get(r1)).toBeNull();
    expect(t.get(p1)).toBeNull();
  });

  test('join creates lazily', () => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expect(t.get(r1)).toEqual({
      kind: model.ROOM,
      players: [p1],
    });
    expect(t.get(p1)).toEqual({
      kind: model.PLAYER,
      room: r1
    });
  });

  test('multiple players join', () => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p2, r1)).toEqual(status.ok());

    expect(t.get(r1)).toEqual({
      kind: model.ROOM,
      players: [p1, p2],
    });
    expect(t.get(p2)).toEqual({
      kind: model.PLAYER,
      room: r1
    });
  });

  test('join idempotent', () => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());

    expect(t.get(r1)).toEqual({
      kind: model.ROOM,
      players: [p1],
    });
    expect(t.get(p1)).toEqual({
      kind: model.PLAYER,
      room: r1
    });
  });

  test('move between rooms', () => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p1, r2)).toEqual(status.ok());

    expect(t.get(r1)).toEqual({
      kind: model.ROOM,
      players: [],
    });
    expect(t.get(r2)).toEqual({
      kind: model.ROOM,
      players: [p1],
    });
    expect(t.get(p1)).toEqual({
      kind: model.PLAYER,
      room: r2
    });
  });

  test('leave room', () => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p2, r1)).toEqual(status.ok());

    expectAction(actions.joinRoom(p1, '')).toEqual(status.ok());
    expect(t.get(r1)).toEqual({
      kind: model.ROOM,
      players: [p2],
    });
    expect(t.get('')).toBeNull();
    expect(t.get(p1)).toEqual({
      kind: model.PLAYER,
      room: '',
    });
    expect(t.get(p2)).toEqual({
      kind: model.PLAYER,
      room: r1,
    });
  });

  test('abandon room', () => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p2, r1)).toEqual(status.ok());

    expectAction(actions.joinRoom(p1, '')).toEqual(status.ok());
    expectAction(actions.joinRoom(p2, r2)).toEqual(status.ok());

    expect(t.get(r1)).toEqual({
      kind: model.ROOM,
      players: [],
    });
  });

  test('p1 moves, p2 stays', () => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p2, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p1, r2)).toEqual(status.ok());

    expect(t.get(r1)).toEqual({
      kind: model.ROOM,
      players: [p2],
    });
    expect(t.get(r2)).toEqual({
      kind: model.ROOM,
      players: [p1],
    });
    expect(t.get(p1)).toEqual({
      kind: model.PLAYER,
      room: r2
    });
    expect(t.get(p2)).toEqual({
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
    expect(t.get(r1)).toBeNull();
    expect(t.get(p1)).toEqual({
      kind: model.PLAYER,
      room: '',
    });
    expect(t.get(p2)).toEqual({
      kind: model.PLAYER,
      room: '',
    });
    expect(res.gameId).toEqual(model.gameId('V0PbCfSD2t6xJip9'));
    expect(t.get(res.gameId)).toEqual({
      kind: model.GAME,
      permutation: [1, 0],
      players: [p1, p2],
    });
    expect(t.get(model.playerGameViewId(p1, res.gameId))).toEqual({
      kind: "PLAYER_GAME_VIEW",
      view: { state: "FIRST_PROMPT" },
    });
    expect(t.get(model.playerGameViewId(p2, res.gameId))).toEqual({
      kind: "PLAYER_GAME_VIEW",
      view: { state: "FIRST_PROMPT" },
    });
  });

  test('games from same room dont collide', () => {
    doAction(actions.createGame(r1));
    expectAction(actions.joinRoom(p3, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p4, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p5, r1)).toEqual(status.ok());

    expect(t.get(r1)).toEqual({
      kind: model.ROOM,
      players: [p3, p4, p5],
    });

    const res = doAction(actions.createGame(r1));
    expect(res.status).toEqual(status.ok());
    expect(res.gameId).toEqual(model.gameId('KcdedALemq5J4wyS'));
    expect(t.get(res.gameId)).toEqual({
      kind: model.GAME,
      permutation: [2, 0, 1],
      players: [p3, p4, p5],
    });
  });
});

describe('gameplay', () => {
  beforeEach(() => {
    expectAction(actions.joinRoom(p1, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p2, r1)).toEqual(status.ok());
    expectAction(actions.joinRoom(p3, r1)).toEqual(status.ok());
    expectAction(actions.createGame(r1)).toEqual(status.ok());
  });

  test('trivial', () => {
  })
});

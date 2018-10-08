
import * as status from '@hjfreyer/status';
import * as gp from '../src/gameplay';

export type Functor = (g: gp.Game) => [status.Status, gp.Game];

const submit = (player: number, word: string): Functor => (g: gp.Game) => gp.submit(g, player, word);

function snapshotTest(permutation: number[], actions: Functor[]): () => void {
  return () => {
    let g = gp.newGame(permutation);
    expect(g).toMatchSnapshot();
    for (const action of actions) {
      let s: status.Status;
      [s, g] = action(g);
      expect(s).toEqual(status.ok());
      const views = g.permutation.map((_, idx) => gp.project(g, idx));
      expect({ game: g, views }).toMatchSnapshot();
    }
  };
}

function errorTest(err: status.Status, permutation: number[], actions: Functor[]): () => void {
  return () => {
    let g = gp.newGame(permutation);
    for (const action of actions.slice(0, actions.length - 1)) {
      let s: status.Status;
      [s, g] = action(g);
      expect(s).toEqual(status.ok());
    }
    let [s, g2] = actions[actions.length - 1](g);
    expect(s).toEqual(err);
    expect(g2).toEqual(g);
  };
}

test('new game', snapshotTest([2, 0, 1], []));

test('double submit', errorTest(status.alreadyExists(), [2, 0, 1], [
  submit(1, 'foo'),
  submit(1, 'bar'),
]));

test('do a round', snapshotTest([2, 0, 1], [
  submit(0, 'foo'),
  submit(2, 'bar'),
  submit(1, 'baz'),
]));

test('do a game', snapshotTest([2, 0, 1], [
  submit(0, 'one'),
  submit(1, 'ay'),
  submit(2, 'do'),
  submit(1, 're'),
  submit(0, 'bee'),
  submit(2, 'two'),
  submit(1, 'three'),
  submit(2, 'cee'),
  submit(0, 'mi'),
]));

test('permutation is always fully cyclic', snapshotTest([0, 2, 1], [
  submit(0, 'ay'),
  submit(1, 'do'),
  submit(2, 'one'),
  submit(2, 're'),
  submit(0, 'two'),
  submit(1, 'bee'),
  submit(1, 'three'),
  submit(2, 'cee'),
  submit(0, 'mi'),
]));

test('play past end', errorTest(status.preconditionFailed(), [0, 1], [
  submit(0, 'foo'),
  submit(1, 'bar'),
  submit(0, 'baz'),
  submit(1, 'qux'),
  submit(0, 'bad'),
]));

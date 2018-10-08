
import * as immer from "immer";
import * as status from '@hjfreyer/status';

export type Game = Readonly<{
  permutation: number[];
  responses: string[][];
}>;

export function newGame(permutation: number[]): Game {
  return {
    permutation,
    responses: permutation.map(_ => []),
  };
}

function nextPlayer(permutation: number[], player: number): number {
  const idx = permutation.indexOf(player);
  return permutation[(idx + 1) % permutation.length];
}

function _submit(g: immer.DraftObject<Game>, player: number, word: string): Game {
  const minLength = Math.min(...g.responses.map(a => a.length));

  if (g.responses[player].length != minLength) {
    throw status.alreadyExists();
  }
  if (minLength == g.permutation.length) {
    // Game over.
    throw status.preconditionFailed();
  }

  g.responses[player].push(word);
  return g;
}

export function submit(g: Game, player: number, word: string): [status.Status, Game] {
  try {
    const g2 = immer.produce(g, g => _submit(g, player, word));
    return [status.ok(), g2];
  } catch (s) {
    return [s as status.Status, g];
  }

  // //  const [s, g2] = produce([status.ok(), g], ([s, g]: immer.Draft<[status.Status, Game]>) => _submit(g, player, word));
  // return (g: Game) => {
  //   if (!status.ok()) {
  //7
  //   }
  // });
}

export type PlayerView = SimpleView | RespondToPromptView;

type SimpleView = {
  state: 'FIRST_PROMPT' | 'WAITING_FOR_OTHERS' | 'GAME_OVER';
}

type RespondToPromptView = {
  state: 'RESPOND_TO_PROMPT';
  prompt: string;
}

export function project(g: Game, player: number): PlayerView {
  const minLength = Math.min(...g.responses.map(a => a.length));

  if (minLength == g.permutation.length) {
    return { state: 'GAME_OVER' };
  }

  if (minLength < g.responses[player].length) {
    return { state: 'WAITING_FOR_OTHERS' };
  }

  if (minLength == 0) {
    return { state: 'FIRST_PROMPT' };
  }

  const prompt = g.responses[nextPlayer(g.permutation, player)][minLength - 1];
  return {
    state: 'RESPOND_TO_PROMPT',
    prompt
  };
}

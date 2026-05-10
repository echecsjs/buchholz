import { opponents, score } from './utilities.js';

import type { CompletedRound, Player } from '@echecs/tournament';

function foreBuchholz(
  player: string,
  rounds: CompletedRound[],
  _players: Player[],
): number {
  const lastIndex = rounds.length - 1;
  const adjusted: CompletedRound[] = rounds.map((round, index) =>
    index === lastIndex
      ? {
          ...round,
          games: round.games.map((g) => ({
            black: g.black,
            result: 'draw' as const,
            white: g.white,
          })),
        }
      : round,
  );
  let sum = 0;
  for (const id of opponents(player, rounds)) {
    sum += score(id, adjusted);
  }
  return sum;
}

export { foreBuchholz, foreBuchholz as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';

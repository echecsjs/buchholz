import { applyCuts, contributions } from './utilities.js';

import type { CompletedRound, Player } from '@echecs/tournament';

function buchholzMedian2(
  player: string,
  rounds: CompletedRound[],
  _players: Player[],
): number {
  const items = contributions(player, rounds);
  const afterCutLow = applyCuts(items, 2);
  const sorted = [...afterCutLow].toSorted((a, b) => b.value - a.value);
  return sorted.slice(2).reduce((sum, c) => sum + c.value, 0);
}

export { buchholzMedian2, buchholzMedian2 as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';

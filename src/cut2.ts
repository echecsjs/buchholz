import { applyCuts, contributions } from './utilities.js';

import type { CompletedRound, Player } from '@echecs/tournament';

function buchholzCut2(
  player: string,
  rounds: CompletedRound[],
  _players: Player[],
): number {
  return applyCuts(contributions(player, rounds), 2).reduce(
    (sum, c) => sum + c.value,
    0,
  );
}

export { buchholzCut2, buchholzCut2 as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';

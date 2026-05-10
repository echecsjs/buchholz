import { applyCuts, contributions } from './utilities.js';

import type { CompletedRound, Player } from '@echecs/tournament';

function buchholzCut1(
  player: string,
  rounds: CompletedRound[],
  _players: Player[],
): number {
  return applyCuts(contributions(player, rounds), 1).reduce(
    (sum, c) => sum + c.value,
    0,
  );
}

export { buchholzCut1, buchholzCut1 as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';

import { contributions } from './utilities.js';

import type { CompletedRound, Player } from '@echecs/tournament';

function buchholz(
  player: string,
  rounds: CompletedRound[],
  _players: Player[],
): number {
  return contributions(player, rounds).reduce((sum, c) => sum + c.value, 0);
}

export { buchholz, buchholz as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';

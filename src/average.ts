import { opponents } from './utilities.js';

import type { CompletedRound, Player } from '@echecs/tournament';

import { buchholz } from './index.js';

function averageOpponentsBuchholz(
  player: string,
  rounds: CompletedRound[],
  players: Player[],
): number {
  const opps = opponents(player, rounds);
  if (opps.length === 0) {
    return 0;
  }
  let sum = 0;
  for (const id of opps) {
    sum += buchholz(id, rounds, players);
  }
  return sum / opps.length;
}

export { averageOpponentsBuchholz, averageOpponentsBuchholz as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';

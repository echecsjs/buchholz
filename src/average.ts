import { opponents } from './utilities.js';

import type { Game } from './types.js';

import { buchholz } from './index.js';

function averageOpponentsBuchholz(player: string, games: Game[][]): number {
  const opps = opponents(player, games);
  if (opps.length === 0) {
    return 0;
  }
  let sum = 0;
  for (const id of opps) {
    sum += buchholz(id, games);
  }
  return sum / opps.length;
}

export { averageOpponentsBuchholz, averageOpponentsBuchholz as tiebreak };

export type { Game, GameKind, Player, Result } from './types.js';

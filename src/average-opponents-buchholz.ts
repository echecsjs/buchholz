import { buchholz } from './buchholz.js';
import { opponents } from './utilities.js';

import type { Game } from './types.js';

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

export { averageOpponentsBuchholz };

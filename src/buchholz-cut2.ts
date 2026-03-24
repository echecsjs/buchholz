import { applyCuts, contributions } from './utilities.js';

import type { Game } from './types.js';

function buchholzCut2(player: string, games: Game[][]): number {
  return applyCuts(contributions(player, games), 2).reduce(
    (sum, c) => sum + c.value,
    0,
  );
}

export { buchholzCut2 };

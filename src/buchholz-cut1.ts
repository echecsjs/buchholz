import { applyCuts, contributions } from './utilities.js';

import type { Game } from './types.js';

function buchholzCut1(player: string, games: Game[][]): number {
  return applyCuts(contributions(player, games), 1).reduce(
    (sum, c) => sum + c.value,
    0,
  );
}

export { buchholzCut1 };

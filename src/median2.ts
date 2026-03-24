import { applyCuts, contributions } from './utilities.js';

import type { Game } from './types.js';

function buchholzMedian2(player: string, games: Game[][]): number {
  const items = contributions(player, games);
  const afterCutLow = applyCuts(items, 2);
  const sorted = [...afterCutLow].toSorted((a, b) => b.value - a.value);
  return sorted.slice(2).reduce((sum, c) => sum + c.value, 0);
}

export { buchholzMedian2, buchholzMedian2 as tiebreak };

export type { Game, GameKind, Player, Result } from './types.js';

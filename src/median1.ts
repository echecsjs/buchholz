import { applyCuts, contributions } from './utilities.js';

import type { Game } from './types.js';

function buchholzMedian1(player: string, games: Game[][]): number {
  const items = contributions(player, games);
  const afterCutLow = applyCuts(items, 1);
  // Cut highest (no VUR exception for high cuts)
  const sorted = [...afterCutLow].toSorted((a, b) => b.value - a.value);
  return sorted.slice(1).reduce((sum, c) => sum + c.value, 0);
}

export { buchholzMedian1, buchholzMedian1 as tiebreak };

export type { Game, GameKind, Player, Result } from './types.js';

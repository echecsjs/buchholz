import { contributions } from './utilities.js';

import type { Game } from './types.js';

function buchholz(player: string, games: Game[][]): number {
  return contributions(player, games).reduce((sum, c) => sum + c.value, 0);
}

export { buchholz, buchholz as tiebreak };

export type { Game, GameKind, Player, Result } from './types.js';

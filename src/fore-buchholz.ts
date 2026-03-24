import { opponents, score } from './utilities.js';

import type { Game } from './types.js';

function foreBuchholz(player: string, games: Game[][]): number {
  const lastIndex = games.length - 1;
  const adjusted: Game[][] = games.map((round, index) =>
    index === lastIndex
      ? round.map((g) => ({ ...g, result: 0.5 as const }))
      : round,
  );
  let sum = 0;
  for (const id of opponents(player, games)) {
    sum += score(id, adjusted);
  }
  return sum;
}

export { foreBuchholz };

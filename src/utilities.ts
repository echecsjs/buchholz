import type { Game } from './types.js';

const BYE_SENTINEL = '';

function gamesForPlayer(playerId: string, games: Game[][]): Game[] {
  return games.flat().filter((g) => g.whiteId === playerId || g.blackId === playerId);
}

function opponentIds(playerId: string, games: Game[][]): string[] {
  return gamesForPlayer(playerId, games)
    .filter((g) => g.blackId !== BYE_SENTINEL)
    .map((g) => (g.whiteId === playerId ? g.blackId : g.whiteId));
}

function score(playerId: string, games: Game[][]): number {
  let sum = 0;
  for (const g of gamesForPlayer(playerId, games)) {
    sum += g.whiteId === playerId ? g.result : 1 - g.result;
  }
  return sum;
}

export { BYE_SENTINEL, gamesForPlayer, opponentIds, score };

import { opponentIds, score } from './utilities.js';

import type { Game } from './types.js';

function buchholz(playerId: string, games: Game[][]): number {
  let sum = 0;
  for (const id of opponentIds(playerId, games)) {
    sum += score(id, games);
  }
  return sum;
}

function buchholzCut1(playerId: string, games: Game[][]): number {
  const scores = opponentIds(playerId, games)
    .map((id) => score(id, games))
    .toSorted((a, b) => a - b);
  return scores.slice(1).reduce((sum, s) => sum + s, 0);
}

function buchholzCut2(playerId: string, games: Game[][]): number {
  const scores = opponentIds(playerId, games)
    .map((id) => score(id, games))
    .toSorted((a, b) => a - b);
  return scores.slice(2).reduce((sum, s) => sum + s, 0);
}

function buchholzMedian1(playerId: string, games: Game[][]): number {
  const scores = opponentIds(playerId, games)
    .map((id) => score(id, games))
    .toSorted((a, b) => a - b);
  return scores.slice(1, -1).reduce((sum, s) => sum + s, 0);
}

function buchholzMedian2(playerId: string, games: Game[][]): number {
  const scores = opponentIds(playerId, games)
    .map((id) => score(id, games))
    .toSorted((a, b) => a - b);
  return scores.slice(2, -2).reduce((sum, s) => sum + s, 0);
}

function averageOpponentsBuchholz(playerId: string, games: Game[][]): number {
  const opponents = opponentIds(playerId, games);
  if (opponents.length === 0) {
    return 0;
  }
  let sum = 0;
  for (const id of opponents) {
    sum += buchholz(id, games);
  }
  return sum / opponents.length;
}

function foreBuchholz(playerId: string, games: Game[][]): number {
  const lastIndex = games.length - 1;
  const adjusted: Game[][] = games.map((round, index) =>
    index === lastIndex
      ? round.map((g) => ({ ...g, result: 0.5 as const }))
      : round,
  );
  let sum = 0;
  for (const id of opponentIds(playerId, games)) {
    sum += score(id, adjusted);
  }
  return sum;
}

export {
  averageOpponentsBuchholz,
  buchholz,
  buchholzCut1,
  buchholzCut2,
  buchholzMedian1,
  buchholzMedian2,
  foreBuchholz,
};

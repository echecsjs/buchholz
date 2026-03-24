import {
  BYE_SENTINEL,
  adjustedScore,
  dummyScore,
  isUnplayed,
  isVUR,
  opponentIds,
  playerGameKind,
  score,
} from './utilities.js';

import type { Game } from './types.js';

interface Contribution {
  isVUR: boolean;
  value: number;
}

/**
 * Collect Buchholz contributions for a player per FIDE 16.
 */
function contributions(playerId: string, games: Game[][]): Contribution[] {
  const result: Contribution[] = [];

  for (const round of games) {
    for (const g of round) {
      if (g.white !== playerId && g.black !== playerId) {
        continue;
      }

      const pKind = playerGameKind(playerId, g);

      if (isUnplayed(pKind)) {
        // FIDE 16.4: participant's own unplayed round → dummy opponent
        result.push({
          isVUR: isVUR(pKind),
          value: dummyScore(playerId, games, g),
        });
      } else if (g.black !== BYE_SENTINEL && g.white !== BYE_SENTINEL) {
        // OTB game → opponent's adjusted score (FIDE 16.3)
        const opponentId = g.white === playerId ? g.black : g.white;
        result.push({
          isVUR: false,
          value: adjustedScore(opponentId, games),
        });
      }
      // Byes without kind (legacy sentinel byes) are skipped — same as before
    }
  }

  return result;
}

function buchholz(playerId: string, games: Game[][]): number {
  return contributions(playerId, games).reduce((sum, c) => sum + c.value, 0);
}

/**
 * FIDE 16.5 Cut-1 Exception: When cutting the least significant value
 * for a participant with VURs, cut the lowest VUR contribution first,
 * as long as it's not lower than the least significant value.
 *
 * Implementation: sort all contributions ascending. For each cut needed,
 * if there's a VUR contribution, cut it (it's always >= the minimum
 * since we're iterating from lowest). Otherwise cut the overall lowest.
 */
function applyCuts(items: Contribution[], count: number): Contribution[] {
  if (count <= 0 || items.length === 0) {
    return [...items];
  }

  const sorted = [...items].toSorted((a, b) => a.value - b.value);
  const result = [...sorted];

  for (let index = 0; index < count && result.length > 0; index++) {
    // FIDE 16.5: prefer cutting VUR contributions
    const vurIndex = result.findIndex((c) => c.isVUR);
    if (vurIndex === -1) {
      result.shift();
    } else {
      result.splice(vurIndex, 1);
    }
  }

  return result;
}

function buchholzCut1(playerId: string, games: Game[][]): number {
  return applyCuts(contributions(playerId, games), 1).reduce(
    (sum, c) => sum + c.value,
    0,
  );
}

function buchholzCut2(playerId: string, games: Game[][]): number {
  return applyCuts(contributions(playerId, games), 2).reduce(
    (sum, c) => sum + c.value,
    0,
  );
}

function buchholzMedian1(playerId: string, games: Game[][]): number {
  const items = contributions(playerId, games);
  const afterCutLow = applyCuts(items, 1);
  // Cut highest (no VUR exception for high cuts)
  const sorted = [...afterCutLow].toSorted((a, b) => b.value - a.value);
  return sorted.slice(1).reduce((sum, c) => sum + c.value, 0);
}

function buchholzMedian2(playerId: string, games: Game[][]): number {
  const items = contributions(playerId, games);
  const afterCutLow = applyCuts(items, 2);
  const sorted = [...afterCutLow].toSorted((a, b) => b.value - a.value);
  return sorted.slice(2).reduce((sum, c) => sum + c.value, 0);
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

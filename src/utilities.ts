import type { Game, GameKind } from './types.js';

interface Contribution {
  isVUR: boolean;
  value: number;
}

const VUR_KINDS = new Set<GameKind>(['forfeit-loss', 'half-bye', 'zero-bye']);

/**
 * Returns the game kind from a specific player's perspective.
 * For forfeits, the perspective matters: 'forfeit-win' from white's
 * perspective is 'forfeit-loss' from black's perspective.
 */
function playerGameKind(player: string, game: Game): GameKind | undefined {
  if (game.kind === undefined) {
    return undefined;
  }
  if (game.kind === 'forfeit-win') {
    return game.white === player ? 'forfeit-win' : 'forfeit-loss';
  }
  if (game.kind === 'forfeit-loss') {
    return game.white === player ? 'forfeit-loss' : 'forfeit-win';
  }
  return game.kind;
}

function isVUR(kind?: GameKind): boolean {
  return kind !== undefined && VUR_KINDS.has(kind);
}

function isUnplayed(kind?: GameKind): boolean {
  return kind !== undefined;
}

/**
 * FIDE 16.2.5: A requested bye is "terminal" if all subsequent rounds
 * for this player are also VURs (or it's the last round).
 */
function isTerminalBye(
  player: string,
  games: Game[][],
  roundIndex: number,
): boolean {
  for (let index = roundIndex + 1; index < games.length; index++) {
    for (const g of games[index] ?? []) {
      if (g.white === player || g.black === player) {
        const pKind = playerGameKind(player, g);
        if (!isVUR(pKind)) {
          return false;
        }
      }
    }
  }
  return true;
}

function gamesForPlayer(player: string, games: Game[][]): Game[] {
  return games.flat().filter((g) => g.white === player || g.black === player);
}

function opponents(player: string, games: Game[][]): string[] {
  return gamesForPlayer(player, games)
    .filter((g) => g.black !== g.white)
    .map((g) => (g.white === player ? g.black : g.white));
}

/**
 * Raw score — sum of awarded points, no FIDE 16 adjustments.
 */
function score(player: string, games: Game[][]): number {
  let sum = 0;
  for (const g of gamesForPlayer(player, games)) {
    sum += g.white === player ? g.result : 1 - g.result;
  }
  return sum;
}

/**
 * FIDE 16.3: Adjusted score for the purpose of calculating opponents'
 * tiebreaks. Terminal requested byes (16.2.5) are evaluated as draws.
 */
function adjustedScore(player: string, games: Game[][]): number {
  let sum = 0;
  for (const [roundIndex, round] of games.entries()) {
    for (const g of round) {
      if (g.white !== player && g.black !== player) {
        continue;
      }
      const points = g.white === player ? g.result : 1 - g.result;
      const pKind = playerGameKind(player, g);
      sum +=
        (pKind === 'half-bye' || pKind === 'zero-bye') &&
        isTerminalBye(player, games, roundIndex)
          ? 0.5
          : points;
    }
  }
  return sum;
}

/**
 * FIDE 16.4: Dummy score for a participant's own unplayed round.
 * Dummy score = participant's score, capped at:
 * - 16.4.1: opponent's adjusted score (for forfeits)
 * - 16.4.2: 0.5 × total rounds (for other byes)
 */
function dummyScore(player: string, games: Game[][], game: Game): number {
  const playerOwnScore = score(player, games);
  const pKind = playerGameKind(player, game);
  if (pKind === 'forfeit-win' || pKind === 'forfeit-loss') {
    const opponent = game.white === player ? game.black : game.white;
    if (game.black === game.white) {
      return Math.min(playerOwnScore, games.length * 0.5);
    }
    return Math.min(playerOwnScore, adjustedScore(opponent, games));
  }
  return Math.min(playerOwnScore, games.length * 0.5);
}

/**
 * Collect Buchholz contributions for a player per FIDE 16.
 */
function contributions(player: string, games: Game[][]): Contribution[] {
  const result: Contribution[] = [];

  for (const round of games) {
    for (const g of round) {
      if (g.white !== player && g.black !== player) {
        continue;
      }

      const pKind = playerGameKind(player, g);

      if (isUnplayed(pKind)) {
        // FIDE 16.4: participant's own unplayed round → dummy opponent
        result.push({
          isVUR: isVUR(pKind),
          value: dummyScore(player, games, g),
        });
      } else if (g.black !== g.white) {
        // OTB game → opponent's adjusted score (FIDE 16.3)
        const opponent = g.white === player ? g.black : g.white;
        result.push({
          isVUR: false,
          value: adjustedScore(opponent, games),
        });
      }
      // Byes without kind (legacy sentinel byes) are skipped — same as before
    }
  }

  return result;
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

export {
  adjustedScore,
  applyCuts,
  contributions,
  dummyScore,
  gamesForPlayer,
  isUnplayed,
  isVUR,
  opponents,
  playerGameKind,
  score,
};

export type { Contribution };

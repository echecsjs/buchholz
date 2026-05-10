import type { Bye, CompletedRound, Game } from '@echecs/tournament';

interface Contribution {
  isVUR: boolean;
  value: number;
}

/** VUR bye kinds: requested byes and forfeit losses. */
const VUR_BYE_KINDS = new Set<Bye['kind']>(['half', 'zero']);

function scoreFor(player: string, game: Game): number {
  if (game.result === 'draw') {
    return 0.5;
  }
  if (game.result === 'none') {
    return 0;
  }
  return (game.result === 'white' && game.white === player) ||
    (game.result === 'black' && game.black === player)
    ? 1
    : 0;
}

function gamesForPlayer(player: string, rounds: CompletedRound[]): Game[] {
  return rounds
    .flatMap((r) => r.games)
    .filter((g) => g.white === player || g.black === player);
}

function opponents(player: string, rounds: CompletedRound[]): string[] {
  return gamesForPlayer(player, rounds).map((g) =>
    g.white === player ? g.black : g.white,
  );
}

/** Find the bye entry for a player in a round, if any. */
function byeForPlayer(player: string, round: CompletedRound): Bye | undefined {
  return round.byes.find((b) => b.player === player);
}

/** Is this bye a VUR (voluntary unplayed round)? */
function isByeVUR(bye: Bye): boolean {
  return VUR_BYE_KINDS.has(bye.kind);
}

/** Is a forfeit game a VUR from the given player's perspective? */
function isForfeitVUR(player: string, game: Game): boolean {
  if (game.forfeit === undefined) {
    return false;
  }
  if (game.forfeit === 'both') {
    return true;
  }
  // forfeit-loss is a VUR for the forfeiting player
  return (
    (game.forfeit === 'white' && game.white === player) ||
    (game.forfeit === 'black' && game.black === player)
  );
}

/**
 * FIDE 16.2.5: A requested bye is "terminal" if all subsequent rounds
 * for this player are also VURs (or it's the last round).
 */
function isTerminalBye(
  player: string,
  rounds: CompletedRound[],
  roundIndex: number,
): boolean {
  for (const round of rounds.slice(roundIndex + 1)) {
    // Check if player has a non-VUR bye
    const bye = byeForPlayer(player, round);
    if (bye !== undefined) {
      if (!isByeVUR(bye)) {
        return false;
      }
      continue;
    }
    // Check if player has a non-VUR game
    for (const g of round.games) {
      if (
        (g.white === player || g.black === player) &&
        !isForfeitVUR(player, g)
      ) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Raw score — sum of awarded points from games, no FIDE 16 adjustments.
 * Does not include bye points (those are in Player.points).
 */
function score(player: string, rounds: CompletedRound[]): number {
  let sum = 0;
  for (const g of gamesForPlayer(player, rounds)) {
    sum += scoreFor(player, g);
  }
  // Add bye points
  for (const round of rounds) {
    const bye = byeForPlayer(player, round);
    if (bye !== undefined) {
      if (bye.kind === 'full' || bye.kind === 'pairing') {
        sum += 1;
      } else if (bye.kind === 'half') {
        sum += 0.5;
      }
      // zero-bye: 0 points
    }
  }
  return sum;
}

/**
 * FIDE 16.3: Adjusted score for the purpose of calculating opponents'
 * tiebreaks. Terminal requested byes (16.2.5) are evaluated as draws.
 */
function adjustedScore(player: string, rounds: CompletedRound[]): number {
  let sum = 0;
  for (const [roundIndex, round] of rounds.entries()) {
    // Check for bye in this round
    const bye = byeForPlayer(player, round);
    if (bye !== undefined) {
      if (isByeVUR(bye) && isTerminalBye(player, rounds, roundIndex)) {
        // 16.2.5 terminal bye -> draw
        sum += 0.5;
      } else if (bye.kind === 'full' || bye.kind === 'pairing') {
        sum += 1;
      } else if (bye.kind === 'half') {
        sum += 0.5;
      }
      continue;
    }
    // Check games
    for (const g of round.games) {
      if (g.white !== player && g.black !== player) {
        continue;
      }
      sum += scoreFor(player, g);
    }
  }
  return sum;
}

/**
 * FIDE 16.4: Dummy score for a participant's own unplayed round.
 */
function dummyScoreForBye(
  player: string,
  rounds: CompletedRound[],
  _bye: Bye,
): number {
  const playerOwnScore = score(player, rounds);
  // 16.4.2: byes — capped at 0.5 * totalRounds
  return Math.min(playerOwnScore, rounds.length * 0.5);
}

function dummyScoreForForfeit(
  player: string,
  rounds: CompletedRound[],
  game: Game,
): number {
  const playerOwnScore = score(player, rounds);
  // 16.4.1: forfeits — capped at opponent's adjusted score
  const opponent = game.white === player ? game.black : game.white;
  return Math.min(playerOwnScore, adjustedScore(opponent, rounds));
}

/**
 * Collect Buchholz contributions for a player per FIDE 16.
 */
function contributions(
  player: string,
  rounds: CompletedRound[],
): Contribution[] {
  const result: Contribution[] = [];

  for (const round of rounds) {
    // Check if player has a bye this round
    const bye = byeForPlayer(player, round);
    if (bye !== undefined) {
      result.push({
        isVUR: isByeVUR(bye),
        value: dummyScoreForBye(player, rounds, bye),
      });
      continue;
    }

    // Check games
    for (const g of round.games) {
      if (g.white !== player && g.black !== player) {
        continue;
      }

      if (g.forfeit === undefined) {
        // OTB game — opponent's adjusted score (FIDE 16.3)
        const opponent = g.white === player ? g.black : g.white;
        result.push({
          isVUR: false,
          value: adjustedScore(opponent, rounds),
        });
      } else {
        // Forfeit game — use dummy score
        result.push({
          isVUR: isForfeitVUR(player, g),
          value: dummyScoreForForfeit(player, rounds, g),
        });
      }
    }
  }

  return result;
}

/**
 * FIDE 16.5 Cut-1 Exception.
 */
function applyCuts(items: Contribution[], count: number): Contribution[] {
  if (count <= 0 || items.length === 0) {
    return [...items];
  }

  const sorted = [...items].toSorted((a, b) => a.value - b.value);
  const result = [...sorted];

  for (let index = 0; index < count && result.length > 0; index++) {
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
  byeForPlayer,
  contributions,
  dummyScoreForBye,
  dummyScoreForForfeit,
  gamesForPlayer,
  isByeVUR,
  isForfeitVUR,
  isTerminalBye,
  opponents,
  score,
  scoreFor,
};

export type { Contribution };

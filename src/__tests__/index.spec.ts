import { describe, expect, it } from 'vitest';

import { averageOpponentsBuchholz } from '../average.js';
import { buchholzCut1 } from '../cut1.js';
import { buchholzCut2 } from '../cut2.js';
import { foreBuchholz } from '../fore.js';
import { buchholz } from '../index.js';
import { buchholzMedian1 } from '../median1.js';
import { buchholzMedian2 } from '../median2.js';

import type { Game, GameKind } from '../types.js';

// 4 players, 3 rounds:
// Round 1: A(W) 1-0 B, C(W) 0-1 D
// Round 2: A(W) 0.5-0.5 D, C(W) 0-1 B
// Round 3: A(W) 1-0 C, D(W) 1-0 B
// Scores: A=2.5, D=2.5, B=1, C=0

const GAMES: Game[][] = [
  [
    { black: 'B', result: 1, white: 'A' },
    { black: 'D', result: 0, white: 'C' },
  ],
  [
    { black: 'D', result: 0.5, white: 'A' },
    { black: 'B', result: 0, white: 'C' },
  ],
  [
    { black: 'C', result: 1, white: 'A' },
    { black: 'B', result: 1, white: 'D' },
  ],
];

describe('buchholz', () => {
  it("returns sum of all opponents' scores", () => {
    // A played B(1), D(2.5), C(0) → 3.5
    expect(buchholz('A', GAMES)).toBe(3.5);
  });

  it('handles player with no games', () => {
    expect(buchholz('A', [])).toBe(0);
  });
});

describe('buchholzCut1', () => {
  it('returns Buchholz minus the lowest opponent score', () => {
    // A: opponents [0, 1, 2.5] → cut lowest → 3.5
    expect(buchholzCut1('A', GAMES)).toBe(3.5);
  });

  it('returns 0 when only one opponent', () => {
    const games: Game[][] = [[{ black: 'B', result: 1, white: 'A' }]];
    expect(buchholzCut1('A', games)).toBe(0);
  });
});

describe('buchholzCut2', () => {
  it('returns Buchholz minus the two lowest opponent scores', () => {
    // A: opponents [0, 1, 2.5] → cut two lowest → 2.5
    expect(buchholzCut2('A', GAMES)).toBe(2.5);
  });
});

describe('buchholzMedian1', () => {
  it('returns Buchholz minus lowest and highest', () => {
    // A: opponents [0, 1, 2.5] → remove 0 and 2.5 → 1
    expect(buchholzMedian1('A', GAMES)).toBe(1);
  });
});

describe('buchholzMedian2', () => {
  it('returns Buchholz minus two lowest and two highest', () => {
    // 3 opponents, removing 4 values leaves nothing → 0
    expect(buchholzMedian2('A', GAMES)).toBe(0);
  });
});

describe('averageOpponentsBuchholz', () => {
  it("returns average of opponents' Buchholz scores", () => {
    // B played A, C, D.
    // buchholz(A) = 1 + 2.5 + 0 = 3.5
    // buchholz(C) = 2.5 + 1 + 2.5 = 6
    // buchholz(D) = 0 + 2.5 + 1 = 3.5
    // AOB(B) = (3.5 + 6 + 3.5) / 3 = 13/3
    const result = averageOpponentsBuchholz('B', GAMES);
    expect(result).toBeCloseTo(13 / 3);
  });
});

describe('foreBuchholz', () => {
  it('calculates Buchholz as if final round games were draws', () => {
    // Final round (3): A vs C, D vs B → treat as draws
    // Adjusted scores:
    //   A: 1 + 0.5 + 0.5 = 2
    //   B: 0 + 1 + 0.5 = 1.5
    //   C: 1 + 0 + 0.5 = 1.5
    //   D: 0 + 0.5 + 0.5 = 1
    // foreBuchholz(A) = B_adj(1.5) + D_adj(1) + C_adj(1.5) = 4
    expect(foreBuchholz('A', GAMES)).toBe(4);
  });
});

// FIDE 16 Unplayed Rounds Management fixture:
// 4 players, 3 rounds:
// Round 1: A(W) 1-0 B (OTB), C(W) forfeit-win over D
// Round 2: A(W) 0.5-0.5 D (OTB), C(W) 0-1 B (OTB)
// Round 3: A(W) 1-0 C (OTB), D half-bye (terminal — last round)
//
// Raw scores: A=2.5, B=1, C=1, D=0.5 (forfeit-loss=0, draw=0.5, half-bye=0.5)
//
// Adjusted scores (FIDE 16.3):
//   A: all OTB → adjustedScore = 2.5
//   B: all OTB → adjustedScore = 1
//   C: forfeit-win in R1 uses awarded result (1), lost to B (0), lost to A (0) → 1
//   D: forfeit-loss(0) + OTB draw(0.5) + terminal half-bye→0.5 = 1.0
//
// Buchholz(A): A played B(adj=1), D(adj=1.0), C(adj=1) → 3.0
//
// Buchholz(D) with FIDE 16.4:
//   R1: D suffered forfeit-loss → dummy = min(score(D)=1, adjustedScore(C)=1) = 1
//   R2: D played A (OTB) → adjustedScore(A) = 2.5
//   R3: D has half-bye → dummy = min(score(D)=1, 3*0.5=1.5) = 1
//   Buchholz(D) = 1 + 2.5 + 1 = 4.5

const GAMES_FIDE16: Game[][] = [
  [
    { black: 'B', result: 1, white: 'A' },
    { black: 'D', kind: 'forfeit-win' as GameKind, result: 1, white: 'C' },
  ],
  [
    { black: 'D', result: 0.5, white: 'A' },
    { black: 'B', result: 0, white: 'C' },
  ],
  [
    { black: 'C', result: 1, white: 'A' },
    { black: '', kind: 'half-bye' as GameKind, result: 0.5, white: 'D' },
  ],
];

describe('buchholz with FIDE 16', () => {
  it('adjusts opponent scores for terminal byes (16.3 + 16.2.5)', () => {
    // A's Buchholz: B(adj=1) + D(adj=1.0) + C(adj=1) = 3.0
    expect(buchholz('A', GAMES_FIDE16)).toBe(3);
  });

  it('creates dummy opponents for own unplayed rounds (16.4)', () => {
    // D's Buchholz: dummy(forfeit=1) + A(adj=2.5) + dummy(bye=1) = 4.5
    expect(buchholz('D', GAMES_FIDE16)).toBe(4.5);
  });

  it('is backward compatible when no kind is set', () => {
    // Same games without kind → same as original behavior
    const gamesNoKind: Game[][] = [
      [
        { black: 'B', result: 1, white: 'A' },
        { black: 'D', result: 0, white: 'C' },
      ],
      [
        { black: 'D', result: 0.5, white: 'A' },
        { black: 'B', result: 0, white: 'C' },
      ],
      [
        { black: 'C', result: 1, white: 'A' },
        { black: 'B', result: 1, white: 'D' },
      ],
    ];
    expect(buchholz('A', gamesNoKind)).toBe(3.5);
  });
});

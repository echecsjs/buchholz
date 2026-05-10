import { describe, expect, it } from 'vitest';

import { averageOpponentsBuchholz } from '../average.js';
import { buchholzCut1 } from '../cut1.js';
import { buchholzCut2 } from '../cut2.js';
import { foreBuchholz } from '../fore.js';
import { buchholz } from '../index.js';
import { buchholzMedian1 } from '../median1.js';
import { buchholzMedian2 } from '../median2.js';

import type { CompletedRound, Player } from '@echecs/tournament';

const PLAYERS: Player[] = [
  { id: 'A', points: 2.5, rank: 1 },
  { id: 'B', points: 1, rank: 3 },
  { id: 'C', points: 0, rank: 4 },
  { id: 'D', points: 2.5, rank: 2 },
];

const ROUNDS: CompletedRound[] = [
  {
    byes: [],
    games: [
      { black: 'B', result: 'white', white: 'A' },
      { black: 'D', result: 'black', white: 'C' },
    ],
  },
  {
    byes: [],
    games: [
      { black: 'D', result: 'draw', white: 'A' },
      { black: 'B', result: 'black', white: 'C' },
    ],
  },
  {
    byes: [],
    games: [
      { black: 'C', result: 'white', white: 'A' },
      { black: 'B', result: 'white', white: 'D' },
    ],
  },
];

describe('buchholz', () => {
  it("returns sum of all opponents' scores", () => {
    expect(buchholz('A', ROUNDS, PLAYERS)).toBe(3.5);
  });

  it('handles player with no games', () => {
    expect(buchholz('A', [], PLAYERS)).toBe(0);
  });
});

describe('buchholzCut1', () => {
  it('returns Buchholz minus the lowest opponent score', () => {
    expect(buchholzCut1('A', ROUNDS, PLAYERS)).toBe(3.5);
  });

  it('returns 0 when only one opponent', () => {
    const rounds: CompletedRound[] = [
      { byes: [], games: [{ black: 'B', result: 'white', white: 'A' }] },
    ];
    expect(buchholzCut1('A', rounds, PLAYERS)).toBe(0);
  });
});

describe('buchholzCut2', () => {
  it('returns Buchholz minus the two lowest opponent scores', () => {
    expect(buchholzCut2('A', ROUNDS, PLAYERS)).toBe(2.5);
  });
});

describe('buchholzMedian1', () => {
  it('returns Buchholz minus lowest and highest', () => {
    expect(buchholzMedian1('A', ROUNDS, PLAYERS)).toBe(1);
  });
});

describe('buchholzMedian2', () => {
  it('returns Buchholz minus two lowest and two highest', () => {
    expect(buchholzMedian2('A', ROUNDS, PLAYERS)).toBe(0);
  });
});

describe('averageOpponentsBuchholz', () => {
  it("returns average of opponents' Buchholz scores", () => {
    const result = averageOpponentsBuchholz('B', ROUNDS, PLAYERS);
    expect(result).toBeCloseTo(13 / 3);
  });
});

describe('foreBuchholz', () => {
  it('calculates Buchholz as if final round games were draws', () => {
    expect(foreBuchholz('A', ROUNDS, PLAYERS)).toBe(4);
  });
});

// FIDE 16 fixture:
// Round 1: A(W) 1-0 B (OTB), C(W) forfeit-win over D
// Round 2: A(W) draw D (OTB), C(W) 0-1 B (OTB)
// Round 3: A(W) 1-0 C (OTB), D half-bye (terminal)
const PLAYERS_FIDE16: Player[] = [
  { id: 'A', points: 2.5, rank: 1 },
  { id: 'B', points: 1, rank: 3 },
  { id: 'C', points: 1, rank: 4 },
  { id: 'D', points: 1, rank: 2 },
];

const ROUNDS_FIDE16: CompletedRound[] = [
  {
    byes: [],
    games: [
      { black: 'B', result: 'white', white: 'A' },
      { black: 'D', forfeit: 'black', result: 'white', white: 'C' },
    ],
  },
  {
    byes: [],
    games: [
      { black: 'D', result: 'draw', white: 'A' },
      { black: 'B', result: 'black', white: 'C' },
    ],
  },
  {
    byes: [{ kind: 'half', player: 'D' }],
    games: [{ black: 'C', result: 'white', white: 'A' }],
  },
];

describe('buchholz with FIDE 16', () => {
  it('adjusts opponent scores for terminal byes (16.3 + 16.2.5)', () => {
    expect(buchholz('A', ROUNDS_FIDE16, PLAYERS_FIDE16)).toBe(3);
  });

  it('creates dummy opponents for own unplayed rounds (16.4)', () => {
    expect(buchholz('D', ROUNDS_FIDE16, PLAYERS_FIDE16)).toBe(4.5);
  });
});

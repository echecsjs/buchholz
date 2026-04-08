# Buchholz

[![npm](https://img.shields.io/npm/v/@echecs/buchholz)](https://www.npmjs.com/package/@echecs/buchholz)
[![Coverage](https://codecov.io/gh/mormubis/buchholz/branch/main/graph/badge.svg)](https://codecov.io/gh/mormubis/buchholz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Buchholz** is a TypeScript library implementing the Buchholz tiebreak family
for chess tournaments, following the
[FIDE Tiebreak Regulations](https://handbook.fide.com/chapter/TieBreakRegulations032026)
(section 8). Zero runtime dependencies.

## Installation

```bash
npm install @echecs/buchholz
```

## Quick Start

```typescript
import { buchholz } from '@echecs/buchholz';
import type { Game, GameKind } from '@echecs/buchholz';

// games[n] = round n+1; Game has no `round` field
const games: Game[][] = [
  [{ black: 'B', result: 1, white: 'A' }], // round 1
  [{ black: 'C', result: 0, white: 'A' }], // round 2
  [{ black: 'A', result: 0.5, white: 'D' }], // round 3
  // Unplayed rounds use kind to classify the bye type (FIDE article 16)
  [{ black: '', kind: 'half-bye', result: 0.5, white: 'A' }], // round 4
];

const score = buchholz('A', games);
// Returns sum of all opponents' tournament scores (byes excluded)
```

## API

All functions accept `(playerId: string, games: Game[][], players?: Player[])`
and return `number`. Round is determined by array position: `games[0]` = round
1, `games[1]` = round 2, etc. The `Game` type has no `round` field.

The optional `kind?: GameKind` field on `Game` classifies unplayed rounds for
FIDE article 16 compliance. Valid values: `'forfeit-loss'`, `'forfeit-win'`,
`'full-bye'`, `'half-bye'`, `'pairing-bye'`, `'zero-bye'`. When absent the game
is treated as a normal over-the-board result.

### `buchholz(playerId, games, players?)`

**FIDE section 8.1** — Full Buchholz score. Returns the sum of the tournament
scores of all opponents faced by `playerId`. Byes are excluded.

### `buchholzCut1(playerId, games, players?)`

**FIDE section 8.1 + modifier 14.1** — Buchholz minus the lowest-scoring
opponent. Sorts opponents' scores ascending and removes the first before
summing. When the player has voluntary unplayed rounds (VURs), the FIDE article
16.5 Cut-1 Exception ensures the lowest VUR contribution is cut first.

### `buchholzCut2(playerId, games, players?)`

**FIDE section 8.3** — Buchholz minus the two lowest-scoring opponents. Removes
the two lowest scores before summing.

### `buchholzMedian1(playerId, games, players?)`

**FIDE section 8.4** — Median Buchholz. Removes one highest and one lowest
opponent score before summing.

### `buchholzMedian2(playerId, games, players?)`

**FIDE section 8.5** — Double Median Buchholz. Removes the two highest and two
lowest opponent scores before summing.

### `averageOpponentsBuchholz(playerId, games, players?)`

**FIDE section 8.6** — Average Buchholz of opponents. Returns the mean of the
full Buchholz scores of each opponent faced. Returns `0` when no opponents have
been faced.

### `foreBuchholz(playerId, games, players?)`

**FIDE section 8.7** — Fore-Buchholz (Buchholz-Buchholz). Returns the sum of
each opponent's own full Buchholz score — one level of recursion beyond the
standard Buchholz.

## Contributing

Contributions are welcome. Please open an issue at
[github.com/mormubis/buchholz/issues](https://github.com/mormubis/buchholz/issues).

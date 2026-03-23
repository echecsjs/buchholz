# Buchholz

[![npm](https://img.shields.io/npm/v/@echecs/buchholz)](https://www.npmjs.com/package/@echecs/buchholz)
[![Test](https://github.com/mormubis/buchholz/actions/workflows/test.yml/badge.svg)](https://github.com/mormubis/buchholz/actions/workflows/test.yml)
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

const games = [
  { blackId: 'B', result: 1, round: 1, whiteId: 'A' },
  { blackId: 'C', result: 0, round: 2, whiteId: 'A' },
  { blackId: 'A', result: 0.5, round: 3, whiteId: 'D' },
];

const score = buchholz('A', games);
// Returns sum of all opponents' tournament scores
```

## API

All functions accept `(playerId: string, games: Game[])` and return `number`.
They are drop-in compatible with the shared `Tiebreak` type
`(playerId: string, games: Game[], players: Player[]) => number`.

### `buchholz(playerId, games)`

**FIDE section 8.1** — Full Buchholz score. Returns the sum of the tournament
scores of all opponents faced by `playerId`. Byes are excluded.

### `buchholzCut1(playerId, games)`

**FIDE section 8.2** — Buchholz minus the lowest-scoring opponent. Sorts
opponents' scores ascending and removes the first before summing.

### `buchholzCut2(playerId, games)`

**FIDE section 8.3** — Buchholz minus the two lowest-scoring opponents. Removes
the two lowest scores before summing.

### `buchholzMedian1(playerId, games)`

**FIDE section 8.4** — Median Buchholz. Removes one highest and one lowest
opponent score before summing.

### `buchholzMedian2(playerId, games)`

**FIDE section 8.5** — Double Median Buchholz. Removes the two highest and two
lowest opponent scores before summing.

### `averageOpponentsBuchholz(playerId, games)`

**FIDE section 8.6** — Average Buchholz of opponents. Returns the mean of the
full Buchholz scores of each opponent faced. Returns `0` when no opponents have
been faced.

### `foreBuchholz(playerId, games)`

**FIDE section 8.7** — Fore-Buchholz (Buchholz-Buchholz). Returns the sum of
each opponent's own full Buchholz score — one level of recursion beyond the
standard Buchholz.

## Contributing

Contributions are welcome. Please open an issue at
[github.com/mormubis/buchholz/issues](https://github.com/mormubis/buchholz/issues).

# Buchholz

[![npm](https://img.shields.io/npm/v/@echecs/buchholz)](https://www.npmjs.com/package/@echecs/buchholz)
[![Coverage](https://codecov.io/gh/echecsjs/buchholz/branch/main/graph/badge.svg)](https://codecov.io/gh/echecsjs/buchholz)
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

All functions accept `(player: string, games: Game[][])` and return `number`.
Round is determined by array position: `games[0]` = round 1, `games[1]` = round
2, etc. The `Game` type has no `round` field.

The optional `kind?: GameKind` field on `Game` classifies unplayed rounds for
FIDE article 16 compliance. Valid values: `'forfeit-loss'`, `'forfeit-win'`,
`'full-bye'`, `'half-bye'`, `'pairing-bye'`, `'zero-bye'`. When absent the game
is treated as a normal over-the-board result.

### `@echecs/buchholz` — `buchholz` / `tiebreak`

```typescript
import { buchholz, tiebreak } from '@echecs/buchholz';
```

**FIDE section 8.1** — Full Buchholz score. Returns the sum of the tournament
scores of all opponents faced by `player`. Byes are excluded.

### `@echecs/buchholz/cut1` — `buchholzCut1` / `tiebreak`

```typescript
import { buchholzCut1, tiebreak } from '@echecs/buchholz/cut1';
```

**FIDE section 8.1 + modifier 14.1** — Buchholz minus the lowest-scoring
opponent. Sorts opponents' scores ascending and removes the first before
summing. When the player has voluntary unplayed rounds (VURs), the FIDE article
16.5 Cut-1 Exception ensures the lowest VUR contribution is cut first.

### `@echecs/buchholz/cut2` — `buchholzCut2` / `tiebreak`

```typescript
import { buchholzCut2, tiebreak } from '@echecs/buchholz/cut2';
```

**FIDE section 8.3** — Buchholz minus the two lowest-scoring opponents. Removes
the two lowest scores before summing.

### `@echecs/buchholz/median1` — `buchholzMedian1` / `tiebreak`

```typescript
import { buchholzMedian1, tiebreak } from '@echecs/buchholz/median1';
```

**FIDE section 8.4** — Median Buchholz. Removes one highest and one lowest
opponent score before summing.

### `@echecs/buchholz/median2` — `buchholzMedian2` / `tiebreak`

```typescript
import { buchholzMedian2, tiebreak } from '@echecs/buchholz/median2';
```

**FIDE section 8.5** — Double Median Buchholz. Removes the two highest and two
lowest opponent scores before summing.

### `@echecs/buchholz/average` — `averageOpponentsBuchholz` / `tiebreak`

```typescript
import { averageOpponentsBuchholz, tiebreak } from '@echecs/buchholz/average';
```

**FIDE section 8.6** — Average Buchholz of opponents. Returns the mean of the
full Buchholz scores of each opponent faced. Returns `0` when no opponents have
been faced.

### `@echecs/buchholz/fore` — `foreBuchholz` / `tiebreak`

```typescript
import { foreBuchholz, tiebreak } from '@echecs/buchholz/fore';
```

**FIDE section 8.7** — Fore-Buchholz. Returns the sum of each opponent's
tournament score, with the last round treated as a draw for all games (FIDE
article 16.4 adjustment).

## Types

All subpath exports re-export the same types from the root entry point.

### `Game`

```typescript
interface Game {
  black: string;
  kind?: GameKind;
  result: Result;
  white: string;
}
```

A single game. `black` and `white` are player IDs. A bye is represented with an
empty string for the absent side (`black: ''`). The optional `kind` field
classifies unplayed rounds per FIDE article 16.

### `GameKind`

```typescript
type GameKind =
  | 'forfeit-loss'
  | 'forfeit-win'
  | 'full-bye'
  | 'half-bye'
  | 'pairing-bye'
  | 'zero-bye';
```

### `Result`

```typescript
type Result = 0 | 0.5 | 1;
```

The result of a game from white's perspective: `0` = loss, `0.5` = draw, `1` =
win.

### `Player`

```typescript
interface Player {
  id: string;
}
```

Minimal player shape. Not a parameter of any tiebreak function — provided for
consumers who build player registries alongside tiebreak calculations.

## Contributing

Contributions are welcome. Please open an issue at
[github.com/echecsjs/buchholz/issues](https://github.com/echecsjs/buchholz/issues).

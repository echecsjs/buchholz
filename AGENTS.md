# AGENTS.md

Agent guidance for the `@echecs/buchholz` repository — a TypeScript library
implementing the Buchholz tiebreak family following FIDE Tiebreak Regulations
(section 8).

See the root `AGENTS.md` for workspace-wide conventions.

---

## Project Overview

Pure calculation library, no runtime dependencies. Exports seven functions:

| Function                   | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `buchholz`                 | Full Buchholz score (sum of all opponents' scores)   |
| `buchholzCut1`             | Buchholz minus the lowest-scoring opponent           |
| `buchholzCut2`             | Buchholz minus the two lowest-scoring opponents      |
| `buchholzMedian1`          | Buchholz minus both the highest and lowest scores    |
| `buchholzMedian2`          | Buchholz minus the two highest and two lowest scores |
| `averageOpponentsBuchholz` | Average Buchholz score of all opponents              |
| `foreBuchholz`             | Sum of opponents' Buchholz scores (recursive)        |

All functions conform to the signature:

```ts
(playerId: string, players: Player[], games: Game[]) => number;
```

FIDE reference: https://handbook.fide.com/chapter/TieBreakRegulations032026
(section 8 — Buchholz System)

All source lives in `src/index.ts`; tests in `src/__tests__/index.spec.ts`.

---

## Commands

### Build

```bash
pnpm run build          # bundle TypeScript → dist/ via tsdown
```

### Test

```bash
pnpm run test                          # run all tests once
pnpm run test:watch                    # watch mode
pnpm run test:coverage                 # with coverage report

# Run a single test file
pnpm run test src/__tests__/index.spec.ts

# Run a single test by name (substring match)
pnpm run test -- --reporter=verbose -t "buchholz"
```

### Lint & Format

```bash
pnpm run lint           # ESLint + tsc type-check (auto-fixes style issues)
pnpm run lint:ci        # strict — zero warnings allowed, no auto-fix
pnpm run lint:style     # ESLint only (auto-fixes)
pnpm run lint:types     # tsc --noEmit type-check only
pnpm run format         # Prettier (writes changes)
pnpm run format:ci      # Prettier check only (no writes)
```

### Full pre-PR check

```bash
pnpm lint && pnpm test && pnpm build
```

---

## Architecture Notes

- All seven functions share the same three-argument signature
  `(playerId, players, games)` so they are interchangeable in tiebreak
  pipelines.
- A `Game` with `blackId: ''` (empty string) represents a **bye**. Byes are
  excluded from Buchholz calculations — the absent opponent contributes no
  score.
- Cut variants sort opponents' scores and remove the extremes before summing.
  `buchholzCut1` removes one lowest; `buchholzCut2` removes two lowest.
  `buchholzMedian1` removes one highest and one lowest; `buchholzMedian2`
  removes two highest and two lowest.
- `foreBuchholz` (also called Buchholz-Buchholz) is the sum of each opponent's
  own full `buchholz` score — it recurses one level.
- **No runtime dependencies** — keep it that way.
- **ESM-only** — the package ships only ESM. Do not add a CJS build.

---

## Validation

Input validation is provided by TypeScript's strict type system at compile time.
There is no runtime validation library. Do not add runtime type-checking guards
unless there is an explicit trust boundary (user-supplied strings, external
data).

---

## Error Handling

All functions are pure calculations and do not throw. An unplayed tournament
(zero games) returns `0` rather than throwing.

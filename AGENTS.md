# AGENTS.md

Agent guidance for the `@echecs/buchholz` repository — a TypeScript library
implementing the Buchholz tiebreak family following FIDE Tiebreak Regulations
(section 8).

**See also:** [`REFERENCES.md`](REFERENCES.md) | [`SPEC.md`](SPEC.md)

See the root `AGENTS.md` for workspace-wide conventions.

**Backlog:** tracked in
[GitHub Issues](https://github.com/mormubis/buchholz/issues).

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
(playerId: string, games: Game[][], players?: Player[]) => number;
```

`Game[][]` is a round-indexed structure: `games[0]` contains round-1 games,
`games[1]` contains round-2 games, and so on. The `Game` type no longer has a
`round` field — round is determined by array position.

The `Game` type carries an optional `kind?: GameKind` field used to classify
unplayed rounds for FIDE article 16 compliance:

```ts
type GameKind =
  | 'forfeit-loss' // 16.2.4 — forfeit loss (VUR)
  | 'forfeit-win' // 16.2.2 — forfeit win
  | 'full-bye' // 16.2.1 — pairing-allocated / full-point bye
  | 'half-bye' // 16.2.3 or 16.2.5 — requested half-point bye
  | 'pairing-bye' // alias for full-bye
  | 'zero-bye'; // 16.2.3 or 16.2.5 — requested zero-point bye
```

When `kind` is absent, the game is treated as a normal over-the-board result.

FIDE reference: https://handbook.fide.com/chapter/TieBreakRegulations032026
(section 8 — Buchholz System; section 16 — Unplayed Rounds Management)

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

- All seven functions share the same signature `(playerId, games, players?)` so
  they are interchangeable in tiebreak pipelines. Round is structural:
  `games[n]` = round n+1. The `Game` type has no `round` field.
- A `Game` with `black: ''` (empty string) represents a **bye**. Byes are
  excluded from Buchholz calculations — the absent opponent contributes no
  score.
- Cut variants sort opponents' scores and remove the extremes before summing.
  `buchholzCut1` removes one lowest; `buchholzCut2` removes two lowest.
  `buchholzMedian1` removes one highest and one lowest; `buchholzMedian2`
  removes two highest and two lowest.
- `foreBuchholz` (also called Buchholz-Buchholz) is the sum of each opponent's
  own full `buchholz` score — it recurses one level.
- **FIDE article 16 — Unplayed Rounds Management**: when a `Game` has a `kind`
  field, unplayed rounds are handled per FIDE article 16.3–16.5. The `kind`
  value determines how a player's score is adjusted for their opponents'
  tie-break calculations (16.3) and how dummy scores are applied to the player's
  own tie-break (16.4). The Cut-1 exception (16.5) prioritises cutting VUR
  contributions before the globally-lowest value.
- **No runtime dependencies** — keep it that way.
- **ESM-only** — the package ships only ESM. Do not add a CJS build.

---

## Tiebreak Signature

All tiebreak functions consumed by `@echecs/tournament` must conform to:

```typescript
(playerId: string, games: Game[], players: Map<string, Player>) => number;
```

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

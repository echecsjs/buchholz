import { applyCuts, contributions } from './utilities.js';

import type { Tiebreak } from '@echecs/tournament';

const buchholzCut2: Tiebreak = (player, rounds, _players) =>
  applyCuts(contributions(player, rounds), 2).reduce(
    (sum, c) => sum + c.value,
    0,
  );

export { buchholzCut2, buchholzCut2 as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';

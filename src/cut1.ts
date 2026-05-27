import { applyCuts, contributions } from './utilities.js';

import type { Tiebreak } from '@echecs/tournament';

const buchholzCut1: Tiebreak = (player, rounds, _players) =>
  applyCuts(contributions(player, rounds), 1).reduce(
    (sum, c) => sum + c.value,
    0,
  );

export { buchholzCut1, buchholzCut1 as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';

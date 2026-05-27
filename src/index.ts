import { contributions } from './utilities.js';

import type { Tiebreak } from '@echecs/tournament';

const buchholz: Tiebreak = (player, rounds, _players) =>
  contributions(player, rounds).reduce((sum, c) => sum + c.value, 0);

export { buchholz, buchholz as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';

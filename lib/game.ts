import { Board } from './board';

import { Player } from './action';

export interface Game {
    turn: Player;
    board: Board;
}
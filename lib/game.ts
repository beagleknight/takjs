import { Board } from './board';

import { Player } from './movement';

export interface Game {
    turn: Player;
    board: Board;
}
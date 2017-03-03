import { Board } from './board';

import { Player, PlayerColor } from './player';

export interface Game {
    turn: PlayerColor;
    board: Board;
    whitePlayer: Player;
    blackPlayer: Player;
}
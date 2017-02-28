import { Board } from './board';

export interface Game {
    finished: boolean;
    board: Board;
}
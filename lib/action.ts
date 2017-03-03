import { Piece } from './piece';

export enum Player {
    white,
    black
}

export enum ActionType {
    drop,
    move
}

export interface DropActionData {
    piece: Piece;
}

export interface MoveActionData {
    pieces: number;
    to: {
        row: number;
        col: number;
    };
}

export interface Action {
    player: Player;
    type: ActionType;
    row: number;
    col: number;
    data: DropActionData | MoveActionData;
}

import { Observable } from 'rxjs';
import { Piece } from './piece';

export enum Player {
    white,
    black
}

export enum MovementType {
    drop,
    move
}

export interface DropMovementData {
    piece: Piece;
}

export interface MoveMovementData {
    pieces: number;
    to: {
        row: number;
        col: number;
    };
}

export interface Movement {
    player: Player;
    type: MovementType;
    row: number;
    col: number;
    data: DropMovementData | MoveMovementData;
}

export const createMoves = (nextWhiteMove$: Observable<Movement>, nextBlackMove$: Observable<Movement>): Observable<Movement> => {
    let whiteMoves$ = nextWhiteMove$
        .filter(movement => movement.player === Player.white);

    let blackMoves$ = nextBlackMove$
        .filter(movement => movement.player === Player.black);

    return whiteMoves$.merge(blackMoves$);
}

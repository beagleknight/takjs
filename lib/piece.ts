import { Player } from './action';

export enum PieceType {
    flat,
    standing
}

export interface Piece {
    color: Player;
    type: PieceType;
}

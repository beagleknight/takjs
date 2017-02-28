import { Player } from './movement';

export enum PieceType {
    flat,
    standing
}

export interface Piece {
    color: Player,
    type: PieceType
}

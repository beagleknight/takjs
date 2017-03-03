import { PlayerColor } from './player';
import { Stack } from './board';

export enum PieceType {
  flat,
  standing
}

export interface Piece {
  color: PlayerColor;
  type: PieceType;
}

export interface PiecesInHand {
  stack: Stack;
  to: {
    row: number;
    col: number;
  }
}
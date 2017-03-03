import { PiecesInHand } from './piece';

export enum PlayerColor {
  white,
  black
}

export interface Player {
  color: PlayerColor;
  piecesInHand: PiecesInHand;
}
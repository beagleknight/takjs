import { Piece, PiecesInHand } from './piece';
import { PlayerColor } from './player';
import { Board } from './board';

export enum ActionType {
  drop,
  move
}

export interface DropActionData {
  piece: Piece;
}

export interface MoveActionData {
  piecesGrabbed?: number;
  to: {
    row: number;
    col: number;
    piecesToDrop: number;
  };
}

export interface Action {
  player: PlayerColor;
  type: ActionType;
  row?: number;
  col?: number;
  data: DropActionData | MoveActionData;
}

export interface ActionResult {
  board: Board;
  piecesInHand?: PiecesInHand;
}

import { Observable, Subject } from 'rxjs';

import { Game } from './game';
import { PlayerColor } from './player';
import { Action, ActionType } from './action';
import { Board, isValidAction, createBoard, applyAction } from './board';

export const createGame = (size: number = 4, initialGame: Game = null) => {
  const nextWhiteAction$: Subject<Action> = new Subject<Action>();
  const nextBlackAction$: Subject<Action> = new Subject<Action>();

  const initialBoard: Board = createBoard(size);

  initialGame = initialGame || {
    turn: PlayerColor.white,
    board: initialBoard,
    whitePlayer: {
      color: PlayerColor.white,
      piecesInHand: null
    },
    blackPlayer: {
      color: PlayerColor.black,
      piecesInHand: null
    }
  };

  const game$: Observable<Game> = nextWhiteAction$
    .filter(action => action.player === PlayerColor.white)
    .merge(nextBlackAction$.filter(action => action.player === PlayerColor.black))
    .scan((game: Game, action: Action) => {
      let { board, turn, whitePlayer, blackPlayer } = game;
      const { piecesInHand } = turn === PlayerColor.white ? whitePlayer : blackPlayer;

      if (turn === action.player && isValidAction(board, action, piecesInHand)) {
        const actionResult = applyAction(board, action, piecesInHand);

        board = actionResult.board;

        if (action.type === ActionType.drop) {
          turn = turn === PlayerColor.white ? PlayerColor.black : PlayerColor.white;
        } else if (action.type === ActionType.move) {
          const { piecesInHand } = actionResult;

          if (turn === PlayerColor.white) {
            whitePlayer = {
              ...whitePlayer,
              piecesInHand
            };
          } else {
            blackPlayer = {
              ...blackPlayer,
              piecesInHand
            };
          }

          if (!piecesInHand) {
            turn = turn === PlayerColor.white ? PlayerColor.black : PlayerColor.white;
          }
        }
      }

      return {
        ...game,
        board,
        turn,
        whitePlayer,
        blackPlayer
      };
    }, initialGame)
    .startWith(initialGame);

  return {
    game$,
    nextWhiteAction$,
    nextBlackAction$
  };
};

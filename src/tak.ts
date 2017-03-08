import { Observable, Subject } from 'rxjs';

import { Game } from './game';
import { PlayerColor } from './player';
import { Action, ActionType } from './action';
import { Board, isValidAction, createBoard, applyAction } from './board';

/**
 * Creates a new Tak game.
 * @param size The size of the board (i.e. 3, 4 or 5).
 * @param initialGame A initial state of the game.
 * @returns A `game$` observable to get game state changes, a `nextWhiteAction$` to push white player actions and a `nextBlackAction$` to push black player actions.
 */
export const createGame = (size: number = 4, initialGame?: Game) => {
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

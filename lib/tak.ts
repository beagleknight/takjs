import { Observable, Subject } from 'rxjs';

import { Game } from './game';
import { Player, Action } from './action';
import { Board, isValidAction, createBoard, applyAction } from './board';

export const createGame = (size: number = 4, initialGame: Game = null) => {
  const nextWhiteMove$: Subject<Action> = new Subject<Action>();
  const nextBlackMove$: Subject<Action> = new Subject<Action>();

  const initialBoard: Board = createBoard(size);

  initialGame = initialGame || { turn: Player.white, board: initialBoard };

  const game$: Observable<Game> = nextWhiteMove$
    .filter(action => action.player === Player.white)
    .merge(nextBlackMove$.filter(action => action.player === Player.black))
    .scan((game: Game, action: Action) => {
      const { turn } = game;
      let { board } = game;

      if (turn === action.player && isValidAction(board, action)) {
        board = applyAction(board, action);
      }

      return {
        ...game,
        board
      };
    }, initialGame)
    .startWith(initialGame);

  return {
    game$,
    nextWhiteMove$,
    nextBlackMove$
  };
};

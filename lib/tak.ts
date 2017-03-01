import { Observable, Subject } from 'rxjs';

import { Game } from './game';
import { Player, Movement } from './movement';
import { Board, isValidMovement, createBoard, applyMovement } from './board';

export const createGame = (size: number = 4, initialGame: Game = null) => {
  const nextWhiteMove$: Subject<Movement> = new Subject<Movement>();
  const nextBlackMove$: Subject<Movement> = new Subject<Movement>();

  const initialBoard: Board = createBoard(size);

  initialGame = initialGame || { turn: Player.white, board: initialBoard };

  const game$: Observable<Game> = nextWhiteMove$
    .filter(movement => movement.player === Player.white)
    .merge(nextBlackMove$.filter(movement => movement.player === Player.black))
    .scan((game: Game, movement: Movement) => {
      const { turn } = game;
      let { board } = game;

      if (turn === movement.player && isValidMovement(board, movement)) {
        board = applyMovement(board, movement);
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

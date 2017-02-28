import { Observable, Subject } from 'rxjs';

import { Game } from './game';
import { Movement, Player, createMoves } from './movement';
import { Board, isValidMovement, createInitialBoard, applyMovement } from './board';

export const createTakGame = () => {
    const nextWhiteMove$: Subject<Movement> = new Subject<Movement>();
    const nextBlackMove$: Subject<Movement> = new Subject<Movement>();

    const moves$: Observable<Movement> = createMoves(nextWhiteMove$, nextBlackMove$);
    const initialBoard: Board = createInitialBoard();

    const board$: Observable<Board> = moves$
        .scan((board: Board, movement: Movement): Board => {
            if (isValidMovement(board, movement)) {
                return applyMovement(board, movement);
            }
            return board;
        }, initialBoard)
        .startWith(initialBoard);

    const game$: Observable<Game> = board$.scan((game, board) => {
        return {
            ...game,
            board
        };
    }, { finished: false });

    return {
        game$,
        nextWhiteMove$,
        nextBlackMove$
    }
}

import { createTakGame } from './tak';
import { printBoard } from './board';
import { Movement, Player, MovementType } from './movement';
import { Piece, PieceType } from './piece';

const { game$, nextWhiteMove$, nextBlackMove$ } = createTakGame();

game$.subscribe(game => {
    const { board } = game;
    console.log(printBoard(board));
});

nextWhiteMove$.next({
    player: Player.white,
    type: MovementType.drop,
    row: 0,
    col: 0,
    data: {
        piece: {
            color: Player.white,
            type: PieceType.flat
        }
    }
});

nextBlackMove$.next({
    player: Player.black,
    type: MovementType.drop,
    row: 0,
    col: 1,
    data: {
        piece: {
            color: Player.black,
            type: PieceType.flat
        }
    }
});


nextWhiteMove$.next({
    player: Player.white,
    type: MovementType.drop,
    row: 0,
    col: 2,
    data: {
        piece: {
            color: Player.white,
            type: PieceType.flat
        }
    }
});

nextBlackMove$.next({
    player: Player.black,
    type: MovementType.move,
    row: 0,
    col: 1,
    data: {
        pieces: 1,
        to: {
            row: 0,
            col: 0
        }
    }
});

nextWhiteMove$.next({
    player: Player.white,
    type: MovementType.move,
    row: 0,
    col: 2,
    data: {
        pieces: 1,
        to: {
            row: 0,
            col: 1
        }
    }
});

nextBlackMove$.next({
    player: Player.black,
    type: MovementType.drop,
    row: 0,
    col: 2,
    data: {
        piece: {
            color: Player.black,
            type: PieceType.flat
        }
    }
});

nextWhiteMove$.next({
    player: Player.white,
    type: MovementType.move,
    row: 0,
    col: 1,
    data: {
        pieces: 1,
        to: {
            row: 0,
            col: 0
        }
    }
});

nextBlackMove$.next({
    player: Player.black,
    type: MovementType.drop,
    row: 1,
    col: 0,
    data: {
        piece: {
            color: Player.black,
            type: PieceType.standing
        }
    }
});

nextWhiteMove$.next({
    player: Player.white,
    type: MovementType.move,
    row: 0,
    col: 0,
    data: {
        pieces: 3,
        to: {
            row: 0,
            col: 1
        }
    }
});

// TODO: Complete move
nextWhiteMove$.next({
    player: Player.white,
    type: MovementType.move,
    row: 0,
    col: 1,
    data: {
        pieces: 2,
        to: {
            row: 0,
            col: 2
        }
    }
});
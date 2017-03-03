import test from 'ava';

import { createGame } from './tak';
import { boardStr, boardToText, boardFromText } from './board';
import { PlayerColor } from './player';
import { ActionType } from './action';
import { PieceType } from './piece';

test("createGame with default arguments creates a game of size 4", t => {
  const { game$ } = createGame();

  game$.subscribe(({ board: { size } }) => {
    t.is(size, 4);
  });
});

test("createGame accepts custom size as an argument", t => {
  const { game$ } = createGame(3);

  game$.subscribe(({ board: { size } }) => {
    t.is(size, 3);
  });
});

test("createGame accepts a started game as an argument", t => {
  const startedGameBoard = boardFromText `
    E,E,WF,E
    E,BF,E,E
    E,E,E,E
    E,E,E,E
  `;
  const { game$ } = createGame(3, {
    turn: PlayerColor.black,
    board: startedGameBoard,
    whitePlayer: {
      color: PlayerColor.white,
      piecesInHand: null
    },
    blackPlayer: {
      color: PlayerColor.black,
      piecesInHand: null
    }
  });

  game$.subscribe(({ turn, board }) => {
    t.is(turn, PlayerColor.black);
    t.is(board, startedGameBoard);
  });
});

test("createGame starts with an empty board", t => {
  const { game$ } = createGame();

  game$.subscribe(({ board }) => {
    t.is(boardToText(board), boardStr`
      E,E,E,E
      E,E,E,E
      E,E,E,E
      E,E,E,E
    `);
  });
});

test("a player's action modify the game's board", t => {
  const { game$, nextWhiteAction$ } = createGame();

  game$.skip(1).subscribe(({ board }) => {
    t.is(boardToText(board), boardStr`
      E,E,E,E
      E,E,WF,E
      E,E,E,E
      E,E,E,E
    `);
  });

  nextWhiteAction$.next({
    player: PlayerColor.white,
    type: ActionType.drop,
    row: 1,
    col: 2,
    data: {
      piece: {
        color: PlayerColor.white,
        type: PieceType.flat
      }
    }
  });
});

test("a player's drop action change the game's turn", t => {
  const { game$, nextWhiteAction$ } = createGame();

  game$.skip(1).subscribe(({ turn }) => {
    t.is(turn, PlayerColor.black);
  });

  nextWhiteAction$.next({
    player: PlayerColor.white,
    type: ActionType.drop,
    row: 1,
    col: 2,
    data: {
      piece: {
        color: PlayerColor.white,
        type: PieceType.flat
      }
    }
  });
});

test("a player's move action doesn't change the game's turn if current player has pieces in hand", t => {
  const startedGameBoard = boardFromText `
    E,E,WF,E
    WF|WF|WF|BF,BF,E,E
    E,E,E,E
    E,E,E,E
  `;
  const { nextWhiteAction$, game$ } = createGame(4, {
    turn: PlayerColor.white,
    board: startedGameBoard,
    whitePlayer: {
      color: PlayerColor.white,
      piecesInHand: null
    },
    blackPlayer: {
      color: PlayerColor.black,
      piecesInHand: null
    }
  });

  game$.skip(1).subscribe(({ turn, whitePlayer }) => {
    t.deepEqual(whitePlayer, {
      color: PlayerColor.white,
      piecesInHand: {
        stack: {
          pieces: [{ color: PlayerColor.white, type: PieceType.flat }]
        },
        to: {
          row: 1,
          col: 2
        }
      }
    });
    t.is(turn, PlayerColor.white);
  });

  nextWhiteAction$.next({
    player: PlayerColor.white,
    type: ActionType.move,
    row: 1,
    col: 0,
    data: {
      piecesGrabbed: 2,
      to: {
        row: 1,
        col: 1,
        piecesToDrop: 1
      }
    }
  });
});

test("a player's move action change the game's turn if current player doesn't have pieces in hand", t => {
  const startedGameBoard = boardFromText `
    E,E,WF,E
    WF|BF,WF|BF,E,E
    E,E,E,E
    E,E,E,E
  `;
  const { nextWhiteAction$, game$ } = createGame(4, {
    turn: PlayerColor.white,
    board: startedGameBoard,
    whitePlayer: {
      color: PlayerColor.white,
      piecesInHand: {
        stack: {
          pieces: [{ color: PlayerColor.white, type: PieceType.flat}]
        },
        to: {
          row: 1,
          col: 2
        }
      }
    },
    blackPlayer: {
      color: PlayerColor.black,
      piecesInHand: null
    }
  });

  game$.skip(1).subscribe(({ turn, whitePlayer }) => {
    t.deepEqual(whitePlayer, {
      color: PlayerColor.white,
      piecesInHand: null
    });
    t.is(turn, PlayerColor.black);
  });

  nextWhiteAction$.next({
    player: PlayerColor.white,
    type: ActionType.move,
    data: {
      to: {
        row: 1,
        col: 2,
        piecesToDrop: 1
      }
    }
  });
});

test("a player cannot do an action if it's not his turn", t => {
  const { game$, nextBlackAction$ } = createGame();

  game$.skip(1).subscribe(({ board }) => {
    t.is(boardToText(board), boardStr`
      E,E,E,E
      E,E,E,E
      E,E,E,E
      E,E,E,E
    `);
  });

  nextBlackAction$.next({
    player: PlayerColor.black,
    type: ActionType.drop,
    row: 1,
    col: 2,
    data: {
      piece: {
        color: PlayerColor.white,
        type: PieceType.flat
      }
    }
  });
});

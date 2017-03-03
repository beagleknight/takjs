import test from 'ava';

import { createGame } from './tak';
import { boardStr, boardToText, boardFromText } from './board';
import { Player, ActionType } from './action';
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
    turn: Player.black,
    board: startedGameBoard
  });

  game$.subscribe(({ turn, board }) => {
    t.is(turn, Player.black);
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
  const { game$, nextWhiteMove$ } = createGame();

  game$.skip(1).subscribe(({ board }) => {
    t.is(boardToText(board), boardStr`
      E,E,E,E
      E,E,WF,E
      E,E,E,E
      E,E,E,E
    `);
  });

  nextWhiteMove$.next({
    player: Player.white,
    type: ActionType.drop,
    row: 1,
    col: 2,
    data: {
      piece: {
        color: Player.white,
        type: PieceType.flat
      }
    }
  });
});

test("a player cannot do an action if it's not his turn", t => {
  const { game$, nextBlackMove$ } = createGame();

  game$.skip(1).subscribe(({ board }) => {
    t.is(boardToText(board), boardStr`
      E,E,E,E
      E,E,E,E
      E,E,E,E
      E,E,E,E
    `);
  });

  nextBlackMove$.next({
    player: Player.black,
    type: ActionType.drop,
    row: 1,
    col: 2,
    data: {
      piece: {
        color: Player.white,
        type: PieceType.flat
      }
    }
  });
});

import test from 'ava';

import { PieceType } from './piece';
import { Player, ActionType } from './action';
import { createBoard, boardStr, boardToText, boardFromText, isValidAction, applyAction } from './board';

test("createBoard returns an empty board of the give size", t => {
  const board = createBoard(5);

  t.is(boardToText(board), boardStr`
    E,E,E,E,E
    E,E,E,E,E
    E,E,E,E,E
    E,E,E,E,E
    E,E,E,E,E
  `);
});

test("boardFromText parses a boardStr and returns a board", t => {
  const str = boardStr`
    WF,E,E
    E,BF,E
    E,E,E
  `;
  const board = boardFromText`
    WF,E,E
    E,BF,E
    E,E,E
  `;

  t.is(boardToText(board), str);
});

test("isValidAction when type is 'drop' is true if the stack is empty", t => {
  const isValid = isValidAction(
    boardFromText`
      E,E,E
      E,E,E
      E,E,E
    `, {
      player: Player.white,
      type: ActionType.drop,
      row: 0,
      col: 0,
      data: {
        piece: {
          color: Player.white,
          type: PieceType.flat
        }
      }
    }
  );

  t.truthy(isValid);
});

test("isValidAction when type is 'drop' is false if the stack is not empty", t => {
  const isValid = isValidAction(
    boardFromText`
      WF,E,E
      E,E,E
      E,E,E
    `, {
      player: Player.white,
      type: ActionType.drop,
      row: 0,
      col: 0,
      data: {
        piece: {
          color: Player.white,
          type: PieceType.flat
        }
      }
    }
  );

  t.falsy(isValid);
});

test("isValidAction when type is 'drop' is false if the dropped piece is not from the player's", t => {
  const isValid = isValidAction(
    boardFromText`
      E,E,E
      E,E,E
      E,E,E
    `, {
      player: Player.white,
      type: ActionType.drop,
      row: 0,
      col: 0,
      data: {
        piece: {
          color: Player.black,
          type: PieceType.flat
        }
      }
    }
  );

  t.falsy(isValid);
});

test("isValidAction when type is 'move' is false if the stack is empty", t => {
  const isValid = isValidAction(
    boardFromText`
      E,E,E
      E,E,E
      E,E,E
    `, {
      player: Player.white,
      type: ActionType.move,
      row: 0,
      col: 0,
      data: {
        pieces: 1,
        to: {
          row: 0,
          col: 1
        }
      }
    }
  );

  t.falsy(isValid);
});

test("isValidAction when type is 'move' is false if the stack's top piece is not from the player", t => {
  const isValid = isValidAction(
    boardFromText`
      BF,E,E
      E,E,E
      E,E,E
    `, {
      player: Player.white,
      type: ActionType.move,
      row: 0,
      col: 0,
      data: {
        pieces: 1,
        to: {
          row: 0,
          col: 1
        }
      }
    }
  );

  t.falsy(isValid);
});

test("isValidAction when type is 'move' is false if to cell is the same origin cell", t => {
  const isValid = isValidAction(
    boardFromText`
      WF,E,E
      E,E,E
      E,E,E
    `, {
      player: Player.white,
      type: ActionType.move,
      row: 0,
      col: 0,
      data: {
        pieces: 1,
        to: {
          row: 0,
          col: 0
        }
      }
    }
  );

  t.falsy(isValid);
});

test("isValidAction when type is 'move' is false if to cell is not orthogonal", t => {
  const isValid = isValidAction(
    boardFromText`
      WF,E,E
      E,E,E
      E,E,E
    `, {
      player: Player.white,
      type: ActionType.move,
      row: 0,
      col: 0,
      data: {
        pieces: 1,
        to: {
          row: 1,
          col: 1
        }
      }
    }
  );

  t.falsy(isValid);
});

test("applyAction when type is 'drop' modify the board", t => {
  const currentBoard = boardFromText`
    E,E,E
    E,E,E
    E,E,E
  `;
  const newBoard = applyAction(currentBoard, {
    player: Player.white,
    type: ActionType.drop,
    row: 1,
    col: 1,
    data: {
      piece: {
        color: Player.white,
        type: PieceType.flat
      }
    }
  });

  t.is(boardStr`
    E,E,E
    E,WF,E
    E,E,E
  `, boardToText(newBoard));
});

test("applyAction when type is 'move' modify the board", t => {
  const currentBoard = boardFromText`
    WF,BF,E
    E,E,E
    E,E,E
  `;
  const newBoard = applyAction(currentBoard, {
    player: Player.white,
    type: ActionType.move,
    row: 0,
    col: 0,
    data: {
      pieces: 1,
      to: {
        row: 0,
        col: 1
      }
    }
  });

  t.is(boardStr`
    E,WF|BF,E
    E,E,E
    E,E,E
  `, boardToText(newBoard));
});


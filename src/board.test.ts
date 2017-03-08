import test from 'ava';

import { PieceType } from './piece';
import { PlayerColor } from './player';
import { ActionType } from './action';
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
      player: PlayerColor.white,
      type: ActionType.drop,
      row: 0,
      col: 0,
      data: {
        piece: {
          color: PlayerColor.white,
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
      player: PlayerColor.white,
      type: ActionType.drop,
      row: 0,
      col: 0,
      data: {
        piece: {
          color: PlayerColor.white,
          type: PieceType.flat
        }
      }
    }
  );

  t.falsy(isValid);
});

test("isValidAction when type is 'drop' is false if the dropped piece is not from the PlayerColor's", t => {
  const isValid = isValidAction(
    boardFromText`
      E,E,E
      E,E,E
      E,E,E
    `, {
      player: PlayerColor.white,
      type: ActionType.drop,
      row: 0,
      col: 0,
      data: {
        piece: {
          color: PlayerColor.black,
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
      player: PlayerColor.white,
      type: ActionType.move,
      row: 0,
      col: 0,
      data: {
        piecesGrabbed: 1,
        to: {
          row: 0,
          col: 1,
          piecesToDrop: 1
        }
      }
    }
  );

  t.falsy(isValid);
});

test("isValidAction when type is 'move' is false if the stack's top piece is not from the PlayerColor", t => {
  const isValid = isValidAction(
    boardFromText`
      BF,E,E
      E,E,E
      E,E,E
    `, {
      player: PlayerColor.white,
      type: ActionType.move,
      row: 0,
      col: 0,
      data: {
        piecesGrabbed: 1,
        to: {
          row: 0,
          col: 1,
          piecesToDrop: 1
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
      player: PlayerColor.white,
      type: ActionType.move,
      row: 0,
      col: 0,
      data: {
        piecesGrabbed: 1,
        to: {
          row: 0,
          col: 0,
          piecesToDrop: 1
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
      player: PlayerColor.white,
      type: ActionType.move,
      row: 0,
      col: 0,
      data: {
        piecesGrabbed: 1,
        to: {
          row: 1,
          col: 1,
          piecesToDrop: 1
        }
      }
    }
  );

  t.falsy(isValid);
});

test("isValidAction when type is 'move' is false if 'piecesGrabbed' is greater than board's size", t => {
  const isValid = isValidAction(
    boardFromText`
      WF|WF|WF|WF,E,E
      E,E,E
      E,E,E
    `, {
      player: PlayerColor.white,
      type: ActionType.move,
      row: 0,
      col: 0,
      data: {
        piecesGrabbed: 4,
        to: {
          row: 0,
          col: 1,
          piecesToDrop: 1
        }
      }
    }
  );

  t.falsy(isValid);
});

test("isValidAction when type is 'move' and player has pieces in hand is false if to cell is different than pieces in hand to", t => {
  const isValid = isValidAction(
    boardFromText`
      WF|WF,WF,E
      E,E,E
      E,E,E
    `, {
      player: PlayerColor.white,
      type: ActionType.move,
      row: 0,
      col: 1,
      data: {
        piecesGrabbed: 0,
        to: {
          row: 0,
          col: 2,
          piecesToDrop: 1
        }
      }
    }, {
      stack: {
        pieces: [{ color: PlayerColor.white, type: PieceType.flat }],
      },
      to: {
        row: 0,
        col: 1
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
  const { board: newBoard } = applyAction(currentBoard, {
    player: PlayerColor.white,
    type: ActionType.drop,
    row: 1,
    col: 1,
    data: {
      piece: {
        color: PlayerColor.white,
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

test("applyAction when type is 'move' modify the board and the player", t => {
  const currentBoard = boardFromText`
    WF|WF|WF,BF,E
    E,E,E
    E,E,E
  `;
  const { board: newBoard, piecesInHand } = applyAction(currentBoard, {
    player: PlayerColor.white,
    type: ActionType.move,
    row: 0,
    col: 0,
    data: {
      piecesGrabbed: 2,
      to: {
        row: 0,
        col: 1,
        piecesToDrop: 1
      }
    }
  });

  t.is(boardStr`
    WF,WF|BF,E
    E,E,E
    E,E,E
  `, boardToText(newBoard));

  t.deepEqual(piecesInHand, {
    stack: {
      pieces: [{ color: PlayerColor.white, type: PieceType.flat }]
    },
    to: {
      row: 0,
      col: 2
    }
  });
});

test("applyAction when type is 'move' and using pieces in hand modify the board and the player", t => {
  const currentBoard = boardFromText`
    WF,WF|BF,E
    E,E,E
    E,E,E
  `;
  const { board: newBoard, piecesInHand: newPiecesInHand } = applyAction(currentBoard, {
    player: PlayerColor.white,
    type: ActionType.move,
    row: 0,
    col: 1,
    data: {
      piecesGrabbed: 0,
      to: {
        row: 0,
        col: 2,
        piecesToDrop: 1
      }
    }
  }, {
    stack: {
      pieces: [{ color: PlayerColor.white, type: PieceType.flat }]
    },
    to: {
      row: 0,
      col: 2
    }
  });

  t.is(boardStr`
    WF,WF|BF,WF
    E,E,E
    E,E,E
  `, boardToText(newBoard));

  t.deepEqual(newPiecesInHand, null);
});

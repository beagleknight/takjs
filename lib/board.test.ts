import test from 'ava';

import { createBoard, boardStr, boardToText, boardFromText } from './board';

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
  const board = boardFromText(str);

  t.is(boardToText(board), str);
});

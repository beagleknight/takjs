import { PlayerColor } from './player';
import { Action, ActionType, DropActionData, MoveActionData, ActionResult } from './action';
import { Piece, PieceType, PiecesInHand } from './piece';

export interface Stack {
  pieces: Piece[];
}

export interface Board {
  size: number;
  cells: Stack[][];
}

export const isValidAction = (board: Board, action: Action, piecesInHand: PiecesInHand = null): boolean => {
  switch (action.type) {
    case ActionType.drop:
      return isValidDropAction(board, action);
    case ActionType.move:
      return isValidMoveAction(board, action, piecesInHand);
    default:
      return false;
  }
};

const isValidDropAction = (board: Board, action: Action): boolean => {
  let { row, col, data } = action;
  let { piece } = data as DropActionData;
  let stack: Stack = board.cells[row][col];

  return stack.pieces.length === 0 && action.player === piece.color;
};

const isValidMoveAction = (board: Board, action: Action, piecesInHand: PiecesInHand = null): boolean => {
  let { size } = board;
  let { row, col, data } = action;
  let { piecesGrabbed, to } = data as MoveActionData;

  if (piecesInHand) {
    let { to: piecesInHandTo } = piecesInHand;
    return to.row === piecesInHandTo.row && to.col === piecesInHandTo.col;
  } else {
    let stack: Stack = board.cells[row][col];
    let dist = Math.abs(to.row - row) + Math.abs(to.col - col);
    return piecesGrabbed <= size && stack.pieces.length > 0 && stack.pieces[0].color === action.player && dist === 1;
  }
};

export const applyAction = (board: Board, action: Action, piecesInHand: PiecesInHand = null): ActionResult => {
  switch (action.type) {
    case ActionType.drop:
      return applyDropAction(board, action);
    case ActionType.move:
      return applyMoveAction(board, action, piecesInHand);
    default:
      return { board };
  }
};

const applyDropAction = (board: Board, action: Action): ActionResult => {
  const { row, col, data } = action;
  const { piece } = data as DropActionData;
  const stack: Stack = board.cells[row][col];

  return {
    board: {
      ...board,
      cells: replaceCell(board, row, col, {
        pieces: [
          piece,
          ...stack.pieces
        ]
      })
    }
  };
};

const applyMoveAction = (board: Board, action: Action, piecesInHand: PiecesInHand): ActionResult => {
  const { row, col, data } = action;
  let { piecesGrabbed, to } = data as MoveActionData;
  const { piecesToDrop } = to;
  let movePieces: Piece[];
  let newBoard: Board;
  let stack: Stack;

  if (piecesInHand) {
    piecesGrabbed = piecesInHand.stack.pieces.length;
    movePieces = piecesInHand.stack.pieces;
  } else {
    stack = board.cells[row][col];
    movePieces = stack.pieces.slice(0, piecesGrabbed);
  }

  let newPiecesInHand = {
    stack: {
      pieces: movePieces.slice(0, piecesGrabbed - piecesToDrop)
    },
    to: {
      row: to.row + (to.row - row),
      col: to.col + (to.col - col)
    }
  };

  if (newPiecesInHand.stack.pieces.length === 0) {
    newPiecesInHand = null;
  }

  let piecesDropped = movePieces.slice(piecesGrabbed - piecesToDrop);

  if (piecesInHand) {
    newBoard = board;
  } else {
    newBoard = {
      ...board,
      cells: replaceCell(board, row, col, {
        pieces: stack.pieces.slice(piecesGrabbed)
      })
    };
  }

  return {
    piecesInHand: newPiecesInHand,
    board: {
      ...newBoard,
      cells: replaceCell(newBoard, to.row, to.col, {
        pieces: [
          ...piecesDropped,
          ...board.cells[to.row][to.col].pieces
        ]
      })
    }
  };
};

const replaceCell = (board: Board, row: number, col: number, stack: Stack) => {
  const newRow = [
    ...board.cells[row].slice(0, col),
    stack,
    ...board.cells[row].slice(col + 1)
  ];

  return [
    ...board.cells.slice(0, row),
    newRow,
    ...board.cells.slice(row + 1)
  ];
};

export const createBoard = (size): Board => {
  let cells: Stack[][] = [];

  for(let i = 0; i < size; i += 1) {
    let row: Stack[] = [];

    for(let j = 0; j < size; j += 1) {
      row = [...row, { pieces: [] }];
    }

    cells = [...cells, row];
  }

  return {
    size,
    cells
  };
};

export const boardStr = (strings, ...values) => {
  // Interweave the strings with the
  // substitution vars first.
  let output = '';
  for (let i = 0; i < values.length; i++) {
    output += strings[i] + values[i];
  }
  output += strings[values.length];

  // Split on newlines.
  let lines = output.split(/(?:\r\n|\n|\r)/);

  // Rip out the leading whitespace.
  return lines.map((line) => {
    return line.replace(/^\s+/gm, '');
  }).join('\n').trim();
};

export const boardToText = (board: Board): string => {
  const { size, cells } = board;

  return cells.map((row: Stack[]) => (
    row.map((stack: Stack) => {
      if (stack.pieces.length === 0) {
        return 'E';
      }

      return stack.pieces.map(piece => {
        const { color, type } = piece;
        let colorStr = color === PlayerColor.white ? 'W' : 'B';
        let typeStr = type === PieceType.flat ? 'F' : 'S';
        return `${colorStr}${typeStr}`;
      }).join("|");
    }).join(",")
  )).join("\n");
};

export const boardFromText = (strings, ...values): Board => {
  let cells: Stack[][] = [];

  const rowsStr = boardStr(strings, ...values).split("\n");

  rowsStr.forEach(rowStr => {
    const row = rowStr.split(",").map(stackStr => {
      if(stackStr === 'E') {
        return {
          pieces: []
        };
      }

      const pieces = stackStr.split("|").map(pieceStr => {
        const [, colorStr, typeStr] = pieceStr.match(/(\w)(\w)/);

        return {
          color: colorStr === 'W' ? PlayerColor.white : PlayerColor.black,
          type: typeStr === 'F' ? PieceType.flat : PieceType.standing
        };
      });

      return {
        pieces
      };
    });
    cells = [...cells, row];
  });

  return {
    size: 3,
    cells
  };
};

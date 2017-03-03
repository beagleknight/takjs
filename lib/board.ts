import { Action, Player, ActionType, DropActionData, MoveActionData } from './action';
import { Piece, PieceType } from './piece';

interface Stack {
  pieces: Piece[];
}

export interface Board {
  size: number;
  cells: Stack[][];
}

export const isValidAction = (board: Board, action: Action): boolean => {
  switch (action.type) {
    case ActionType.drop:
      return isValidDropAction(board, action);
    case ActionType.move:
      return isValidMoveAction(board, action);
    default:
      return false;
  }
};

const isValidDropAction = (board: Board, action: Action): boolean => {
  let { row, col } = action;
  let stack: Stack = board.cells[row][col];

  return stack.pieces.length === 0;
};

const isValidMoveAction = (board: Board, action: Action): boolean => {
  let { row, col } = action;
  let stack: Stack = board.cells[row][col];

  return stack.pieces.length > 0 && stack.pieces[0].color === action.player;
};

export const applyAction = (board: Board, action: Action): Board => {
  switch (action.type) {
    case ActionType.drop:
      return applyDropAction(board, action);
    case ActionType.move:
      return applyMoveAction(board, action);
    default:
      return board;
  }
};

const applyDropAction = (board: Board, action: Action): Board => {
  const { row, col, data } = action;
  const { piece } = data as DropActionData;
  const stack: Stack = board.cells[row][col];

  return {
    ...board,
    cells: replaceCell(board, row, col, {
      pieces: [
        piece,
        ...stack.pieces
      ]
    })
  };
};

const applyMoveAction = (board: Board, action: Action): Board => {
  const { row, col, data } = action;
  const { pieces, to } = data as MoveActionData;
  const stack: Stack = board.cells[row][col];

  let movePieces = stack.pieces.slice(0, pieces);

  let newBoard = {
    ...board,
    cells: replaceCell(board, row, col, {
      pieces: stack.pieces.slice(pieces)
    })
  };

  return {
    ...newBoard,
    cells: replaceCell(newBoard, to.row, to.col, {
      pieces: [
        ...movePieces,
        ...board.cells[to.row][to.col].pieces
      ]
    })
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
        let colorStr = color === Player.white ? 'W' : 'B';
        let typeStr = type === PieceType.flat ? 'F' : 'S';
        return `${colorStr}${typeStr}`;
      }).join("|");
    }).join(",")
  )).join("\n");
};

export const boardFromText = (str: string): Board => {
  let cells: Stack[][] = [];

  const rowsStr = str.split("\n");

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
          color: colorStr === 'W' ? Player.white : Player.black,
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

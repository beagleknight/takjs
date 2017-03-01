import { Movement, Player, MovementType, DropMovementData, MoveMovementData } from './movement';
import { Piece, PieceType } from './piece';

interface Stack {
  pieces: Piece[];
}

export interface Board {
  size: number;
  cells: Stack[][];
}

export const isValidMovement = (board: Board, movement: Movement): boolean => {
  switch (movement.type) {
    case MovementType.drop:
      return isValidDropMovement(board, movement);
    case MovementType.move:
      return isValidMoveMovement(board, movement);
    default:
      return false;
  }
};

const isValidDropMovement = (board: Board, movement: Movement): boolean => {
  let { row, col } = movement;
  let stack: Stack = board.cells[row][col];

  return stack.pieces.length === 0;
};

const isValidMoveMovement = (board: Board, movement: Movement): boolean => {
  let { row, col } = movement;
  let stack: Stack = board.cells[row][col];

  return stack.pieces.length > 0 && stack.pieces[0].color === movement.player;
};

export const applyMovement = (board: Board, movement: Movement): Board => {
  switch (movement.type) {
    case MovementType.drop:
      return applyDropMovement(board, movement);
    case MovementType.move:
      return applyMoveMovement(board, movement);
    default:
      return board;
  }
};

const applyDropMovement = (board: Board, movement: Movement): Board => {
  const { row, col, data } = movement;
  const { piece } = data as DropMovementData;
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

const applyMoveMovement = (board: Board, movement: Movement): Board => {
  const { row, col, data } = movement;
  const { pieces, to } = data as MoveMovementData;
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

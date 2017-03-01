import { Movement, Player, MovementType, DropMovementData, MoveMovementData } from './movement';
import { Piece, PieceType } from './piece';

interface Stack {
    pieces: Piece[];
}

export interface Board {
    rows: number;
    cols: number;
    cells: Stack[][];
}

export const isValidMovement = (board: Board, movement: Movement): boolean => {
    switch(movement.type) {
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
    switch(movement.type) {
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

export const createInitialBoard = (): Board => {
    return {
        rows: 3,
        cols: 3,
        cells: [
            [{ pieces: [] }, { pieces: [] }, { pieces: [] }],
            [{ pieces: [] }, { pieces: [] }, { pieces: [] }],
            [{ pieces: [] }, { pieces: [] }, { pieces: [] }]
        ]
    };
};

export const printBoard = (board: Board) => {
    const { rows, cols, cells } = board;
    let boardStr = '';

    for(let i = 0; i < rows; i += 1) {
        for(let j = 0; j < cols; j += 1) {
            let stackStr = '';

            stackStr = cells[i][j].pieces.map(piece => {
                const colorStr = piece.color === Player.white ? 'W' : 'B';
                const pieceStr = piece.type === PieceType.flat ? 'F' : 'S';

                return `${colorStr}${pieceStr}`;
            }).join("|");

            boardStr += `${stackStr}, `;
        }
        boardStr += "\n";
    }

    return boardStr;
};

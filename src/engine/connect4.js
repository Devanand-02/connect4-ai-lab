/**
 * Connect-4 Game Engine
 * Standard 7-column x 6-row grid representation and move validation.
 */

export const ROWS = 6;
export const COLS = 7;
export const EMPTY = 0;
export const PLAYER_HUMAN = 1; // Yellow / Player 1
export const PLAYER_AI = 2;    // Red / Player 2 / Bot

/**
 * Creates an empty 6x7 board initialized with 0.
 * Board representation: board[row][col], where row 0 is TOP, row 5 is BOTTOM.
 */
export function createEmptyBoard() {
  const board = [];
  for (let r = 0; r < ROWS; r++) {
    board.push(new Array(COLS).fill(EMPTY));
  }
  return board;
}

/**
 * Deep clones the board state.
 */
export function cloneBoard(board) {
  return board.map(row => [...row]);
}

/**
 * Checks if a column has space for a piece.
 */
export function isValidMove(board, col) {
  if (col < 0 || col >= COLS) return false;
  return board[0][col] === EMPTY;
}

/**
 * Gets all column indices that can accept a piece.
 * By default ordered center-outwards for move ordering optimization: [3, 2, 4, 1, 5, 0, 6].
 */
export function getValidMoves(board, centerOrder = true) {
  const defaultOrder = centerOrder ? [3, 2, 4, 1, 5, 0, 6] : [0, 1, 2, 3, 4, 5, 6];
  const valid = [];
  for (const col of defaultOrder) {
    if (isValidMove(board, col)) {
      valid.push(col);
    }
  }
  return valid;
}

/**
 * Finds the lowest available row in a given column.
 * Returns row index (0..5) or -1 if column is full.
 */
export function getNextOpenRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) {
      return r;
    }
  }
  return -1;
}

/**
 * Drops a piece into the specified column for the given player.
 * Mutates the board and returns the row where it landed, or -1 if invalid.
 */
export function makeMove(board, col, player) {
  const r = getNextOpenRow(board, col);
  if (r !== -1) {
    board[r][col] = player;
    return r;
  }
  return -1;
}

/**
 * Undoes a move in the specified column (removes top-most piece in col).
 */
export function undoMove(board, col) {
  for (let r = 0; r < ROWS; r++) {
    if (board[r][col] !== EMPTY) {
      board[r][col] = EMPTY;
      return r;
    }
  }
  return -1;
}

/**
 * Checks if the specified player has achieved 4-in-a-row.
 * Returns details of the winning cells or null.
 */
export function checkWin(board, player) {
  // 1. Horizontal check
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r][c + 1] === player &&
        board[r][c + 2] === player &&
        board[r][c + 3] === player
      ) {
        return [
          { r, c },
          { r, c: c + 1 },
          { r, c: c + 2 },
          { r, c: c + 3 }
        ];
      }
    }
  }

  // 2. Vertical check
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      if (
        board[r][c] === player &&
        board[r + 1][c] === player &&
        board[r + 2][c] === player &&
        board[r + 3][c] === player
      ) {
        return [
          { r, c },
          { r: r + 1, c },
          { r: r + 2, c },
          { r: r + 3, c }
        ];
      }
    }
  }

  // 3. Positively sloped diagonal (bottom-left to top-right)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r - 1][c + 1] === player &&
        board[r - 2][c + 2] === player &&
        board[r - 3][c + 3] === player
      ) {
        return [
          { r, c },
          { r: r - 1, c: c + 1 },
          { r: r - 2, c: c + 2 },
          { r: r - 3, c: c + 3 }
        ];
      }
    }
  }

  // 4. Negatively sloped diagonal (top-left to bottom-right)
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r + 1][c + 1] === player &&
        board[r + 2][c + 2] === player &&
        board[r + 3][c + 3] === player
      ) {
        return [
          { r, c },
          { r: r + 1, c: c + 1 },
          { r: r + 2, c: c + 2 },
          { r: r + 3, c: c + 3 }
        ];
      }
    }
  }

  return null;
}

/**
 * Checks if the board is completely full (Draw condition).
 */
export function checkDraw(board) {
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === EMPTY) return false;
  }
  return true;
}

/**
 * Bitboard encoder/decoder utilities for ultra-fast bitwise evaluation if needed.
 */
export function getBitboardKey(board) {
  let key = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      key += board[r][c];
    }
  }
  return key;
}

/**
 * Minimax AI Engine with Alpha-Beta Pruning & Transparent Heuristic Evaluation.
 */

import {
  ROWS,
  COLS,
  EMPTY,
  PLAYER_HUMAN,
  PLAYER_AI,
  getValidMoves,
  makeMove,
  undoMove,
  checkWin,
  checkDraw
} from './connect4.js';
import { TelemetryTracker } from './telemetry.js';

// Positional weight matrix (Center column control priority)
// Column 3 has 13 potential 4-in-a-row windows, Column 0 has only 3.
export const POSITION_WEIGHTS = [
  [3, 4, 5, 7, 5, 4, 3],
  [4, 6, 8, 10, 8, 6, 4],
  [5, 8, 11, 13, 11, 8, 5],
  [5, 8, 11, 13, 11, 8, 5],
  [4, 6, 8, 10, 8, 6, 4],
  [3, 4, 5, 7, 5, 4, 3]
];

/**
 * Evaluates a 4-cell window based on academic heuristic rubrics.
 * - 4 in a row: +100,000
 * - 3 in a row + 1 open: +100
 * - 2 in a row + 2 open: +10
 * - Opponent 3 in a row + 1 open: -100 (Block needed)
 * - Opponent 4 in a row: -100,000
 */
function evaluateWindow(window, piece) {
  let score = 0;
  const opponent = piece === PLAYER_AI ? PLAYER_HUMAN : PLAYER_AI;

  let pieceCount = 0;
  let emptyCount = 0;
  let oppCount = 0;

  for (let i = 0; i < 4; i++) {
    if (window[i] === piece) pieceCount++;
    else if (window[i] === EMPTY) emptyCount++;
    else if (window[i] === opponent) oppCount++;
  }

  if (pieceCount === 4) {
    score += 100000;
  } else if (pieceCount === 3 && emptyCount === 1) {
    score += 100;
  } else if (pieceCount === 2 && emptyCount === 2) {
    score += 10;
  }

  if (oppCount === 4) {
    score -= 100000;
  } else if (oppCount === 3 && emptyCount === 1) {
    score -= 100; // Threat block penalty
  } else if (oppCount === 2 && emptyCount === 2) {
    score -= 10;
  }

  return score;
}

/**
 * Full static evaluation of board state for the given piece (PLAYER_AI).
 */
export function evaluateBoard(board, piece = PLAYER_AI) {
  let score = 0;

  // 1. Center column positional dominance weight sum
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === piece) {
        score += POSITION_WEIGHTS[r][c];
      } else if (board[r][c] !== EMPTY) {
        score -= POSITION_WEIGHTS[r][c];
      }
    }
  }

  // 2. Horizontal windows
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
      score += evaluateWindow(window, piece);
    }
  }

  // 3. Vertical windows
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      score += evaluateWindow(window, piece);
    }
  }

  // 4. Positive diagonal (bottom-left to top-right)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
      score += evaluateWindow(window, piece);
    }
  }

  // 5. Negative diagonal (top-left to bottom-right)
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      score += evaluateWindow(window, piece);
    }
  }

  return score;
}

/**
 * Minimax with Alpha-Beta Pruning.
 */
export function minimaxAlphaBeta(
  board,
  depth,
  alpha,
  beta,
  isMaximizing,
  telemetry,
  useAlphaBeta = true
) {
  telemetry.incrementNode();

  const isTerminalWinAI = checkWin(board, PLAYER_AI);
  const isTerminalWinHuman = checkWin(board, PLAYER_HUMAN);
  const isTerminalDraw = checkDraw(board);

  if (isTerminalWinAI) return 1000000 + depth; // Favor quicker wins
  if (isTerminalWinHuman) return -1000000 - depth; // Favor delaying losses
  if (isTerminalDraw) return 0;
  if (depth === 0) return evaluateBoard(board, PLAYER_AI);

  const validMoves = getValidMoves(board, true); // Move ordering: center first

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < validMoves.length; i++) {
      const col = validMoves[i];
      makeMove(board, col, PLAYER_AI);
      const evalScore = minimaxAlphaBeta(board, depth - 1, alpha, beta, false, telemetry, useAlphaBeta);
      undoMove(board, col);

      maxEval = Math.max(maxEval, evalScore);

      if (useAlphaBeta) {
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) {
          // Record pruned remaining branches
          const remainingBranches = validMoves.length - (i + 1);
          if (remainingBranches > 0) {
            telemetry.recordPruning(remainingBranches);
          }
          break; // Alpha-Beta Cutoff
        }
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < validMoves.length; i++) {
      const col = validMoves[i];
      makeMove(board, col, PLAYER_HUMAN);
      const evalScore = minimaxAlphaBeta(board, depth - 1, alpha, beta, true, telemetry, useAlphaBeta);
      undoMove(board, col);

      minEval = Math.min(minEval, evalScore);

      if (useAlphaBeta) {
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) {
          const remainingBranches = validMoves.length - (i + 1);
          if (remainingBranches > 0) {
            telemetry.recordPruning(remainingBranches);
          }
          break; // Alpha-Beta Cutoff
        }
      }
    }
    return minEval;
  }
}

/**
 * Top-level function to select the best move for AI.
 * Also gathers detailed candidate evaluations per column for live UI Telemetry.
 */
export function getBestMove(board, depth = 6, useAlphaBeta = true) {
  const telemetry = new TelemetryTracker();
  telemetry.startTimer(depth);

  const validMoves = getValidMoves(board, true);

  // If no moves available
  if (validMoves.length === 0) {
    telemetry.stopTimer();
    return { bestCol: -1, telemetry: telemetry.getSummary() };
  }

  let bestScore = -Infinity;
  let bestCol = validMoves[0];
  let alpha = -Infinity;
  let beta = Infinity;

  // Immediate win or immediate block detection optimization check at root level
  // 1. Immediate Win Check
  for (const col of validMoves) {
    makeMove(board, col, PLAYER_AI);
    if (checkWin(board, PLAYER_AI)) {
      undoMove(board, col);
      telemetry.addCandidateEvaluation(col, 1000000, 1);
      telemetry.bestMove = col;
      telemetry.bestScore = 1000000;
      telemetry.stopTimer();
      return { bestCol: col, telemetry: telemetry.getSummary() };
    }
    undoMove(board, col);
  }

  // Evaluate each root candidate move
  for (const col of validMoves) {
    const prevNodeCount = telemetry.nodesEvaluated;
    makeMove(board, col, PLAYER_AI);

    // Call minimax for opponent's turn (Minimizing)
    const score = minimaxAlphaBeta(
      board,
      depth - 1,
      alpha,
      beta,
      false,
      telemetry,
      useAlphaBeta
    );

    undoMove(board, col);
    const subNodes = telemetry.nodesEvaluated - prevNodeCount;

    telemetry.addCandidateEvaluation(col, score, subNodes);

    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }

    if (useAlphaBeta) {
      alpha = Math.max(alpha, score);
    }
  }

  telemetry.bestMove = bestCol;
  telemetry.bestScore = bestScore;
  telemetry.stopTimer();

  return {
    bestCol,
    telemetry: telemetry.getSummary()
  };
}

/**
 * Utility to run benchmark comparison between Pure Minimax vs Alpha-Beta Pruning.
 */
export function runBenchmark(board, depth = 4) {
  const resultAB = getBestMove(board, depth, true);
  const resultPure = getBestMove(board, depth, false);

  return {
    depth,
    alphaBeta: {
      nodesEvaluated: resultAB.telemetry.nodesEvaluated,
      nodesPruned: resultAB.telemetry.nodesPruned,
      timeMs: resultAB.telemetry.timeMs,
      bestCol: resultAB.bestCol
    },
    pureMinimax: {
      nodesEvaluated: resultPure.telemetry.nodesEvaluated,
      nodesPruned: 0,
      timeMs: resultPure.telemetry.timeMs,
      bestCol: resultPure.bestCol
    },
    nodeReductionRatio: (
      (resultPure.telemetry.nodesEvaluated - resultAB.telemetry.nodesEvaluated) /
      resultPure.telemetry.nodesEvaluated * 100
    ).toFixed(1) + '%'
  };
}

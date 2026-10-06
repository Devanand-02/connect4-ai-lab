/**
 * Academic Test Case Generator for AI Evaluation
 * Pre-configured board scenarios to test and verify AI algorithms.
 */

import { createEmptyBoard, PLAYER_HUMAN, PLAYER_AI, ROWS, COLS } from './connect4.js';

export const TEST_CASES = [
  {
    id: 'immediate_win',
    title: 'Scenario 1: Immediate Win Detection',
    description: 'AI has 3 connected pieces in Row 5 (Cols 1,2,3). Col 4 completes the 4-in-a-row win.',
    setup: () => {
      const board = createEmptyBoard();
      // AI pieces in cols 1, 2, 3 bottom row
      board[5][1] = PLAYER_AI;
      board[5][2] = PLAYER_AI;
      board[5][3] = PLAYER_AI;

      // Human pieces scattered
      board[5][0] = PLAYER_HUMAN;
      board[4][1] = PLAYER_HUMAN;
      return board;
    },
    expectedCol: 4,
    expectedReason: 'AI will execute immediate winning move in Column 4 (+1,000,000 score).'
  },
  {
    id: 'forced_block',
    title: 'Scenario 2: Forced Block Threat',
    description: 'Human player has 3 in a row (Cols 2,3,4 bottom row). AI MUST place piece in Col 1 or 5 to block.',
    setup: () => {
      const board = createEmptyBoard();
      // Human pieces in cols 2, 3, 4 bottom row
      board[5][2] = PLAYER_HUMAN;
      board[5][3] = PLAYER_HUMAN;
      board[5][4] = PLAYER_HUMAN;

      // AI piece in col 0
      board[5][0] = PLAYER_AI;
      return board;
    },
    expectedCol: 1, // or 5
    expectedReason: 'Human threatens immediate win; Minimax heavily penalizes non-blocking paths.'
  },
  {
    id: 'center_dominance',
    title: 'Scenario 3: Center Column Positional Preference',
    description: 'Empty board state or early opening turn. AI evaluates high positional score for Column 3.',
    setup: () => {
      const board = createEmptyBoard();
      board[5][3] = PLAYER_HUMAN; // Human opened in center bottom
      return board;
    },
    expectedCol: 3,
    expectedReason: 'Center column maximizes 4-in-a-row window coverage (13 potential winning lines).'
  },
  {
    id: 'fork_trap',
    title: 'Scenario 4: Double Fork / Trap Setup',
    description: 'Board set up so AI can create a 7-window dual threat (unblockable 4-in-a-row).',
    setup: () => {
      const board = createEmptyBoard();
      // Row 5
      board[5][2] = PLAYER_AI;
      board[5][3] = PLAYER_AI;
      board[5][1] = PLAYER_HUMAN;
      board[5][4] = PLAYER_HUMAN;

      // Row 4
      board[4][3] = PLAYER_AI;
      board[4][2] = PLAYER_HUMAN;
      return board;
    },
    expectedCol: 3,
    expectedReason: 'AI builds vertical/diagonal alignment creating dual winning vectors.'
  }
];

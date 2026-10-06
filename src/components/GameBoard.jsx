import React, { useState } from 'react';
import { ROWS, COLS, EMPTY, PLAYER_HUMAN, PLAYER_AI } from '../engine/connect4';
import { POSITION_WEIGHTS } from '../engine/ai';
import { ArrowDown, Sparkles } from 'lucide-react';

export default function GameBoard({
  board,
  onColumnClick,
  activePlayer,
  winningCells,
  isThinking,
  gameOver,
  lastMove,
  showHeuristicOverlay,
  candidateScores = []
}) {
  const [hoveredCol, setHoveredCol] = useState(null);

  const getCandidateScoreForCol = (colIndex) => {
    if (!candidateScores || candidateScores.length === 0) return null;
    const match = candidateScores.find(item => item.col === colIndex);
    return match ? match.score : null;
  };

  const isWinningCell = (r, c) => {
    if (!winningCells) return false;
    return winningCells.some(cell => cell.r === r && cell.c === c);
  };

  const isLastMoveCell = (r, c) => {
    return lastMove && lastMove.r === r && lastMove.c === c;
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-xl mx-auto">

      {/* Top Column Drop Indicators & Score Badges */}
      <div className="grid grid-cols-7 gap-2 w-full mb-2 px-3">
        {Array.from({ length: COLS }).map((_, col) => {
          const isFull = board[0][col] !== EMPTY;
          const score = getCandidateScoreForCol(col);

          return (
            <div key={col} className="flex flex-col items-center justify-end h-10 relative">
              {/* Candidate Score Preview Badge */}
              {score !== null && !gameOver && (
                <div
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-all shadow-sm ${
                    score >= 500000
                      ? 'bg-emerald-500 text-slate-950 animate-bounce'
                      : score <= -500000
                      ? 'bg-rose-600 text-white'
                      : score > 0
                      ? 'bg-cyan-900/90 text-cyan-300 border border-cyan-700'
                      : score < 0
                      ? 'bg-amber-950/90 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                  title={`AI Static Score evaluation for Col ${col}`}
                >
                  {score >= 500000 ? '+WIN' : score <= -500000 ? '-WIN' : score}
                </div>
              )}

              {/* Hover Drop Arrow */}
              {hoveredCol === col && !isFull && !isThinking && !gameOver && (
                <div className="animate-bounce text-cyan-400 mt-1">
                  <ArrowDown className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main 7x6 Connect-4 Plastic Grid Frame */}
      <div className="bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 p-3.5 md:p-5 rounded-2xl border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/80 w-full relative">

        {/* Board Holes */}
        <div className="grid grid-cols-7 gap-2 md:gap-3 bg-blue-950/90 p-3 rounded-xl border border-blue-800/50 shadow-inner">
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((_, c) => {
              const cellValue = board[r][c];
              const isWin = isWinningCell(r, c);
              const isLast = isLastMoveCell(r, c);
              const isFullCol = board[0][c] !== EMPTY;

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => !isThinking && !gameOver && !isFullCol && onColumnClick(c)}
                  onMouseEnter={() => setHoveredCol(c)}
                  onMouseLeave={() => setHoveredCol(null)}
                  className={`aspect-square rounded-full flex items-center justify-center relative transition-all duration-200 cursor-pointer overflow-hidden ${
                    hoveredCol === c && cellValue === EMPTY && !gameOver && !isThinking
                      ? 'ring-2 ring-cyan-400/60 bg-blue-900/40'
                      : ''
                  }`}
                >
                  {/* Slot Background Circle */}
                  <div className="absolute inset-0 rounded-full bg-slate-950 border border-blue-900/80 shadow-inner" />

                  {/* Positional Matrix Weight Number Overlay */}
                  {showHeuristicOverlay && cellValue === EMPTY && (
                    <span className="relative z-10 font-mono text-[10px] md:text-xs font-bold text-slate-500/80">
                      {POSITION_WEIGHTS[r][c]}
                    </span>
                  )}

                  {/* Disc Piece (Yellow / Red) */}
                  {cellValue !== EMPTY && (
                    <div
                      className={`absolute inset-1 rounded-full shadow-lg transition-transform duration-300 transform scale-95 flex items-center justify-center ${
                        cellValue === PLAYER_HUMAN
                          ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-200 border-2 border-amber-300 shadow-yellow-500/30'
                          : 'bg-gradient-to-tr from-rose-700 via-red-500 to-rose-300 border-2 border-rose-300 shadow-rose-500/30'
                      } ${isWin ? 'ring-4 ring-emerald-400 animate-pulse scale-100 z-20' : ''}`}
                    >
                      {/* Inner Ring Glow */}
                      <div className="w-3/4 h-3/4 rounded-full border border-white/20 bg-white/10" />

                      {/* Last Move Indicator Ring */}
                      {isLast && (
                        <div className="absolute w-3 h-3 bg-white rounded-full shadow-md animate-ping" />
                      )}

                      {/* Winning Cell Star */}
                      {isWin && (
                        <Sparkles className="w-4 h-4 text-emerald-950 absolute animate-spin" />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

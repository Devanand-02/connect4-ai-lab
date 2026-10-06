import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import GameBoard from './components/GameBoard';
import InspectorPanel from './components/InspectorPanel';
import MoveHistory from './components/MoveHistory';
import BenchmarkModal from './components/BenchmarkModal';
import ReportModal from './components/ReportModal';
import {
  createEmptyBoard,
  cloneBoard,
  makeMove,
  checkWin,
  checkDraw,
  PLAYER_HUMAN,
  PLAYER_AI
} from './engine/connect4';
import { getBestMove } from './engine/ai';
import { sounds } from './utils/audio';

export default function App() {
  const [board, setBoard] = useState(createEmptyBoard);
  const [activePlayer, setActivePlayer] = useState(PLAYER_HUMAN);
  const [gameMode, setGameMode] = useState('pve'); // 'pve', 'eve', 'pvp'
  const [difficulty, setDifficulty] = useState(6);
  const [isThinking, setIsThinking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showHeuristicOverlay, setShowHeuristicOverlay] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Trigger win confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Reset Game
  const handleReset = () => {
    setBoard(createEmptyBoard());
    setActivePlayer(PLAYER_HUMAN);
    setGameOver(false);
    setWinner(null);
    setWinningCells(null);
    setTelemetry(null);
    setMoveHistory([]);
    setLastMove(null);
    setIsThinking(false);
    setIsAutoPlaying(false);
    sounds.playClick();
  };

  // Execute Move
  const executeMove = useCallback((col, player) => {
    if (gameOver || isThinking) return false;

    const newBoard = cloneBoard(board);
    const row = makeMove(newBoard, col, player);

    if (row === -1) return false; // Column full

    sounds.playDrop(player === PLAYER_AI);

    setBoard(newBoard);
    setLastMove({ r: row, c: col });

    // Check Win
    const win = checkWin(newBoard, player);
    if (win) {
      setWinningCells(win);
      setWinner(player);
      setGameOver(true);
      sounds.playWin();
      triggerConfetti();
      return true;
    }

    // Check Draw
    if (checkDraw(newBoard)) {
      setWinner('draw');
      setGameOver(true);
      return true;
    }

    // Switch Player
    const nextPlayer = player === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN;
    setActivePlayer(nextPlayer);

    return true;
  }, [board, gameOver, isThinking]);

  // AI Turn Execution (Non-blocking async computation)
  const triggerAIMove = useCallback(() => {
    if (gameOver || isThinking) return;

    setIsThinking(true);

    // Defer execution using setTimeout to let React render thinking state
    setTimeout(() => {
      const { bestCol, telemetry: tel } = getBestMove(board, difficulty, true);

      setTelemetry(tel);

      if (bestCol !== -1) {
        const newBoard = cloneBoard(board);
        const row = makeMove(newBoard, bestCol, PLAYER_AI);

        if (row !== -1) {
          sounds.playDrop(true);
          setBoard(newBoard);
          setLastMove({ r: row, c: bestCol });

          // Log Move
          setMoveHistory(prev => [
            ...prev,
            { player: PLAYER_AI, col: bestCol, row, telemetry: tel }
          ]);

          // Check Win
          const win = checkWin(newBoard, PLAYER_AI);
          if (win) {
            setWinningCells(win);
            setWinner(PLAYER_AI);
            setGameOver(true);
            sounds.playWin();
            triggerConfetti();
          } else if (checkDraw(newBoard)) {
            setWinner('draw');
            setGameOver(true);
          } else {
            setActivePlayer(PLAYER_HUMAN);
          }
        }
      }

      setIsThinking(false);
    }, 40);
  }, [board, difficulty, gameOver, isThinking]);

  // Handle Human Move Click
  const handleColumnClick = (col) => {
    if (gameOver || isThinking) return;

    if (gameMode === 'pve' && activePlayer === PLAYER_HUMAN) {
      const moved = executeMove(col, PLAYER_HUMAN);
      if (moved) {
        setMoveHistory(prev => [
          ...prev,
          { player: PLAYER_HUMAN, col, row: lastMove?.r }
        ]);
      }
    } else if (gameMode === 'pvp') {
      const current = activePlayer;
      const moved = executeMove(col, current);
      if (moved) {
        setMoveHistory(prev => [
          ...prev,
          { player: current, col, row: lastMove?.r }
        ]);
      }
    }
  };

  // Trigger AI turn in PvE mode
  useEffect(() => {
    if (!gameOver && gameMode === 'pve' && activePlayer === PLAYER_AI && !isThinking) {
      triggerAIMove();
    }
  }, [activePlayer, gameMode, gameOver, isThinking, triggerAIMove]);

  // Handle AI vs AI Auto Play
  useEffect(() => {
    if (gameMode === 'eve' && isAutoPlaying && !gameOver && !isThinking) {
      const timer = setTimeout(() => {
        triggerAIMove();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [activePlayer, gameMode, isAutoPlaying, gameOver, isThinking, triggerAIMove]);

  // Load Test Scenario
  const handleLoadTestScenario = (testCase) => {
    handleReset();
    const testBoard = testCase.setup();
    setBoard(testBoard);

    // Trigger AI evaluation immediately on the loaded scenario board
    setTimeout(() => {
      const { bestCol, telemetry: tel } = getBestMove(testBoard, difficulty, true);
      setTelemetry(tel);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Header Bar */}
      <Header
        gameMode={gameMode}
        setGameMode={(mode) => { setGameMode(mode); handleReset(); }}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onReset={handleReset}
        onOpenReport={() => setShowReportModal(true)}
        onOpenBenchmark={() => setShowBenchmarkModal(true)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isAutoPlaying={isAutoPlaying}
        setIsAutoPlaying={setIsAutoPlaying}
        showHeuristicOverlay={showHeuristicOverlay}
        setShowHeuristicOverlay={setShowHeuristicOverlay}
      />

      {/* Main Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Game Arena & Controls (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col gap-5 items-center">
          
          {/* Turn Banner */}
          <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full animate-ping ${
                activePlayer === PLAYER_HUMAN ? 'bg-amber-400' : 'bg-rose-500'
              }`} />
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Game Status</span>
                <span className="text-sm font-bold font-mono">
                  {gameOver ? (
                    winner === 'draw' ? (
                      <span className="text-slate-300">GAME DRAW!</span>
                    ) : winner === PLAYER_HUMAN ? (
                      <span className="text-amber-400 font-extrabold">YELLOW WINS! 🎉</span>
                    ) : (
                      <span className="text-rose-400 font-extrabold">RED (AI) WINS! 🤖</span>
                    )
                  ) : isThinking ? (
                    <span className="text-cyan-400 animate-pulse">AI IS COMPUTING OPTIMAL MOVE...</span>
                  ) : activePlayer === PLAYER_HUMAN ? (
                    <span className="text-amber-300">YOUR TURN (YELLOW)</span>
                  ) : (
                    <span className="text-rose-300">AI'S TURN (RED)</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700 text-slate-300">
                Mode: {gameMode.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Interactive Connect-4 Game Board */}
          <GameBoard
            board={board}
            onColumnClick={handleColumnClick}
            activePlayer={activePlayer}
            winningCells={winningCells}
            isThinking={isThinking}
            gameOver={gameOver}
            lastMove={lastMove}
            showHeuristicOverlay={showHeuristicOverlay}
            candidateScores={telemetry?.candidateEvaluations}
          />

          {/* Move History Component */}
          <MoveHistory history={moveHistory} />

        </section>

        {/* Right Column: AI Inspector & Telemetry Dashboard (5 Cols) */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          <InspectorPanel
            telemetry={telemetry}
            difficulty={difficulty}
            isThinking={isThinking}
            onLoadTestScenario={handleLoadTestScenario}
            lastMoveInfo={lastMove}
          />
        </section>

      </main>

      {/* Benchmark Comparator Modal */}
      <BenchmarkModal
        isOpen={showBenchmarkModal}
        onClose={() => setShowBenchmarkModal(false)}
        currentBoard={board}
      />

      {/* Academic Project Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

    </div>
  );
}

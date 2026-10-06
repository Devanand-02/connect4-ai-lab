import React from 'react';
import { Cpu, RotateCcw, Volume2, VolumeX, FileText, Zap, User, Bot, Play, Pause, BarChart2 } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Header({
  gameMode,
  setGameMode,
  difficulty,
  setDifficulty,
  onReset,
  onOpenReport,
  onOpenBenchmark,
  onLoadTestScenario,
  isMuted,
  setIsMuted,
  isAutoPlaying,
  setIsAutoPlaying,
  showHeuristicOverlay,
  setShowHeuristicOverlay
}) {
  const toggleMute = () => {
    sounds.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Branding Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <Cpu className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300 tracking-wide">
              CONNECT-4 AI LAB
            </h1>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>Minimax + Alpha-Beta Pruning Engine</span>
              <span className="bg-cyan-950 text-cyan-400 text-[10px] px-1.5 py-0.5 rounded border border-cyan-800">
                v2.4 Academic
              </span>
            </p>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Game Mode Selector */}
          <div className="bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 flex items-center text-xs">
            <button
              onClick={() => setGameMode('pve')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all font-medium ${
                gameMode === 'pve'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Human vs AI"
            >
              <User className="w-3.5 h-3.5" /> vs <Bot className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setGameMode('eve')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all font-medium ${
                gameMode === 'eve'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="AI vs AI Auto Play"
            >
              <Bot className="w-3.5 h-3.5" /> vs <Bot className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setGameMode('pvp')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all font-medium ${
                gameMode === 'pvp'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Human vs Human"
            >
              <User className="w-3.5 h-3.5" /> vs <User className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Difficulty Depth Selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/80 text-xs">
            <span className="text-slate-400 font-mono text-[11px] mr-1">Depth:</span>
            {[2, 4, 6, 8].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-2 py-1 rounded font-mono text-xs font-semibold transition-all ${
                  difficulty === d
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                d={d}
              </button>
            ))}
          </div>

          {/* AI vs AI Auto Play Button if in EvE mode */}
          {gameMode === 'eve' && (
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isAutoPlaying
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Auto
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start Auto
                </>
              )}
            </button>
          )}

          {/* Benchmark Tool Button */}
          <button
            onClick={onOpenBenchmark}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-800/60 rounded-lg text-xs font-medium transition-all shadow-sm"
          >
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" /> Benchmark
          </button>

          {/* Positional Matrix Overlay Toggle */}
          <button
            onClick={() => setShowHeuristicOverlay(!showHeuristicOverlay)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showHeuristicOverlay
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Spatial Weight Overlay"
          >
            Matrix Overlay
          </button>

          {/* Academic Report Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
          >
            <FileText className="w-3.5 h-3.5" /> Report
          </button>

          {/* Reset & Sound Toggle */}
          <button
            onClick={onReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

        </div>
      </div>
    </header>
  );
}

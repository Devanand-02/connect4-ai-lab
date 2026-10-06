import React from 'react';
import { Cpu, Zap, Scissors, Clock, Layers, Award, Target, HelpCircle, CheckCircle2 } from 'lucide-react';
import { TEST_CASES } from '../engine/testCases';

export default function InspectorPanel({
  telemetry,
  difficulty,
  isThinking,
  onLoadTestScenario,
  lastMoveInfo
}) {
  const candidateEvaluations = telemetry?.candidateEvaluations || [];
  const maxAbsScore = Math.max(
    100,
    ...candidateEvaluations.map(c => Math.abs(c.score > 900000 ? 1000 : c.score < -900000 ? -1000 : c.score))
  );

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 md:p-5 text-white shadow-xl flex flex-col gap-5 w-full">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-300">
            LIVE AI INSPECTOR PANEL
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isThinking ? (
            <span className="flex items-center gap-1.5 text-xs font-mono bg-cyan-950 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-800 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              SEARCHING...
            </span>
          ) : (
            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              READY
            </span>
          )}
        </div>
      </div>

      {/* Real-time Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        
        {/* Nodes Evaluated */}
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Nodes Expanded</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-cyan-300">
              {telemetry ? telemetry.nodesEvaluated.toLocaleString() : '0'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {telemetry ? `${telemetry.nodesPerSec.toLocaleString()} nodes/sec` : '0 nodes/sec'}
            </div>
          </div>
        </div>

        {/* Nodes Pruned & Cutoffs */}
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Pruning Cutoffs</span>
            <Scissors className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-rose-300">
              {telemetry ? telemetry.cutoffs.toLocaleString() : '0'}
            </div>
            <div className="text-[10px] text-rose-400/90 font-mono mt-0.5">
              {telemetry ? `${telemetry.nodesPruned.toLocaleString()} branches cut` : '0 branches cut'}
            </div>
          </div>
        </div>

        {/* Pruning Efficiency % */}
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Pruning Efficiency</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-emerald-300">
              {telemetry ? `${telemetry.pruningEfficiency}%` : '0%'}
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-500"
                style={{ width: `${telemetry ? telemetry.pruningEfficiency : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Execution Time */}
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Search Time</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-amber-300">
              {telemetry ? `${telemetry.timeMs} ms` : '0 ms'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Depth limit d={difficulty}
            </div>
          </div>
        </div>

        {/* Static Heuristic Score */}
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between col-span-2 md:col-span-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Chosen Best Move Score</span>
            <Award className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <span className={`text-lg font-bold font-mono ${
                telemetry?.bestScore > 500000
                  ? 'text-emerald-400'
                  : telemetry?.bestScore < -500000
                  ? 'text-rose-400'
                  : 'text-indigo-300'
              }`}>
                {telemetry?.bestScore > 500000
                  ? 'FORCED WIN (+1M)'
                  : telemetry?.bestScore < -500000
                  ? 'FORCED LOSS (-1M)'
                  : `Score: ${telemetry ? telemetry.bestScore : 0}`}
              </span>
            </div>
            {telemetry?.bestMove !== null && telemetry?.bestMove !== undefined && (
              <span className="bg-cyan-950 text-cyan-300 text-xs font-mono font-bold px-2.5 py-1 rounded border border-cyan-800">
                Column {telemetry.bestMove}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Move Evaluation Chart (Cols 0..6) */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-cyan-400" /> Candidate Move Score Spectrum
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Higher = Better for AI</span>
        </div>

        {candidateEvaluations.length > 0 ? (
          <div className="grid grid-cols-7 gap-1.5 items-end h-32 pt-4 pb-2 border-b border-slate-800/80">
            {Array.from({ length: 7 }).map((_, colIdx) => {
              const cand = candidateEvaluations.find(c => c.col === colIdx);
              const isBest = telemetry?.bestMove === colIdx;

              if (!cand) {
                return (
                  <div key={colIdx} className="flex flex-col items-center justify-end h-full opacity-30">
                    <span className="text-[9px] text-slate-600">Full</span>
                    <div className="w-full bg-slate-800 h-2 rounded-t" />
                    <span className="text-[10px] font-mono text-slate-500 mt-1">{colIdx}</span>
                  </div>
                );
              }

              const normalizedScore = cand.score > 900000 ? 1000 : cand.score < -900000 ? -1000 : cand.score;
              const barHeightPct = Math.min(100, Math.max(15, (Math.abs(normalizedScore) / maxAbsScore) * 100));

              return (
                <div key={colIdx} className="flex flex-col items-center justify-end h-full group relative">
                  
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-slate-900 border border-cyan-700 text-cyan-300 text-[10px] font-mono p-1 rounded shadow-lg pointer-events-none z-30 transition-opacity whitespace-nowrap">
                    Col {colIdx}: Score {cand.score} ({cand.subNodes} nodes)
                  </div>

                  {/* Score Label above bar */}
                  <span className={`text-[9px] font-mono font-semibold mb-1 ${
                    isBest ? 'text-cyan-300 font-bold' : 'text-slate-400'
                  }`}>
                    {cand.score > 900000 ? '+1M' : cand.score < -900000 ? '-1M' : cand.score}
                  </span>

                  {/* Vertical Score Bar */}
                  <div className="w-full bg-slate-900 rounded-t h-full flex flex-col justify-end p-0.5 overflow-hidden">
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isBest
                          ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-md shadow-cyan-500/50 ring-1 ring-cyan-300'
                          : cand.score < 0
                          ? 'bg-gradient-to-t from-rose-900 to-rose-700'
                          : 'bg-gradient-to-t from-slate-700 to-slate-500'
                      }`}
                      style={{ height: `${barHeightPct}%` }}
                    />
                  </div>

                  {/* Column Number */}
                  <span className={`text-xs font-mono font-bold mt-1 ${
                    isBest ? 'text-cyan-400 bg-cyan-950 px-1 rounded border border-cyan-800' : 'text-slate-400'
                  }`}>
                    c{colIdx}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-28 flex items-center justify-center text-xs font-mono text-slate-500 italic">
            Make a move or select a test scenario to inspect AI candidate search spectrum
          </div>
        )}
      </div>

      {/* Academic Test Case Preset Selector */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Run Academic Test Case Presets
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Coursework Evaluation</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {TEST_CASES.map(tc => (
            <button
              key={tc.id}
              onClick={() => onLoadTestScenario(tc)}
              className="text-left p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-all text-xs group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                {tc.title}
              </div>
              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                {tc.description}
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

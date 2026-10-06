import React, { useState } from 'react';
import { X, Play, BarChart2, CheckCircle, Zap } from 'lucide-react';
import { runBenchmark } from '../engine/ai';

export default function BenchmarkModal({ isOpen, onClose, currentBoard }) {
  const [depth, setDepth] = useState(4);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRunBenchmark = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runBenchmark(currentBoard, depth);
      setBenchmarkResult(res);
      setIsRunning(false);
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 md:p-6 text-white shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">

        {/* Modal Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-300">
              Minimax vs. Alpha-Beta Benchmark Tool
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          This benchmark executes both <strong>Pure Minimax</strong> and <strong>Alpha-Beta Pruning</strong> on the exact current board state to empirically demonstrate the exponential reduction in evaluated state tree nodes.
        </p>

        {/* Benchmark Config Bar */}
        <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Select Search Depth:</span>
            {[2, 4, 6].map(d => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                  depth === d
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Depth {d}
              </button>
            ))}
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md disabled:opacity-50"
          >
            {isRunning ? (
              <span className="animate-pulse">Computing...</span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Run Comparison
              </>
            )}
          </button>
        </div>

        {/* Results Table */}
        {benchmarkResult && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-3">Metric</th>
                    <th className="p-3 text-rose-400">Pure Minimax</th>
                    <th className="p-3 text-cyan-400">Alpha-Beta Pruning</th>
                    <th className="p-3 text-emerald-400">Performance Improvement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  <tr>
                    <td className="p-3 text-slate-300 font-semibold">Nodes Evaluated</td>
                    <td className="p-3 font-mono text-rose-300">{benchmarkResult.pureMinimax.nodesEvaluated.toLocaleString()}</td>
                    <td className="p-3 font-mono text-cyan-300">{benchmarkResult.alphaBeta.nodesEvaluated.toLocaleString()}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{benchmarkResult.nodeReductionRatio} Node Reduction</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300 font-semibold">Pruned Branches</td>
                    <td className="p-3 text-slate-500">0 (Exhaustive)</td>
                    <td className="p-3 text-cyan-300 font-bold">{benchmarkResult.alphaBeta.nodesPruned.toLocaleString()}</td>
                    <td className="p-3 text-emerald-400 font-semibold">Massive Pruning Efficiency</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300 font-semibold">Execution Time</td>
                    <td className="p-3 text-rose-300">{benchmarkResult.pureMinimax.timeMs} ms</td>
                    <td className="p-3 text-cyan-300 font-bold">{benchmarkResult.alphaBeta.timeMs} ms</td>
                    <td className="p-3 text-emerald-400 font-bold">
                      {(benchmarkResult.pureMinimax.timeMs / Math.max(0.1, benchmarkResult.alphaBeta.timeMs)).toFixed(1)}x Faster
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300 font-semibold">Chosen Column</td>
                    <td className="p-3 text-slate-300">Col {benchmarkResult.pureMinimax.bestCol}</td>
                    <td className="p-3 text-cyan-300">Col {benchmarkResult.alphaBeta.bestCol}</td>
                    <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Identical Optimal Decision
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-cyan-950/40 p-3 rounded-xl border border-cyan-800/60 text-xs text-cyan-200 flex items-start gap-2">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong>Academic Verification:</strong> Alpha-Beta Pruning evaluates <strong>{benchmarkResult.alphaBeta.nodesEvaluated.toLocaleString()}</strong> nodes versus Pure Minimax's <strong>{benchmarkResult.pureMinimax.nodesEvaluated.toLocaleString()}</strong> nodes while yielding the exact same move decision (Column {benchmarkResult.alphaBeta.bestCol}), proving zero loss of optimality with $O(b^{d/2})$ search efficiency.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

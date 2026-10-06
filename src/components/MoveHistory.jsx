import React from 'react';
import { History, User, Bot } from 'lucide-react';
import { PLAYER_HUMAN, PLAYER_AI } from '../engine/connect4';

export default function MoveHistory({ history }) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 text-white shadow-xl flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Move History & Logs ({history.length})
          </h3>
        </div>
      </div>

      <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
        {history.length === 0 ? (
          <div className="text-slate-500 text-center py-6 text-xs italic">
            No moves played yet.
          </div>
        ) : (
          history.slice().reverse().map((entry, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                entry.player === PLAYER_AI
                  ? 'bg-rose-950/30 border-rose-900/40 text-rose-200'
                  : 'bg-amber-950/30 border-amber-900/40 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-bold">
                  #{history.length - idx}
                </span>
                {entry.player === PLAYER_AI ? (
                  <span className="flex items-center gap-1 font-semibold text-rose-300">
                    <Bot className="w-3.5 h-3.5" /> AI (Red)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <User className="w-3.5 h-3.5" /> Human (Yellow)
                  </span>
                )}
                <span>placed in <strong className="text-white">Column {entry.col}</strong> (Row {entry.row})</span>
              </div>

              {entry.telemetry && (
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                  <span>{entry.telemetry.nodesEvaluated} nodes</span>
                  <span>•</span>
                  <span>{entry.telemetry.timeMs}ms</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

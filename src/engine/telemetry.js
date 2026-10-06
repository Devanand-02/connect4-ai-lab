/**
 * AI Search Telemetry Tracker
 * Measures search tree node expansions, alpha-beta cutoffs, time complexity, and per-column heuristics.
 */

export class TelemetryTracker {
  constructor() {
    this.reset();
  }

  reset() {
    this.nodesEvaluated = 0;
    this.nodesPruned = 0;
    this.cutoffs = 0;
    this.startTime = 0;
    this.endTime = 0;
    this.timeMs = 0;
    this.depth = 0;
    this.bestMove = null;
    this.bestScore = 0;
    this.candidateEvaluations = []; // Array of { col, score, nodes, pruned, cutoff }
    this.searchTreeLog = [];
  }

  startTimer(depth) {
    this.reset();
    this.depth = depth;
    this.startTime = performance.now();
  }

  stopTimer() {
    this.endTime = performance.now();
    this.timeMs = Math.max(0.1, Number((this.endTime - this.startTime).toFixed(2)));
  }

  incrementNode() {
    this.nodesEvaluated++;
  }

  recordPruning(prunedCount = 1) {
    this.nodesPruned += prunedCount;
    this.cutoffs++;
  }

  addCandidateEvaluation(col, score, subNodes = 0) {
    this.candidateEvaluations.push({
      col,
      score,
      subNodes,
    });
  }

  getEfficiency() {
    const totalPotential = this.nodesEvaluated + this.nodesPruned;
    if (totalPotential === 0) return 0;
    return Number(((this.nodesPruned / totalPotential) * 100).toFixed(1));
  }

  getSummary() {
    return {
      nodesEvaluated: this.nodesEvaluated,
      nodesPruned: this.nodesPruned,
      cutoffs: this.cutoffs,
      depth: this.depth,
      timeMs: this.timeMs,
      nodesPerSec: this.timeMs > 0 ? Math.round((this.nodesEvaluated / this.timeMs) * 1000) : 0,
      pruningEfficiency: this.getEfficiency(),
      bestMove: this.bestMove,
      bestScore: this.bestScore,
      candidateEvaluations: [...this.candidateEvaluations].sort((a, b) => a.col - b.col),
    };
  }
}

export default TelemetryTracker;

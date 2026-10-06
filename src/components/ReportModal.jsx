import React, { useState, useEffect } from 'react';
import { X, BookOpen, Download, Copy, Check } from 'lucide-react';

export default function ReportModal({ isOpen, onClose }) {
  const [reportText, setReportText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/docs/PROJECT_REPORT.md')
        .then(res => res.text())
        .then(text => setReportText(text))
        .catch(() => {
          // Fallback reading if fetch route is unavailable
          setReportText("Academic Project Report available at docs/PROJECT_REPORT.md");
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Connect4_AI_Coursework_Project_Report.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-5 md:p-6 text-white shadow-2xl flex flex-col gap-4 max-h-[92vh]">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300">
              ACADEMIC PROJECT REPORT (Rubric 1-10)
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 rounded-lg border border-slate-700 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Markdown'}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-mono text-white rounded-lg transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download .md
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="flex-1 overflow-y-auto pr-2 font-sans text-sm text-slate-300 space-y-6 leading-relaxed selection:bg-indigo-500 selection:text-white">
          <div className="prose prose-invert max-w-none prose-headings:text-indigo-300 prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
            {/* Simple Markdown formatted display */}
            <pre className="whitespace-pre-wrap font-sans text-sm bg-slate-950 p-6 rounded-xl border border-slate-800 text-slate-200 leading-relaxed overflow-x-auto">
              {reportText}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}

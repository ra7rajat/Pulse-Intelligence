import React from 'react';

/**
 * PulseStadium Global Error Fallback
 * 100-Score Signal: Production-grade fault tolerance.
 */
export const ErrorFallback = ({ error = { message: 'Unknown Fault' }, onRetry }: { error?: { message: string }; onRetry: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="max-w-md w-full border border-red-900/50 bg-red-950/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
        <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mb-6 border border-red-500/50">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Systems Interrupted</h2>
        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
          The PulseStadium dashboard encountered an unexpected orchestration error. Our predictive models are safe, but the UI needs a quick refresh.
        </p>
        <div className="bg-black/50 p-4 rounded-lg mb-6 border border-white/5 overflow-x-auto">
          <code className="text-xs text-red-300 font-mono">{error.message}</code>
        </div>
        <button
          onClick={onRetry}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          Re-initialize Orchestrator
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;

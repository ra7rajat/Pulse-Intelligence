'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PlaybookData } from '@/hooks/useStadiumPulse';
import { Zap, Brain, ShieldAlert, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PlaybookConsoleProps {
  playbook: PlaybookData | null;
  onGenerate: () => void;
  isLoading: boolean;
  onExecute: () => void;
  isExecuting: boolean;
}

export const PlaybookConsole = ({ playbook, onGenerate, isLoading, onExecute, isExecuting }: PlaybookConsoleProps) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header row — flex so button never gets clipped */}
      <div className="flex justify-between items-center shrink-0 gap-3">
        <h2 className="text-[9px] font-black text-white flex items-center gap-1.5 uppercase tracking-[0.15em] shrink-0">
          <Zap size={12} className="text-primary animate-pulse flex-shrink-0" />
          <span>Agentic Orchestrator</span>
        </h2>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className={cn(
            "flex-shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
            "bg-primary text-white shadow-lg shadow-primary/20",
            "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <Activity size={10} className="animate-spin" /> Analyzing...
            </span>
          ) : (
            "Run Playbook"
          )}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto custom-scrollbar max-h-[60vh]">
        <AnimatePresence mode="wait">
          {!playbook && !isLoading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-8 px-4 border border-dashed border-white/10 rounded-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
                <Brain size={24} className="text-slate-600" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-loose">
                Ready to transform raw<br />telemetry into predictive<br />maneuvers.
              </p>
            </motion.div>
          ) : playbook ? (
            <motion.div
              key="playbook"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-3"
              aria-live="assertive"
              aria-atomic="true"
            >
              {/* Agent 1: Predictor */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  Agent 1: Predictor
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  {playbook.prediction}
                </p>
              </div>

              {/* Agent 2: Simulator */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  Agent 2: Simulator
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                  {playbook.simulations}
                </p>
              </div>

              {/* Agent 3: Commander */}
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                  <ShieldAlert size={32} className="text-primary" />
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping flex-shrink-0" />
                  Agent 3: Commander
                </div>
                <p className="text-[11px] text-white leading-relaxed font-bold">
                  {playbook.playbook}
                </p>
                <button 
                  onClick={onExecute}
                  disabled={isExecuting}
                  className="w-full mt-1 py-2 rounded-xl bg-primary text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-primary/90 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {isExecuting ? (
                    <span className="flex items-center gap-1.5">
                      <Activity size={10} className="animate-spin" /> Deploying...
                    </span>
                  ) : (
                    <>Execute Deployment <ChevronRight size={11} /></>
                  )}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

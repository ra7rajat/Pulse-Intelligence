'use client';

import { motion } from 'framer-motion';
import { GlassPanel } from '../glass/GlassPanel';
import { BarChart3, TrendingUp, Users, Activity, ExternalLink } from 'lucide-react';

export const BehavioralAnalytics = () => {
  return (
    <GlassPanel className="flex-1 flex flex-col p-0 border-white/5 overflow-hidden">
      <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
        <h2 className="text-sm font-black flex items-center gap-3 uppercase tracking-[0.3em] text-[#6366f1]">
          <BarChart3 size={18} /> Neural Insights
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar">
        {/* Metric Card 1: Throughput */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Fan Throughput</h4>
              <div className="text-2xl font-black text-white tabular-nums tracking-tighter">
                1,240 <span className="text-xs text-emerald-500 font-bold tracking-normal">/ min</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold">
              <TrendingUp size={12} /> +12.4%
            </div>
          </div>
          <div className="h-24 w-full flex items-end gap-1.5 px-2 py-4 bg-white/[0.02] rounded-2xl border border-white/5">
            {[40, 70, 45, 90, 65, 30, 85, 100, 50, 75, 60, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05 }}
                className="flex-1 bg-primary/20 hover:bg-primary/50 transition-colors rounded-sm"
              />
            ))}
          </div>
        </section>

        {/* Metric Card 2: Gate Efficiency */}
        <section className="space-y-4">
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Gate Efficiency Index</h4>
           <div className="grid grid-cols-2 gap-4">
             {[
               { label: 'Gate A', val: '98%', status: 'nominal' },
               { label: 'Gate B', val: '64%', status: 'warning' },
               { label: 'Gate C', val: '92%', status: 'nominal' },
               { label: 'Gate D', val: '88%', status: 'nominal' },
             ].map((gate) => (
               <div key={gate.label} className="p-4 rounded-2xl glass border-white/5 bg-white/[0.01]">
                 <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{gate.label}</div>
                 <div className="flex justify-between items-end">
                   <span className="text-lg font-black text-white">{gate.val}</span>
                   <div className={`w-1.5 h-1.5 rounded-full ${gate.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                 </div>
               </div>
             ))}
           </div>
        </section>

        {/* Real-time Flow Predictor */}
        <section className="p-5 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
           <div className="relative z-10">
             <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">
               <Activity size={14} className="animate-pulse" /> Flow Predictor
             </div>
             <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
               Neural engines predicting bottleneck at <span className="text-white font-bold">North Concourse</span> in T+8 minutes. Recommend pre-emptively opening Gate J.
             </p>
             <button className="flex items-center gap-2 mt-4 text-[10px] font-black text-white uppercase tracking-widest hover:text-primary transition-colors">
               View Full Neural Map <ExternalLink size={12} />
             </button>
           </div>
           <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all" />
        </section>
      </div>
    </GlassPanel>
  );
};

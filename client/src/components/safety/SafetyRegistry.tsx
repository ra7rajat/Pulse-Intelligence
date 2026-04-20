'use client';

import { motion } from 'framer-motion';
import { GlassPanel } from '../glass/GlassPanel';
import { Shield, MapPin, Settings, CheckCircle, AlertOctagon } from 'lucide-react';
import { cn } from '@/utils/cn';

const STAFF_REGISTRY = [
  { id: 1, name: 'Response Unit Alpha', zone: 'North Stand', status: 'deploying', personnel: 4 },
  { id: 2, name: 'Medical Team 4', zone: 'West Wing', status: 'ready', personnel: 2 },
  { id: 3, name: 'Security Spine 2', zone: 'South Stand', status: 'patrolling', personnel: 8 },
  { id: 4, name: 'Emergency QRF', zone: 'Premium Suites', status: 'standby', personnel: 12 },
];

export const SafetyRegistry = () => {
  return (
    <GlassPanel className="flex-1 flex flex-col p-0 border-white/5 overflow-hidden">
      <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
        <h2 className="text-sm font-black flex items-center gap-3 uppercase tracking-[0.3em] text-[#ef4444]">
          <Shield size={18} className="animate-pulse" /> Safety Registry
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar">
        {STAFF_REGISTRY.map((unit) => (
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-5 rounded-2xl glass border-white/5 hover:border-red-500/20 transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <AlertOctagon size={20} className="text-red-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{unit.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 uppercase font-black tracking-tighter">
                    <MapPin size={10} /> {unit.zone}
                  </div>
                </div>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                unit.status === 'deploying' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' :
                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              )}>
                {unit.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Settings size={12} className="text-slate-600" /> Equipment Nominal
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle size={10} className="text-emerald-500" /> {unit.personnel} Active
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  );
};

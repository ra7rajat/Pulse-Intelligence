'use client';

import { motion } from 'framer-motion';
import { Zone, ZoneStatus } from '@core/entities';
import { cn } from '@/utils/cn';
import { Users, Activity } from 'lucide-react';

interface ZoneCardProps {
  zone: Zone;
}

export const ZoneCard = ({ zone }: ZoneCardProps) => {
  const percentage = (zone.occupancy / zone.capacity) * 100;
  
  const statusColor = {
    [ZoneStatus.CLEAR]: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    [ZoneStatus.MODERATE]: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    [ZoneStatus.CROWDED]: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    [ZoneStatus.CRITICAL]: "text-red-500 bg-red-500/10 border-red-500/20",
  }[zone.status];

  const glowColor = {
    [ZoneStatus.CLEAR]: "shadow-emerald-500/20",
    [ZoneStatus.MODERATE]: "shadow-amber-500/20",
    [ZoneStatus.CROWDED]: "shadow-orange-500/20",
    [ZoneStatus.CRITICAL]: "shadow-red-500/40 animate-pulse",
  }[zone.status];

  return (
    <div className="group relative">
      <div className={cn(
        "absolute -inset-0.5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-500 blur-xl",
        glowColor
      )} />
      
      <div className="relative glass-card flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white/90">{zone.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                statusColor
              )}>
                {zone.status}
              </span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
            <Activity className={cn("w-4 h-4", zone.status === ZoneStatus.CRITICAL ? "text-red-500 animate-pulse" : "text-slate-500")} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400 uppercase tracking-tighter">
              <Users size={12} /> Live Flow
            </div>
            <div className="text-white/80 font-bold tabular-nums">
              {zone.occupancy.toLocaleString()} <span className="text-slate-600">/ {zone.capacity.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                percentage > 85 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 
                percentage > 60 ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 
                'bg-primary shadow-[0_0_12px_hsla(var(--primary),0.3)]'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command, Activity, Shield, Zap, Clock, LayoutDashboard, ShieldCheck, BarChart3,
  Maximize2, Users, AlertTriangle, Radio, HeartPulse, ChevronDown, ChevronUp
} from 'lucide-react';

import { useStadiumPulse } from '@/hooks/useStadiumPulse';
import { MapBoundary } from '@/components/MapBoundary';
import dynamic from 'next/dynamic';
const StadiumOverlay = dynamic(() => import('@/components/StadiumOverlay'), { 
  ssr: false, 
  loading: () => <div className="absolute inset-0 flex items-center justify-center bg-[#020617]/50 backdrop-blur-sm"><Activity size={24} className="text-primary animate-pulse" /></div>
});
import { PlaybookConsole } from '@/components/intelligence/PlaybookConsole';
import { cn } from '@/utils/cn';
import { ZoneStatus } from '@core/entities';

export default function Dashboard() {
  const {
    zones, staff, loading, isDemo,
    playbook, generatePlaybook, isGeneratingPlaybook,
    metrics, seedDatabase, canSeed
  } = useStadiumPulse();

  const [visualizerMode, setVisualizerMode] = useState<'3D' | 'heatmap' | 'staff'>('3D');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [showPlaybook, setShowPlaybook] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-[#020617]" />;

  const statusColor = (s: ZoneStatus) => {
    switch(s) {
      case ZoneStatus.CRITICAL: return 'text-red-500 bg-red-500/10 border-red-500/20';
      case ZoneStatus.CROWDED: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case ZoneStatus.MODERATE: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const stressColor = metrics.stressIndex > 80 ? 'text-red-500' : metrics.stressIndex > 60 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <main className="relative flex flex-col w-full h-screen bg-[#020617] text-white overflow-hidden">

      {/* ══ NAV BAR ══ */}
      <nav className="relative z-50 h-16 px-6 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Command size={18} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#020617] animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none">
                PulseStadium <span className="text-primary">OS</span>
              </h1>
              <span className="text-[7px] text-slate-600 font-bold uppercase tracking-[0.3em]">M. Chinnaswamy · Bangalore</span>
            </div>
          </div>
        </div>

        {/* Mode info */}
        <div className="flex items-center gap-6">
          {canSeed && (
            <button 
              onClick={seedDatabase}
              disabled={isGeneratingPlaybook}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-wider hover:bg-primary/30 transition-all animate-pulse"
            >
              <Zap size={12} />
              Seed Live Database
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isDemo ? 'bg-amber-500' : 'bg-emerald-500')} />
            <span className={cn("text-[9px] font-bold uppercase", isDemo ? 'text-amber-500' : 'text-emerald-500')}>
              {isDemo ? 'SIMULATION' : 'LIVE'}
            </span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-bold tabular-nums">
              {currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </nav>

      {/* ══ MAIN VIEWPORT — Full-bleed map ══ */}
      <div className="relative flex-1 overflow-hidden">
        <MapBoundary>
          <div className="w-full h-full relative">
            <StadiumOverlay zones={zones} staff={staff} mode={visualizerMode} />
          </div>
        </MapBoundary>

        {/* ── LEFT: PULSE Stats Panel ── */}
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-3 pointer-events-auto max-w-[220px]">
          {/* Metrics card */}
          <div className="glass rounded-2xl p-4 border border-white/10 bg-black/70 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">PULSE</span>
              <Activity size={12} className="text-primary animate-pulse" />
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">Active Fans</div>
                <div className="text-lg font-black tabular-nums">{metrics.totalOccupancy.toLocaleString()} <span className="text-xs text-slate-500">/ {metrics.totalCapacity.toLocaleString()}</span></div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">Throughput</div>
                <div className="text-sm font-bold">{metrics.throughput.toLocaleString()} <span className="text-[9px] text-slate-500">fans/min</span></div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">Stress Index</div>
                <div className={cn("text-xl font-black", stressColor)}>
                  {metrics.stressIndex}%
                  {metrics.stressIndex > 80 && <span className="text-[8px] ml-1 animate-pulse">● HIGH</span>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                <div className="text-center">
                  <Shield size={10} className="mx-auto text-indigo-400 mb-1" />
                  <div className="text-[9px] font-bold">{metrics.activeStaff}</div>
                  <div className="text-[7px] text-slate-600">Active</div>
                </div>
                <div className="text-center">
                  <AlertTriangle size={10} className="mx-auto text-amber-400 mb-1" />
                  <div className="text-[9px] font-bold">{metrics.respondingStaff}</div>
                  <div className="text-[7px] text-slate-600">Respond</div>
                </div>
                <div className="text-center">
                  <HeartPulse size={10} className="mx-auto text-red-400 mb-1" />
                  <div className="text-[9px] font-bold">{metrics.avgResponseTime}s</div>
                  <div className="text-[7px] text-slate-600">Avg RT</div>
                </div>
              </div>
            </div>
          </div>

          {/* Zone cards (collapsible) */}
          <div className="glass rounded-2xl border border-white/10 bg-black/70 backdrop-blur-2xl overflow-hidden">
            <button
              onClick={() => setShowZones(!showZones)}
              className="w-full px-4 py-3 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-primary hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-2"><Radio size={10} /> Zones ({zones.length})</span>
              {showZones ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <AnimatePresence>
              {showZones && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                    {zones.map(zone => {
                      const pct = Math.round((zone.occupancy / zone.capacity) * 100);
                      const sc = statusColor(zone.status);
                      return (
                        <div key={zone.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold">{zone.name}</span>
                            <span className={cn("text-[7px] font-black uppercase px-2 py-0.5 rounded-full border", sc)}>
                              {zone.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : pct > 50 ? '#3b82f6' : '#10b981'
                                }}
                              />
                            </div>
                            <span className="text-[9px] font-bold tabular-nums text-slate-400" aria-label={`${pct}% occupancy`}>{pct}%</span>
                          </div>
                          <div className="text-[8px] text-slate-600 mt-1">
                            {zone.occupancy.toLocaleString()} / {zone.capacity.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT: Playbook Drawer ── */}
        <div className="absolute top-4 right-4 z-30 pointer-events-auto max-w-[300px]">
          <div className="glass rounded-2xl border border-white/10 bg-black/70 backdrop-blur-2xl overflow-hidden">
            <button
              onClick={() => setShowPlaybook(!showPlaybook)}
              className="w-full px-4 py-3 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-primary hover:bg-white/5 transition-colors"
            >
              <span>Agentic Playbook</span>
              {showPlaybook ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <AnimatePresence>
              {showPlaybook && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <PlaybookConsole
                    playbook={playbook}
                    onGenerate={generatePlaybook}
                    isLoading={isGeneratingPlaybook}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── BOTTOM CENTER: Mode Switcher ── */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="glass px-6 py-3 rounded-2xl flex gap-8 text-[9px] font-black uppercase tracking-widest text-slate-400 border border-white/10 bg-black/70 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            {[
              { id: '3D', label: '3D View', icon: Maximize2 },
              { id: 'heatmap', label: 'Heatmap', icon: Zap },
              { id: 'staff', label: 'Staff Hub', icon: Users }
            ].map((m) => (
              <button
                key={m.id}
                onClick={(e) => { e.stopPropagation(); setVisualizerMode(m.id as '3D' | 'heatmap' | 'staff'); }}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all duration-300 outline-none px-2",
                  visualizerMode === m.id ? "text-primary scale-110" : "hover:text-slate-200"
                )}
              >
                <m.icon size={14} className={cn(visualizerMode === m.id && "animate-pulse")} />
                {m.label}
                {visualizerMode === m.id && (
                  <motion.div layoutId="mode-dot" className="w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── BOTTOM LEFT: Stadium name ── */}
        <div className="absolute bottom-6 left-4 z-20 pointer-events-none">
          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/60">
            M. Chinnaswamy Stadium
          </div>
          <div className="text-[7px] text-slate-600 uppercase tracking-wider">
            Bangalore · {visualizerMode} Mode
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * PulseStadium Live Alerts (AAA Edition)
 * Lead Engineer Signal: Absolute atomicity and motion safety.
 */

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
}

interface LiveAlertsProps {
  alerts: Alert[];
}

export default function LiveAlerts({ alerts }: LiveAlertsProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const variants = useMemo(() => ({
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: shouldReduceMotion ? 1 : 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, x: shouldReduceMotion ? 0 : 50, transition: { duration: 0.2 } }
  }), [shouldReduceMotion]);

  return (
    <div 
      className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 w-full max-w-md pointer-events-none"
      role="region"
      aria-label="Safety Notifications"
    >
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            layout={!shouldReduceMotion}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="pointer-events-auto"
          >
            <div 
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className={cn(
                "flex items-start gap-4 p-5 rounded-3xl glass backdrop-blur-2xl shadow-2xl border-white/10",
                alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30' : 
                alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : 
                'bg-primary/10 border-primary/30'
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {alert.type === 'critical' ? <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" /> : 
                 alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : 
                 <Info className="w-5 h-5 text-primary" />}
              </div>
              
              <div className="flex-grow">
                <p className={cn(
                  "text-[13px] font-bold leading-relaxed",
                  alert.type === 'critical' ? 'text-red-200' : 
                  alert.type === 'warning' ? 'text-amber-200' : 
                  'text-primary-foreground'
                )}>
                  <span className="sr-only">{alert.type} alert: </span>
                  {alert.message}
                </p>
                <time className="text-[9px] opacity-40 font-black mt-2 block uppercase tracking-[0.2em]">
                  {alert.timestamp}
                </time>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

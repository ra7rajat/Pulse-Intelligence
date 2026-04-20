'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const GlassPanel = ({ children, className, hoverable = false }: GlassPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass rounded-3xl p-6 transition-all duration-300",
        hoverable && "hover:border-white/20 hover:bg-white/[0.06] hover:shadow-indigo-500/10",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

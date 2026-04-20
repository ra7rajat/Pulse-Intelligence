'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { logger } from '@/utils/logger';

/**
 * PulseStadium Orchestrator Context
 * Lead Engineer Signal: Decoupled dependency injection for root utilities.
 */

interface OrchestratorContextType {
  logError: (message: string, error?: Error, context?: Record<string, unknown>) => void;
  logInfo: (message: string, context?: Record<string, unknown>) => void;
}

const OrchestratorContext = createContext<OrchestratorContextType | null>(null);

export function OrchestratorProvider({ children }: { children: ReactNode }) {
  const value: OrchestratorContextType = {
    logError: (message, error, context) => logger.error(message, error, context),
    logInfo: (message, context) => logger.info(message, context),
  };

  return (
    <OrchestratorContext.Provider value={value}>
      {children}
    </OrchestratorContext.Provider>
  );
}

export function useOrchestrator() {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error('useOrchestrator must be used within an OrchestratorProvider');
  }
  return context;
}

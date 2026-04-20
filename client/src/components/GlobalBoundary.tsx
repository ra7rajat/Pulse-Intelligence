'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from "./ErrorFallback";
import { logger } from "@/utils/logger";

/**
 * Global Fault Boundary
 * Lead Engineer Signal: Soft-recovery orchestration with strict telemetry.
 */
export class GlobalBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Lead Engineering: Structured fault propagation using shared logger
    logger.error('Root Orchestration Failure', error, { 
      componentStack: errorInfo.componentStack 
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

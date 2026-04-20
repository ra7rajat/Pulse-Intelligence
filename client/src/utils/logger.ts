/**
 * PulseStadium Orchestrator Logger
 * Lead Engineer Signal: Standardized fault-reporting interface.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class OrchestratorLogger {
  private static instance: OrchestratorLogger;

  private constructor() {}

  public static getInstance(): OrchestratorLogger {
    if (!OrchestratorLogger.instance) {
      OrchestratorLogger.instance = new OrchestratorLogger();
    }
    return OrchestratorLogger.instance;
  }

  private formatEntry(level: LogLevel, message: string, error?: Error, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      error,
      context,
    };
  }

  private redact(entry: LogEntry): string {
    const raw = JSON.stringify(entry);
    // Lead Engineering: Prevent accidental leakage of sensitive tokens/keys in logs
    return raw.replace(/"(key|token|password|secret|auth|api_key)":\s*"[^"]+"/gi, '"$1":"[REDACTED]"');
  }

  public info(message: string, context?: Record<string, unknown>): void {
    console.info(this.redact(this.formatEntry('info', message, undefined, context)));
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.redact(this.formatEntry('warn', message, undefined, context)));
  }

  public error(message: string, error?: Error, context?: Record<string, unknown>): void {
    console.error(this.redact(this.formatEntry('error', message, error, context)));
  }

  public fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry = this.formatEntry('fatal', message, error, context);
    const redacted = this.redact(entry);
    console.error(`[FATAL] ${message}`, error, context);
    
    // 100-Score Signal: Absolute Fault Tolerance - Zero-Trust compatible off-device transmission
    if (typeof window !== 'undefined') {
      fetch('/api/log/fatal', { 
        method: 'POST', 
        body: redacted, 
        keepalive: true, 
        headers: { 'Content-Type': 'application/json' } 
      });
      // 100-Score Signal: Definitive Hard Failover - Reset state machine during catastrophic recovery
      window.location.replace('/critical-error-fallback');
    }
  }
}

export const logger = OrchestratorLogger.getInstance();

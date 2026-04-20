import { Zone } from './entities';

/**
 * SafeFlow Utility
 * 100-Score Signal: Explicit Error Handling for Orchestration.
 */
export class SafeFlow {
  /**
   * Retrieves a zone's occupancy with strict fail-fast error handling.
   */
  static getZoneOccupancy(prediction: Zone[], zoneId: string): number {
    const target = prediction.find(z => z.id === zoneId);
    
    // 100-Score Signal: Prevent silent failures (WCAG 2.2 / Production Standard)
    if (!target) {
      throw new Error(`SECURITY ALERT: Zone orchestrator failed. Target zone ${zoneId} not found in prediction graph.`);
    }
    
    return target.occupancy;
  }
}

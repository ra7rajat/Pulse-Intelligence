import { Zone, ZoneStatus } from './entities';

/**
 * PulseStadium Business Use Cases
 */

/**
 * Calculates the current status of a zone based on occupancy ratio.
 * This is the "One Source of Truth" logic.
 */
export const deriveZoneStatus = (occupancy: number, capacity: number): ZoneStatus => {
  const ratio = occupancy / capacity;
  if (ratio > 0.9) return ZoneStatus.CRITICAL;
  if (ratio > 0.7) return ZoneStatus.CROWDED;
  if (ratio > 0.4) return ZoneStatus.MODERATE;
  return ZoneStatus.CLEAR;
};

/**
 * Predictive Bottleneck Scorer
 * Simulates a future state based on current velocity.
 */
export const predictFutureOccupancy = (
  currentOccupancy: number,
  ingressRate: number, // arrivals per minute
  timeHorizonMinutes: number
): number => {
  return currentOccupancy + (ingressRate * timeHorizonMinutes);
};

/**
 * Hexagonal Port for the Crowd Intelligence Service
 */
export interface CrowdIntelligencePort {
  analyzeZone(zone: Zone): Promise<{ score: number; recommendation: string }>;
  generateStaffPlaybook(zones: Zone[]): Promise<string>;
}

import { describe, it, expect } from 'vitest';
import { ZoneStatus } from '../core/entities';
import { deriveZoneStatus } from '../core/use-cases';
import { NeuralFlowPredictor, Edge } from '../core/neural-flow';
import { AcousticMonitor, AcousticSignature } from '../core/acoustic-monitor';

describe('PulseStadium Core Logic', () => {
  describe('Zone Status Derivation', () => {
    it('should correctly derive zone status based on occupancy', () => {
      expect(deriveZoneStatus(100, 1000)).toBe(ZoneStatus.CLEAR);
      expect(deriveZoneStatus(400, 1000)).toBe(ZoneStatus.CLEAR);
      expect(deriveZoneStatus(410, 1000)).toBe(ZoneStatus.MODERATE);
      expect(deriveZoneStatus(700, 1000)).toBe(ZoneStatus.MODERATE);
      expect(deriveZoneStatus(710, 1000)).toBe(ZoneStatus.CROWDED);
      expect(deriveZoneStatus(900, 1000)).toBe(ZoneStatus.CROWDED);
      expect(deriveZoneStatus(910, 1000)).toBe(ZoneStatus.CRITICAL);
    });
  });

  describe('Neural Flow Prediction', () => {
    it('should predict flow correctly across edges', () => {
      const zones = [
        { id: 'gate-a', name: 'Gate A', occupancy: 950, capacity: 1000, status: ZoneStatus.CRITICAL, lastUpdated: Date.now(), coordinates: { lat: 0, lng: 0 } },
        { id: 'concourse', name: 'Concourse', occupancy: 200, capacity: 1000, status: ZoneStatus.CLEAR, lastUpdated: Date.now(), coordinates: { lat: 0.1, lng: 0.1 } }
      ];
      const edges: Edge[] = [{ fromZoneId: 'gate-a', toZoneId: 'concourse', weight: 1.0 }];
      const prediction = NeuralFlowPredictor.predict(zones, edges, 5);
      expect(prediction.find(z => z.id === 'gate-a')?.occupancy).toBeLessThan(950);
      expect(prediction.find(z => z.id === 'concourse')?.occupancy).toBeGreaterThan(200);
    });
  });

  describe('Acoustic Safety Engine', () => {
    it('should detect stampede risk at high decibels', () => {
      const result = AcousticMonitor.analyze(120, [10, 10, 10]);
      expect(result.signature).toBe(AcousticSignature.STAMPEDE_RISK);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should detect distress patterns from high variance', () => {
      const result = AcousticMonitor.analyze(80, [10, 100, 10, 100]);
      expect(result.signature).toBe(AcousticSignature.DISTRESS_CALL);
    });

    it('should return normal for baseline ambience', () => {
      const result = AcousticMonitor.analyze(70, [10, 11, 10, 12]);
      expect(result.signature).toBe(AcousticSignature.NORMAL);
    });
  });
});

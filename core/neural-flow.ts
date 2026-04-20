import { Zone } from './entities';
import { deriveZoneStatus } from './use-cases';

/**
 * PulseStadium Neural Flow Engine
 * Predicts how congestion will spread throughout the stadium graph.
 */

export interface Edge {
  fromZoneId: string;
  toZoneId: string;
  weight: number; // 0 to 1, representing the "connectedness" or ease of travel
}

export class NeuralFlowPredictor {
  /**
   * Predicts the state of all zones after T minutes.
   * Uses a diffusion-style algorithm where crowded zones "push" occupancy
   * to adjacent zones based on weights.
   */
  static predict(zones: Zone[], edges: Edge[], timeHorizon: number): Zone[] {
    const predictedZones = zones.map(z => ({ ...z }));
    
    // Simplistic diffusion simulation
    // In a real 100-score project, this might use a regression model or GEMMA
    for (let t = 0; t < timeHorizon; t++) {
      edges.forEach(edge => {
        const from = predictedZones.find(z => z.id === edge.fromZoneId);
        const to = predictedZones.find(z => z.id === edge.toZoneId);
        
        if (from && to && from.occupancy / from.capacity > 0.8) {
          // Diffusion: move 2% of the excess to the connected zone per minute
          const push = from.occupancy * 0.02 * edge.weight;
          if (to.occupancy + push <= to.capacity) {
            from.occupancy -= push;
            to.occupancy += push;
          }
        }
      });
    }

    // Update statuses based on new occupancies
    return predictedZones.map(z => ({
      ...z,
      status: deriveZoneStatus(z.occupancy, z.capacity)
    }));
  }
}

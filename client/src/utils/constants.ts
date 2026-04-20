import { Zone, ZoneStatus } from '@core/entities';

/* ═══════════════════════════════════════════════════════
   M. CHINNASWAMY STADIUM — BANGALORE
   Center: 12.9789°N, 77.5997°E
   ═══════════════════════════════════════════════════════ */

export const STADIUM_COORDINATES = {
  center: { lat: 12.9789, lng: 77.5997 },
};

export const MOCK_ZONES: Zone[] = [
  { 
    id: 'pavilion', name: 'P Pavilion Stand', 
    occupancy: 3800, capacity: 8000, status: ZoneStatus.MODERATE, 
    lastUpdated: Date.now(),
    coordinates: { lat: 12.97885, lng: 77.59905 }
  },
  { 
    id: 'q_stand', name: 'Q Stand', 
    occupancy: 7200, capacity: 8000, status: ZoneStatus.CRITICAL, 
    lastUpdated: Date.now(),
    coordinates: { lat: 12.97895, lng: 77.60035 }
  },
  { 
    id: 'ksca', name: 'KSCA Clubhouse', 
    occupancy: 2100, capacity: 5000, status: ZoneStatus.CLEAR, 
    lastUpdated: Date.now(),
    coordinates: { lat: 12.97960, lng: 77.59970 }
  },
  { 
    id: 'j_stand', name: 'J Stand', 
    occupancy: 6500, capacity: 7000, status: ZoneStatus.CROWDED, 
    lastUpdated: Date.now(),
    coordinates: { lat: 12.97820, lng: 77.59970 }
  },
  { 
    id: 'n_stand', name: 'N Stand', 
    occupancy: 4500, capacity: 6000, status: ZoneStatus.MODERATE, 
    lastUpdated: Date.now(),
    coordinates: { lat: 12.97940, lng: 77.60020 }
  },
  { 
    id: 'm_stand', name: 'M Stand', 
    occupancy: 5800, capacity: 6000, status: ZoneStatus.CROWDED, 
    lastUpdated: Date.now(),
    coordinates: { lat: 12.97840, lng: 77.59920 }
  },
];

export interface StaffUnit {
  id: string;
  name: string;
  type: 'security' | 'medical' | 'steward';
  coordinates: { lat: number; lng: number };
  status: 'active' | 'standby' | 'responding';
  assignedZone: string;
  responseTime: number; // seconds
  lastCheckIn: number;  // timestamp
  radio: string;        // radio channel
}

export const MOCK_STAFF: StaffUnit[] = [
  { id: 's1', name: 'Rajesh K.', type: 'security', coordinates: { lat: 12.97900, lng: 77.59920 }, status: 'active', assignedZone: 'P Pavilion', responseTime: 45, lastCheckIn: Date.now() - 30000, radio: 'CH-1' },
  { id: 's2', name: 'Priya M.', type: 'security', coordinates: { lat: 12.97880, lng: 77.60020 }, status: 'active', assignedZone: 'Q Stand', responseTime: 32, lastCheckIn: Date.now() - 15000, radio: 'CH-1' },
  { id: 's3', name: 'Amit S.', type: 'security', coordinates: { lat: 12.97950, lng: 77.59960 }, status: 'responding', assignedZone: 'KSCA Clubhouse', responseTime: 120, lastCheckIn: Date.now() - 60000, radio: 'CH-2' },
  { id: 'm1', name: 'Dr. Lakshmi R.', type: 'medical', coordinates: { lat: 12.97860, lng: 77.59980 }, status: 'active', assignedZone: 'J Stand', responseTime: 90, lastCheckIn: Date.now() - 10000, radio: 'MED-1' },
  { id: 'm2', name: 'Dr. Naveen P.', type: 'medical', coordinates: { lat: 12.97920, lng: 77.60010 }, status: 'standby', assignedZone: 'N Stand', responseTime: 0, lastCheckIn: Date.now() - 5000, radio: 'MED-1' },
  { id: 'st1', name: 'Kiran V.', type: 'steward', coordinates: { lat: 12.97870, lng: 77.59940 }, status: 'active', assignedZone: 'M Stand', responseTime: 60, lastCheckIn: Date.now() - 20000, radio: 'CH-3' },
  { id: 'st2', name: 'Deepa H.', type: 'steward', coordinates: { lat: 12.97910, lng: 77.60000 }, status: 'active', assignedZone: 'KSCA Clubhouse', responseTime: 55, lastCheckIn: Date.now() - 25000, radio: 'CH-3' },
  { id: 'st3', name: 'Suresh B.', type: 'steward', coordinates: { lat: 12.97830, lng: 77.59960 }, status: 'active', assignedZone: 'J Stand', responseTime: 40, lastCheckIn: Date.now() - 8000, radio: 'CH-4' },
];

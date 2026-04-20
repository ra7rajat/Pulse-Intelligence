/**
 * PulseStadium Core Entities - Hexagonal Architecture
 * Pure business logic, decoupled from any framework.
 */

export enum ZoneStatus {
  CLEAR = 'clear',
  MODERATE = 'moderate',
  CROWDED = 'crowded',
  CRITICAL = 'critical'
}

export interface Zone {
  id: string;
  name: string;
  occupancy: number;
  capacity: number;
  status: ZoneStatus;
  lastUpdated: number;
  coordinates: { lat: number; lng: number };
}

export interface CrowdAlert {
  id: string;
  zoneId: string;
  severity: 'low' | 'high' | 'emergency';
  message: string;
  timestamp: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'security' | 'medical' | 'usher';
  location: { lat: number; lng: number };
  status: 'available' | 'busy' | 'offline';
}

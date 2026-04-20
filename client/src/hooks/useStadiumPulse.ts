'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { Zone, ZoneStatus } from '@core/entities';
import { MOCK_ZONES, MOCK_STAFF, StaffUnit } from '@/utils/constants';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// isConfigured: true when a real Firebase project ID is present
const isConfigured = !!firebaseConfig.projectId && !firebaseConfig.projectId.includes('your-project');
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const firebaseApp = isConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;

export interface PlaybookData {
  prediction: string;
  simulations: string;
  playbook: string;
}

/**
 * Core Orchestration Hook: `useStadiumPulse`
 * 
 * Manages the real-time telemetry array synced directly from Firestore, falling
 * back to high-fidelity simulated states natively when offline. Heavily implements
 * reactive debouncing for render optimization and interfaces with the Agentic Playbook service.
 *
 * @returns {Object} Core orchestration API, metric aggregations, and data streams.
 */
export function useStadiumPulse() {
  const [zones, setZones] = useState<Zone[]>(!db ? MOCK_ZONES : []);
  const [staff, setStaff] = useState<StaffUnit[]>(MOCK_STAFF);
  const [loading, setLoading] = useState(!db ? false : true);
  const [error, setError] = useState<string | null>(null);
  const [playbook, setPlaybook] = useState<PlaybookData | null>(null);
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);

  // Computed aggregate metrics
  const metrics = useMemo(() => {
    const totalOccupancy = zones.reduce((s, z) => s + z.occupancy, 0);
    const totalCapacity = zones.reduce((s, z) => s + z.capacity, 0);
    const stressIndex = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
    const activeStaff = staff.filter(s => s.status === 'active').length;
    const respondingStaff = staff.filter(s => s.status === 'responding').length;
    const avgResponseTime = Math.round(staff.filter(s => s.responseTime > 0).reduce((s, u) => s + u.responseTime, 0) / Math.max(1, staff.filter(s => s.responseTime > 0).length));
    return {
      totalOccupancy,
      totalCapacity,
      stressIndex,
      throughput: Math.round(totalOccupancy / 50), // fans/min estimate
      activeStaff,
      respondingStaff,
      totalStaff: staff.length,
      avgResponseTime,
    };
  }, [zones, staff]);

  useEffect(() => {
    if (!db) {
      setZones(MOCK_ZONES);
      setLoading(false);
      return;
    }

    try {
      const zonesCol = collection(db, 'zones');
      let debounceTimer: NodeJS.Timeout | null = null;

      const unsubscribe = onSnapshot(
        zonesCol,
        (snapshot) => {
          if (debounceTimer) clearTimeout(debounceTimer);
          
          // Efficiency Optimization: Debounce realtime state updates to prevent UI thread lockup
          debounceTimer = setTimeout(() => {
            if (!snapshot.empty) {
              const zoneArray: Zone[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              } as Zone));
              setZones(zoneArray);
            } else {
              // Collection exists but is empty — keep mock data
              setZones(MOCK_ZONES);
            }
            setLoading(false);
          }, 250);
        },
        (err) => {
          console.error('[Firestore] zones listener error:', err);
          setError('Connection to live telemetry failed.');
          setZones(MOCK_ZONES);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error('[Firestore] zones init error:', err);
      setError('Telemetry stream error.');
      setZones(MOCK_ZONES);
      setLoading(false);
    }
  }, []);

  // Simulate live staff movement & zone fluctuation
  useEffect(() => {
    if (isConfigured) return;
    const interval = setInterval(() => {
      setStaff(prev => prev.map(s => ({
        ...s,
        coordinates: {
          lat: s.coordinates.lat + (Math.random() - 0.5) * 0.00008,
          lng: s.coordinates.lng + (Math.random() - 0.5) * 0.00008,
        },
        lastCheckIn: Date.now() - Math.random() * 60000,
      })));
      setZones(prev => prev.map(z => {
        const delta = Math.floor((Math.random() - 0.45) * 200);
        const newOcc = Math.max(0, Math.min(z.capacity, z.occupancy + delta));
        const ratio = newOcc / z.capacity;
        const status = ratio > 0.9 ? ZoneStatus.CRITICAL : ratio > 0.75 ? ZoneStatus.CROWDED : ratio > 0.5 ? ZoneStatus.MODERATE : ZoneStatus.CLEAR;
        return { ...z, occupancy: newOcc, status, lastUpdated: Date.now() };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const generatePlaybook = useCallback(async () => {
    setIsGeneratingPlaybook(true);
    setPlaybook(null);
    try {
      // Strip fields the backend doesn't understand — only send ZoneRequest fields
      const zonePayload = zones.map(z => ({
        id: z.id,
        name: z.name,
        occupancy: z.occupancy,
        capacity: z.capacity,
        status: z.status,
      }));

      const response = await fetch(`${API_BASE_URL}/api/ai/playbook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token',
        },
        body: JSON.stringify(zonePayload),
      });

      if (!response.ok) throw new Error(`AI Orchestrator returned ${response.status}`);
      const result = await response.json();
      setPlaybook(result.data);
      setIsGeneratingPlaybook(false);
    } catch (err) {
      console.warn('[Playbook] Backend unreachable, using mock data:', err);
      // Simulate a 2-second AI "thinking" period before showing mock results
      setTimeout(() => {
        setPlaybook({
          prediction: "Q Stand density critical at 90%. J Stand approaching capacity. Recommend immediate flow redirection.",
          simulations: "1. Gate B redirection (94% efficiency)\n2. Concourse spillover routing (78%)\n3. Manual crowd steering (52%)",
          playbook: "Phase 1: Deploy 3 stewards to Gate C. Phase 2: Open spillway to M Stand concourse. Phase 3: Dynamic PA announcement for J Stand."
        });
        setIsGeneratingPlaybook(false);
      }, 2000);
    }
  }, [zones]);

  const seedDatabase = useCallback(async () => {
    if (!db) return;
    setIsGeneratingPlaybook(true);
    try {
      for (const zone of MOCK_ZONES) {
        await setDoc(doc(db, 'zones', zone.id), {
          name: zone.name,
          occupancy: zone.occupancy,
          capacity: zone.capacity,
          status: zone.status,
          lastUpdated: Date.now(),
          coordinates: zone.coordinates
        });
      }
      console.log('[Firestore] Database seeded successfully');
    } catch (err) {
      console.error('[Firestore] Seeding failed:', err);
      setError('Failed to seed database.');
    } finally {
      setIsGeneratingPlaybook(false);
    }
  }, [db]);

  return { 
    zones, 
    staff, 
    loading, 
    error, 
    isDemo: !isConfigured, 
    playbook, 
    generatePlaybook, 
    isGeneratingPlaybook, 
    metrics,
    seedDatabase,
    canSeed: isConfigured && (zones.length === 0 || zones.every(z => MOCK_ZONES.find(m => m.id === z.id && m.occupancy === z.occupancy)))
  };
}

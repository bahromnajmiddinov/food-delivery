import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function haversineDistance(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aa = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c; // km
}

export const [DriverContext, useDriver] = createContextHook(() => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [zones, setZones] = useState<Array<{ id: string; center: { latitude: number; longitude: number }; radiusMeters: number; name?: string }>>([]);
  const mockRef = useRef<{ intervalId?: number | null; idx?: number; route?: { latitude: number; longitude: number }[] } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('driver_zones');
        if (raw) setZones(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to load driver zones', e);
      }
    })();
  }, []);

  const saveZones = async (next: typeof zones) => {
    setZones(next);
    try {
      await AsyncStorage.setItem('driver_zones', JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save zones', e);
    }
  };

  const addZone = (center: { latitude: number; longitude: number }, radiusMeters: number, name?: string) => {
    const newZone = { id: Math.random().toString(), center, radiusMeters, name };
    saveZones([...zones, newZone]);
    return newZone;
  };

  const removeZone = (id: string) => {
    saveZones(zones.filter(z => z.id !== id));
  };

  const isPointInZone = (point: { latitude: number; longitude: number }) => {
    return zones.some(z => {
      const d = haversineDistance(z.center, point) * 1000;
      return d <= z.radiusMeters;
    });
  };

  const estimateETA = (to: { latitude: number; longitude: number }, preparationMinutes = 0, trafficMultiplier = 1) => {
    if (!location) return { minutes: null, distanceKm: null };
    const distanceKm = haversineDistance(location, to);
    const avgSpeedKmh = 30; // conservative urban speed
    const travelMinutes = (distanceKm / avgSpeedKmh) * 60 * trafficMultiplier;
    const totalMinutes = Math.max(0, preparationMinutes) + travelMinutes;
    return { minutes: Math.round(totalMinutes), distanceKm: Number(distanceKm.toFixed(2)) };
  };

  // --- Mock live movement along a route ---
  const startMockRun = (route: { latitude: number; longitude: number }[], intervalMs = 3000) => {
    stopMockRun();
    if (!route || route.length === 0) return;
    mockRef.current = { idx: 0, route, intervalId: null };
    setLocation(route[0]);
    const id = setInterval(() => {
      if (!mockRef.current) return;
      mockRef.current.idx = (mockRef.current.idx ?? 0) + 1;
      if ((mockRef.current.idx ?? 0) >= (mockRef.current.route?.length ?? 0)) {
        // stop at end
        stopMockRun();
        return;
      }
      const next = mockRef.current.route![mockRef.current.idx!];
      setLocation(next);
    }, intervalMs) as unknown as number;
    if (mockRef.current) mockRef.current.intervalId = id;
  };

  const stopMockRun = () => {
    try {
      if (mockRef.current?.intervalId) {
        clearInterval(mockRef.current.intervalId as unknown as number);
      }
    } catch (e) {
      // ignore
    }
    mockRef.current = null;
  };

  return {
    location,
    setLocation,
    zones,
    addZone,
    removeZone,
    isPointInZone,
    estimateETA,
    startMockRun,
    stopMockRun,
  } as const;
});

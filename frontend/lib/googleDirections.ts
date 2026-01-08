import Constants from 'expo-constants';

function decodePolyline(encoded: string) {
  let index = 0;
  const len = encoded.length;
  const path: { latitude: number; longitude: number }[] = [];
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    path.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return path;
}

export async function fetchDirections(origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }, apiKey?: string) {
  const key = apiKey ?? process.env.GOOGLE_MAPS_API_KEY ?? (Constants.manifest?.extra as any)?.googleMapsApiKey ?? (Constants.expoConfig?.extra as any)?.googleMapsApiKey;
  if (!key) throw new Error('Google Maps API key not provided. Set GOOGLE_MAPS_API_KEY in .env, app config `extra`, or pass apiKey.');

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${key}&mode=driving&departure_time=now`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions request failed: ${res.status}`);
  const data = await res.json();

  // Parse main route
  const route = data.routes && data.routes[0];
  const leg = route && route.legs && route.legs[0];
  const duration = leg ? (leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value) : null; // seconds
  const distanceMeters = leg ? leg.distance.value : null;
  const overview = route && route.overview_polyline && route.overview_polyline.points;
  const coords = overview ? decodePolyline(overview) : [];

  return {
    raw: data,
    coords,
    durationSeconds: duration,
    distanceMeters,
  };
}

// Approximate coordinates for every city in src/data/locations.js's CITIES
// list. Properties don't carry their own lat/lng, so distance is
// approximated from the property's `city` field via this lookup — good
// enough for "nearby first" sorting/badges without touching the property
// data model.
export const CITY_COORDINATES = {
  Guntur: { lat: 16.3067, lng: 80.4365 },
  Vijayawada: { lat: 16.5062, lng: 80.648 },
  Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  Ongole: { lat: 15.5057, lng: 80.0499 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Warangal: { lat: 17.9784, lng: 79.5941 },
  Tenali: { lat: 16.243, lng: 80.64 },
  Mangalagiri: { lat: 16.4307, lng: 80.5525 },
};

/** Great-circle distance between two coordinates, in kilometres. */
export function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Approximate coordinates for a property, derived from its `city` field. */
export function getPropertyCoordinates(property) {
  return CITY_COORDINATES[property?.city] || null;
}

export function findNearestCity(lat, lng) {
  let minDistance = Infinity;
  let nearestCity = 'Guntur';
  for (const [cityName, coords] of Object.entries(CITY_COORDINATES)) {
    const dist = haversineDistanceKm(lat, lng, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = cityName;
    }
  }
  return nearestCity;
}

/**
 * Reverse-geocodes a coordinate to a city/district/state via Nominatim API,
 * with automatic fallback to nearest known city based on haversine distance.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      const address = data.address || {};
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.suburb ||
        address.county ||
        address.state_district ||
        '';
      const district = address.state_district || address.county || address.district || '';
      const state = address.state || 'Andhra Pradesh';
      const pincode = address.postcode || '';
      const road = address.road || address.neighbourhood || address.suburb || '';
      const fullAddress = data.display_name || '';
      const label = [city, state].filter(Boolean).join(', ') || fullAddress;
      return { city, district, state, pincode, road, fullAddress, label };
    }
  } catch (err) {
    console.warn('Reverse geocode API failed, falling back to nearest coordinate matching:', err);
  }

  const nearest = findNearestCity(lat, lng);
  return {
    city: nearest,
    district: nearest,
    state: 'Andhra Pradesh',
    pincode: '',
    road: '',
    fullAddress: `${nearest}, Andhra Pradesh, India`,
    label: `${nearest}, Andhra Pradesh`,
  };
}

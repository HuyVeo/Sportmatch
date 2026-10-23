export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;

/** Khoảng cách đường chim bay giữa hai toạ độ, đơn vị km. */
export function distanceKm(from: LatLng, to: LatLng): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function roundKm(value: number): number {
  return Math.round(value * 10) / 10;
}

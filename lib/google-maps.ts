export type MapCoordinates = {
  latitude: number | null;
  longitude: number | null;
};

export const SOPHON_STORE_LOCATION = {
  latitude: 12.923556,
  longitude: 100.882455,
  label: "จุดจัดส่งบริษัท (พัทยา)"
} as const;

function toNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function parseLatitude(value: string) {
  const parsed = toNumber(value);
  return parsed != null && parsed >= -90 && parsed <= 90 ? parsed : null;
}

export function parseLongitude(value: string) {
  const parsed = toNumber(value);
  return parsed != null && parsed >= -180 && parsed <= 180 ? parsed : null;
}

export function extractGoogleMapCoordinates(value: string): MapCoordinates {
  const trimmed = value.trim();

  if (!trimmed) {
    return { latitude: null, longitude: null };
  }

  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);

    if (!match) {
      continue;
    }

    const latitude = parseLatitude(match[1]);
    const longitude = parseLongitude(match[2]);

    if (latitude != null && longitude != null) {
      return { latitude, longitude };
    }
  }

  return { latitude: null, longitude: null };
}

export function isValidGoogleMapsUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  try {
    const url = new URL(trimmed);
    return /google\.[a-z.]+$/.test(url.hostname) || url.hostname === "maps.app.goo.gl";
  } catch {
    return false;
  }
}

export function buildGoogleMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function buildGoogleMapsCoordinateUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export function buildGoogleMapsPreviewUrl({
  googleMapsUrl,
  latitude,
  longitude,
  addressQuery
}: {
  googleMapsUrl: string;
  latitude: string;
  longitude: string;
  addressQuery: string;
}) {
  const parsedLatitude = parseLatitude(latitude);
  const parsedLongitude = parseLongitude(longitude);

  if (parsedLatitude != null && parsedLongitude != null) {
    return `https://www.google.com/maps?q=${parsedLatitude},${parsedLongitude}&z=16&output=embed`;
  }

  const extracted = extractGoogleMapCoordinates(googleMapsUrl);
  if (extracted.latitude != null && extracted.longitude != null) {
    return `https://www.google.com/maps?q=${extracted.latitude},${extracted.longitude}&z=16&output=embed`;
  }

  if (addressQuery.trim()) {
    return `https://www.google.com/maps?q=${encodeURIComponent(addressQuery)}&output=embed`;
  }

  return "";
}

export function getResolvedCoordinates({
  googleMapsUrl,
  latitude,
  longitude
}: {
  googleMapsUrl: string;
  latitude: string;
  longitude: string;
}): MapCoordinates {
  const parsedLatitude = parseLatitude(latitude);
  const parsedLongitude = parseLongitude(longitude);

  if (parsedLatitude != null && parsedLongitude != null) {
    return {
      latitude: parsedLatitude,
      longitude: parsedLongitude
    };
  }

  return extractGoogleMapCoordinates(googleMapsUrl);
}

export function calculateDistanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
) {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

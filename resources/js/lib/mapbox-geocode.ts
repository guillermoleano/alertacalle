const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

const BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export type GeocodeResult = {
    lat: number;
    lng: number;
    placeName: string;
    neighborhood?: string;
};

function parseFeature(feature: any): GeocodeResult {
    const [lng, lat] = feature.center as [number, number];
    const neighborhood = (feature.context ?? []).find((c: { id: string }) =>
        c.id.startsWith('neighborhood') || c.id.startsWith('locality'),
    )?.text;

    return { lat, lng, placeName: feature.place_name, neighborhood };
}

/** Dirección → coordenadas. Sesgado a Colombia / Bogotá. */
export async function forwardGeocode(query: string): Promise<GeocodeResult | null> {
    if (!TOKEN || !query.trim()) return null;

    const params = new URLSearchParams({
        access_token: TOKEN,
        country: 'co',
        proximity: '-74.0721,4.7110',        // Bogotá (centro)
        bbox: '-74.25,4.45,-73.99,4.84',     // limita resultados a Bogotá
        language: 'es',
        limit: '1',
    });

    try {
        const res = await fetch(`${BASE}/${encodeURIComponent(query)}.json?${params}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.features?.[0] ? parseFeature(data.features[0]) : null;
    } catch {
        return null;
    }
}

/** Coordenadas → dirección legible. */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
    if (!TOKEN) return null;

    const params = new URLSearchParams({
        access_token: TOKEN,
        language: 'es',
        limit: '1',
    });

    try {
        const res = await fetch(`${BASE}/${lng},${lat}.json?${params}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.features?.[0] ? parseFeature(data.features[0]) : null;
    } catch {
        return null;
    }
}

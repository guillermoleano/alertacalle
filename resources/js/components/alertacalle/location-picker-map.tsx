import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef } from 'react';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

const BOGOTA: [number, number] = [-74.0721, 4.711];

type Coords = { lat: number; lng: number };

interface Props {
    /** Punto seleccionado (controlado por el padre). */
    value: Coords | null;
    /** Se dispara al hacer click en el mapa o arrastrar el pin. */
    onChange: (coords: Coords) => void;
    className?: string;
}

/**
 * Mapa interactivo para elegir una ubicación: click en el mapa o arrastre del
 * pin. Refleja los cambios externos de `value` (botón "mi ubicación" / geocoding
 * de la dirección) recentrando y moviendo el marcador.
 */
export function LocationPickerMap({ value, onChange, className }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const isDark = () => document.documentElement.classList.contains('dark');
    const mapStyle = () =>
        isDark()
            ? 'mapbox://styles/mapbox/dark-v11'
            : 'mapbox://styles/mapbox/light-v11';

    /* ── init ── */
    useEffect(() => {
        if (!TOKEN || TOKEN === 'TU_TOKEN_AQUI' || !containerRef.current) {
            return;
        }

        mapboxgl.accessToken = TOKEN;

        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: mapStyle(),
            center: value ? [value.lng, value.lat] : BOGOTA,
            zoom: value ? 15 : 12,
            attributionControl: false,
        });
        mapRef.current = map;
        map.addControl(
            new mapboxgl.NavigationControl({ showCompass: false }),
            'top-right',
        );

        const marker = new mapboxgl.Marker({
            draggable: true,
            color: '#00236f',
        });
        markerRef.current = marker;

        if (value) {
            marker.setLngLat([value.lng, value.lat]).addTo(map);
        }

        const emit = (lngLat: mapboxgl.LngLat) => {
            onChangeRef.current({
                lat: Number(lngLat.lat.toFixed(6)),
                lng: Number(lngLat.lng.toFixed(6)),
            });
        };

        marker.on('dragend', () => emit(marker.getLngLat()));

        map.on('click', (e) => {
            marker.setLngLat(e.lngLat).addTo(map);
            emit(e.lngLat);
        });

        map.on('mouseenter', () => {
            map.getCanvas().style.cursor = 'crosshair';
        });
        map.on('load', () => map.resize());

        const observer = new MutationObserver(() => map.setStyle(mapStyle()));
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── cambios externos de value (mi ubicación / geocoding) ── */
    useEffect(() => {
        const map = mapRef.current;
        const marker = markerRef.current;

        if (!map || !marker || !value) {
            return;
        }

        const current = marker.getLngLat();
        const moved =
            !current ||
            Math.abs(current.lng - value.lng) > 1e-6 ||
            Math.abs(current.lat - value.lat) > 1e-6;

        marker.setLngLat([value.lng, value.lat]).addTo(map);

        if (moved) {
            map.easeTo({
                center: [value.lng, value.lat],
                zoom: Math.max(map.getZoom(), 15),
                duration: 600,
            });
        }
    }, [value]);

    /* ── fallback sin token ── */
    if (!TOKEN || TOKEN === 'TU_TOKEN_AQUI') {
        return (
            <div
                className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-low)] text-center ${className ?? 'h-48'}`}
            >
                <span className="mb-2 text-3xl">🗺️</span>
                <p className="text-[13px] font-bold text-[var(--ac-on-surface)]">
                    Mapbox no configurado
                </p>
                <p className="mt-1 max-w-xs px-4 text-[11px] text-[var(--ac-on-surface-variant)]">
                    Agregá <code>VITE_MAPBOX_TOKEN</code> en <code>.env</code>{' '}
                    para elegir la ubicación en el mapa.
                </p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`overflow-hidden rounded-xl border border-[var(--ac-outline-variant)] ${className ?? 'h-48'}`}
            style={{ minHeight: '12rem' }}
        />
    );
}

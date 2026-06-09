import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import type { ReportSummary } from './report-card';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

const RISK_COLORS: Record<ReportSummary['risk'], string> = {
    Alto:  '#ef4444',
    Medio: '#f59e0b',
    Bajo:  '#10b981',
};

const TYPE_EMOJIS: Record<string, string> = {
    'Hurto celular':         '📱',
    'Atraco a pie':          '🚶',
    'Atraco en moto':        '🏍️',
    'Fleteo':                '💳',
    'Cosquilleo':            '👋',
    'Intimidación con arma': '⚠️',
    'Otro':                  '📋',
};

export type MapViewMode = 'pins' | 'heat';

interface Props {
    reports: ReportSummary[];
    center?: [number, number];
    zoom?: number;
    className?: string;
    viewMode?: MapViewMode;
    onSelectReport?: (id: string | number | null) => void;
    selectedReportId?: string | number | null;
}

/* ── ids de fuentes/capas ── */
const SRC = 'reports';
const SRC_HEAT = 'reports-heat';
const L_CLUSTER = 'zd-clusters';
const L_CLUSTER_COUNT = 'zd-cluster-count';
const L_POINT = 'zd-point';
const L_EMOJI = 'zd-emoji';
const L_SELECTED = 'zd-selected';
const L_HEAT = 'zd-heat';
const PIN_LAYERS = [L_CLUSTER, L_CLUSTER_COUNT, L_POINT, L_EMOJI, L_SELECTED];

function toFeatureCollection(reports: ReportSummary[]): GeoJSON.FeatureCollection {
    return {
        type: 'FeatureCollection',
        features: reports
            .filter(r => r.lat != null && r.lng != null)
            .map(r => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [r.lng!, r.lat!] },
                properties: {
                    id: r.id,
                    risk: r.risk,
                    color: RISK_COLORS[r.risk],
                    emoji: TYPE_EMOJIS[r.type] ?? '📋',
                    title: r.title,
                    type: r.type,
                    location: r.location,
                    time: r.time,
                    trust: r.trustScore,
                },
            })),
    };
}

/** Escapa texto para interpolar de forma segura en el HTML del popup (anti-XSS). */
function esc(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function popupHTML(p: Record<string, unknown>): string {
    const color = esc(p.color);
    return `
        <div style="font-family: Inter, sans-serif; padding: 4px 2px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="font-size:20px">${esc(p.emoji)}</span>
                <div>
                    <p style="margin:0; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${color}">${esc(p.type)}</p>
                    <p style="margin:0; font-size:13px; font-weight:700; color:inherit;">${esc(p.title)}</p>
                </div>
            </div>
            <p style="margin:0 0 4px; font-size:11px; opacity:0.7;">${esc(p.location)}</p>
            <p style="margin:0 0 8px; font-size:11px; opacity:0.6;">${esc(p.time)}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px;">
                <span style="background:${color}22; color:${color}; border-radius:999px; padding:2px 8px; font-weight:700;">${esc(p.risk)}</span>
                <span style="opacity:0.6;">Confianza: <b>${esc(p.trust)}/100</b></span>
            </div>
        </div>`;
}

export function MapboxMap({
    reports,
    center = [-74.0721, 4.7110],
    zoom = 13,
    className,
    viewMode = 'pins',
    onSelectReport,
    selectedReportId,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef       = useRef<mapboxgl.Map | null>(null);
    const popupRef     = useRef<mapboxgl.Popup | null>(null);
    const handlersRef  = useRef(false);
    const onSelectRef  = useRef(onSelectReport);
    onSelectRef.current = onSelectReport;
    const reportsRef   = useRef(reports);
    reportsRef.current = reports;
    const [loaded, setLoaded] = useState(false);

    const isDark = () => document.documentElement.classList.contains('dark');
    const mapStyle = () =>
        isDark() ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';

    /* ── crea fuentes + capas (re-ejecutable tras setStyle) ── */
    function setupLayers(map: mapboxgl.Map) {
        if (!map.getSource(SRC)) {
            map.addSource(SRC, {
                type: 'geojson',
                data: toFeatureCollection(reportsRef.current),
                cluster: true,
                clusterRadius: 50,
                clusterMaxZoom: 14,
            });
        }
        if (!map.getSource(SRC_HEAT)) {
            map.addSource(SRC_HEAT, { type: 'geojson', data: toFeatureCollection(reports) });
        }

        if (!map.getLayer(L_HEAT)) {
            map.addLayer({
                id: L_HEAT,
                type: 'heatmap',
                source: SRC_HEAT,
                paint: {
                    'heatmap-weight': ['interpolate', ['linear'], ['get', 'trust'], 0, 0.3, 100, 1],
                    'heatmap-intensity': 1.1,
                    'heatmap-radius': 34,
                    'heatmap-opacity': 0.85,
                    'heatmap-color': [
                        'interpolate', ['linear'], ['heatmap-density'],
                        0, 'rgba(16,185,129,0)',
                        0.3, 'rgba(16,185,129,0.6)',
                        0.6, 'rgba(245,158,11,0.7)',
                        1, 'rgba(239,68,68,0.85)',
                    ],
                },
            });
        }
        if (!map.getLayer(L_CLUSTER)) {
            map.addLayer({
                id: L_CLUSTER,
                type: 'circle',
                source: SRC,
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': ['step', ['get', 'point_count'], '#60a5fa', 10, '#3b82f6', 25, '#1e3a8a'],
                    'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 25, 30],
                    'circle-stroke-width': 3,
                    'circle-stroke-color': 'rgba(255,255,255,0.7)',
                },
            });
        }
        if (!map.getLayer(L_CLUSTER_COUNT)) {
            map.addLayer({
                id: L_CLUSTER_COUNT,
                type: 'symbol',
                source: SRC,
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': ['get', 'point_count_abbreviated'],
                    'text-size': 13,
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                },
                paint: { 'text-color': '#ffffff' },
            });
        }
        if (!map.getLayer(L_POINT)) {
            map.addLayer({
                id: L_POINT,
                type: 'circle',
                source: SRC,
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': ['get', 'color'],
                    'circle-radius': 13,
                    'circle-stroke-width': 2.5,
                    'circle-stroke-color': '#ffffff',
                },
            });
        }
        if (!map.getLayer(L_SELECTED)) {
            map.addLayer({
                id: L_SELECTED,
                type: 'circle',
                source: SRC,
                filter: ['==', ['get', 'id'], '__none__'],
                paint: {
                    'circle-radius': 18,
                    'circle-color': 'rgba(0,0,0,0)',
                    'circle-stroke-width': 3,
                    'circle-stroke-color': isDark() ? '#b6c4ff' : '#00236f',
                },
            });
        }
        if (!map.getLayer(L_EMOJI)) {
            map.addLayer({
                id: L_EMOJI,
                type: 'symbol',
                source: SRC,
                filter: ['!', ['has', 'point_count']],
                layout: {
                    'text-field': ['get', 'emoji'],
                    'text-size': 14,
                    'text-allow-overlap': true,
                },
            });
        }

        applyVisibility(map);
        applySelected(map);
    }

    function applyVisibility(map: mapboxgl.Map) {
        const pinVis = viewMode === 'pins' ? 'visible' : 'none';
        const heatVis = viewMode === 'heat' ? 'visible' : 'none';
        PIN_LAYERS.forEach(l => map.getLayer(l) && map.setLayoutProperty(l, 'visibility', pinVis));
        if (map.getLayer(L_HEAT)) map.setLayoutProperty(L_HEAT, 'visibility', heatVis);
    }

    function applySelected(map: mapboxgl.Map) {
        if (!map.getLayer(L_SELECTED)) return;
        const id = selectedReportId ?? '__none__';
        map.setFilter(L_SELECTED, ['==', ['get', 'id'], id]);
    }

    function attachHandlers(map: mapboxgl.Map) {
        if (handlersRef.current) return;
        handlersRef.current = true;

        map.on('click', L_CLUSTER, (e) => {
            const f = map.queryRenderedFeatures(e.point, { layers: [L_CLUSTER] })[0];
            const clusterId = f?.properties?.cluster_id;
            const src = map.getSource(SRC) as mapboxgl.GeoJSONSource;
            src.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;
                map.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom: zoom ?? map.getZoom() + 2 });
            });
        });

        const openPopup = (e: mapboxgl.MapLayerMouseEvent) => {
            const f = e.features?.[0];
            if (!f) return;
            const props = f.properties ?? {};
            popupRef.current?.remove();
            popupRef.current = new mapboxgl.Popup({ offset: 16, maxWidth: '260px', className: 'zdanger-popup' })
                .setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number])
                .setHTML(popupHTML(props))
                .addTo(map);
            popupRef.current.on('close', () => onSelectRef.current?.(null));
            onSelectRef.current?.(props.id);
        };
        map.on('click', L_POINT, openPopup);
        map.on('click', L_EMOJI, openPopup);

        [L_CLUSTER, L_POINT, L_EMOJI].forEach(l => {
            map.on('mouseenter', l, () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', l, () => { map.getCanvas().style.cursor = ''; });
        });
    }

    /* ── init ── */
    useEffect(() => {
        if (!TOKEN || TOKEN === 'TU_TOKEN_AQUI' || !containerRef.current) return;
        mapboxgl.accessToken = TOKEN;

        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: mapStyle(),
            center,
            zoom,
            attributionControl: false,
        });
        mapRef.current = map;

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

        // 'style.load' se dispara en la carga inicial Y tras cada setStyle (dark mode)
        map.on('style.load', () => {
            setupLayers(map);
            attachHandlers(map);
            setLoaded(true);
        });

        const observer = new MutationObserver(() => map.setStyle(mapStyle()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => {
            observer.disconnect();
            map.remove();
            mapRef.current = null;
            handlersRef.current = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function fitToReports(map: mapboxgl.Map) {
        const withCoords = reportsRef.current.filter(r => r.lat != null && r.lng != null);
        if (withCoords.length === 0) return;
        const lngs = withCoords.map(r => r.lng!);
        const lats = withCoords.map(r => r.lat!);
        map.fitBounds(
            [[Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01], [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01]],
            { padding: 60, maxZoom: 15, duration: 700 },
        );
    }

    /* ── datos / carga → actualizar fuentes + reencuadrar ── */
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        const fc = toFeatureCollection(reports);
        (map.getSource(SRC) as mapboxgl.GeoJSONSource | undefined)?.setData(fc);
        (map.getSource(SRC_HEAT) as mapboxgl.GeoJSONSource | undefined)?.setData(fc);
        map.resize();
        fitToReports(map);
    }, [reports, loaded]);

    /* ── cambia el modo de vista (pines / heatmap) ── */
    useEffect(() => {
        const map = mapRef.current;
        if (map && loaded) applyVisibility(map);
    }, [viewMode, loaded]);

    /* ── cambia selección ── */
    useEffect(() => {
        const map = mapRef.current;
        if (map && loaded) applySelected(map);
    }, [selectedReportId, loaded]);

    /* ── fallback sin token ── */
    if (!TOKEN || TOKEN === 'TU_TOKEN_AQUI') {
        return (
            <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-low)] text-center ${className ?? 'min-h-[420px]'}`}>
                <span className="mb-3 text-4xl">🗺️</span>
                <p className="text-sm font-bold text-[var(--ac-on-surface)]">Mapbox no configurado</p>
                <p className="mt-1 max-w-xs text-xs text-[var(--ac-on-surface-variant)]">
                    Agregá tu token en <code className="rounded bg-[var(--ac-surface-container)] px-1">.env</code>:
                </p>
                <code className="mt-2 rounded-lg bg-[var(--ac-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--ac-primary)]">
                    VITE_MAPBOX_TOKEN=pk.eyJ1...
                </code>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .zdanger-popup .mapboxgl-popup-content {
                    border-radius: 14px;
                    padding: 12px 14px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.14);
                }
                .mapboxgl-popup-close-button { font-size: 16px; color: #888; padding: 4px 8px; }
            `}</style>
            <div
                ref={containerRef}
                className={`overflow-hidden rounded-2xl ${className ?? 'min-h-[420px]'}`}
                style={{ minHeight: '420px' }}
            />
        </>
    );
}

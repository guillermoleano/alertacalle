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

interface Props {
    reports: ReportSummary[];
    /** lat/lng center — defaults to Bogotá */
    center?: [number, number];
    zoom?: number;
    className?: string;
    onSelectReport?: (id: string | null) => void;
    selectedReportId?: string | null;
}

export function MapboxMap({
    reports,
    center = [-74.0721, 4.7110],
    zoom = 13,
    className,
    onSelectReport,
    selectedReportId,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef       = useRef<mapboxgl.Map | null>(null);
    const markersRef   = useRef<Record<string, mapboxgl.Marker>>({});
    const popupRef     = useRef<mapboxgl.Popup | null>(null);
    const [ready, setReady] = useState(false);

    /* ── detect dark mode ──────────────────────────────────── */
    const isDark = () => document.documentElement.classList.contains('dark');

    const mapStyle = () =>
        isDark()
            ? 'mapbox://styles/mapbox/dark-v11'
            : 'mapbox://styles/mapbox/light-v11';

    /* ── init map ──────────────────────────────────────────── */
    useEffect(() => {
        if (!TOKEN || TOKEN === 'TU_TOKEN_AQUI' || !containerRef.current) return;

        mapboxgl.accessToken = TOKEN;

        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: mapStyle(),
            center,
            zoom,
            attributionControl: false,
            logoPosition: 'bottom-left',
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

        map.on('load', () => setReady(true));

        mapRef.current = map;

        /* sync dark/light style when the class changes */
        const observer = new MutationObserver(() => {
            map.setStyle(mapStyle());
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
            map.remove();
            mapRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── add / update markers when reports change ──────────── */
    useEffect(() => {
        if (!ready || !mapRef.current) return;

        /* remove markers that no longer exist */
        Object.keys(markersRef.current).forEach(id => {
            if (!reports.find(r => r.id === id)) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });

        /* auto-fit to all visible reports with coords */
        const withCoords = reports.filter(r => r.lat != null && r.lng != null);
        if (withCoords.length > 0) {
            const lngs = withCoords.map(r => r.lng!);
            const lats = withCoords.map(r => r.lat!);
            const bounds: mapboxgl.LngLatBoundsLike = [
                [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
                [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
            ];
            mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 });
        }

        reports.forEach(report => {
            if (report.lat == null || report.lng == null) return;

            if (markersRef.current[report.id]) {
                /* update position only */
                markersRef.current[report.id].setLngLat([report.lng, report.lat]);
                return;
            }

            const color  = RISK_COLORS[report.risk];
            const emoji  = TYPE_EMOJIS[report.type] ?? '📋';
            const isHigh = report.risk === 'Alto';

            /* ── custom marker element ── */
            const el = document.createElement('div');
            el.className = 'zdanger-pin';
            el.style.cssText = `
                position: relative;
                cursor: pointer;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            /* pulse ring for high risk */
            if (isHigh) {
                const ring = document.createElement('span');
                ring.style.cssText = `
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: ${color};
                    opacity: 0.25;
                    animation: zdanger-ping 1.4s cubic-bezier(0,0,0.2,1) infinite;
                `;
                el.appendChild(ring);
            }

            /* pin circle */
            const pin = document.createElement('span');
            pin.style.cssText = `
                position: relative;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: ${color};
                border: 2.5px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                transition: transform 0.15s;
            `;
            pin.textContent = emoji;
            el.appendChild(pin);

            el.addEventListener('mouseenter', () => { pin.style.transform = 'scale(1.15)'; });
            el.addEventListener('mouseleave', () => { pin.style.transform = 'scale(1)'; });

            /* ── popup ── */
            const popup = new mapboxgl.Popup({
                offset: 20,
                closeButton: true,
                maxWidth: '260px',
                className: 'zdanger-popup',
            }).setHTML(`
                <div style="font-family: Inter, sans-serif; padding: 4px 2px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                        <span style="font-size:20px">${emoji}</span>
                        <div>
                            <p style="margin:0; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${color}">
                                ${report.type}
                            </p>
                            <p style="margin:0; font-size:13px; font-weight:700; color: inherit;">
                                ${report.title}
                            </p>
                        </div>
                    </div>
                    <p style="margin:0 0 4px; font-size:11px; opacity:0.7;">${report.location}</p>
                    <p style="margin:0 0 8px; font-size:11px; opacity:0.6;">${report.time}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px;">
                        <span style="background:${color}22; color:${color}; border-radius:999px; padding:2px 8px; font-weight:700;">
                            ${report.risk}
                        </span>
                        <span style="opacity:0.6;">Confianza: <b>${report.trustScore}/100</b></span>
                    </div>
                </div>
            `);

            el.addEventListener('click', () => {
                /* close any open popup */
                popupRef.current?.remove();
                popup.addTo(mapRef.current!);
                popupRef.current = popup;
                onSelectReport?.(report.id);
            });

            popup.on('close', () => {
                onSelectReport?.(null);
            });

            const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
                .setLngLat([report.lng, report.lat])
                .addTo(mapRef.current!);

            markersRef.current[report.id] = marker;
        });
    }, [ready, reports, onSelectReport]);

    /* ── highlight selected marker ─────────────────────────── */
    useEffect(() => {
        Object.entries(markersRef.current).forEach(([id, marker]) => {
            const pin = marker.getElement().querySelector('span:last-child') as HTMLElement | null;
            if (!pin) return;
            pin.style.transform = id === selectedReportId ? 'scale(1.25)' : 'scale(1)';
            pin.style.boxShadow = id === selectedReportId
                ? `0 0 0 3px white, 0 0 0 5px ${RISK_COLORS[reports.find(r => r.id === id)?.risk ?? 'Bajo']}`
                : '0 2px 8px rgba(0,0,0,0.25)';
        });
    }, [selectedReportId, reports]);

    /* ── no token fallback ─────────────────────────────────── */
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
            {/* inject ping keyframe once */}
            <style>{`
                @keyframes zdanger-ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                .zdanger-popup .mapboxgl-popup-content {
                    border-radius: 14px;
                    padding: 12px 14px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.14);
                }
                .mapboxgl-popup-close-button {
                    font-size: 16px;
                    color: #888;
                    padding: 4px 8px;
                }
            `}</style>
            <div
                ref={containerRef}
                className={`overflow-hidden rounded-2xl ${className ?? 'min-h-[420px]'}`}
                style={{ minHeight: '420px' }}
            />
        </>
    );
}

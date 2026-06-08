import { cn } from '@/lib/utils';

const pins = [
    { x: '18%', y: '28%', risk: 'alto',  pulse: true,  count: 5, label: 'Calle 100 con Cra 15' },
    { x: '38%', y: '55%', risk: 'alto',  pulse: true,  count: 3, label: 'Paradero Chapinero'   },
    { x: '60%', y: '36%', risk: 'medio', pulse: false, count: 2, label: 'Estación Norte'        },
    { x: '74%', y: '62%', risk: 'medio', pulse: false, count: 1, label: 'Parque 93'             },
    { x: '28%', y: '72%', risk: 'bajo',  pulse: false, count: 1, label: 'Cra 7 con Calle 45'   },
    { x: '85%', y: '44%', risk: 'bajo',  pulse: false, count: 1, label: 'Zona Rosa'             },
];

const riskStyle = {
    alto:  { glow: 'bg-red-400/25',     ring: 'border-red-400',      dot: 'bg-red-500',     text: 'text-red-600'     },
    medio: { glow: 'bg-amber-400/25',   ring: 'border-amber-400',    dot: 'bg-amber-500',   text: 'text-amber-700'   },
    bajo:  { glow: 'bg-emerald-400/25', ring: 'border-emerald-400',  dot: 'bg-emerald-500', text: 'text-emerald-700' },
};

export function CalmMapPreview({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'relative min-h-[360px] overflow-hidden rounded-2xl border border-[var(--ac-outline-variant)] bg-[#eef1f8] shadow-[0_16px_40px_rgba(15,23,42,0.08)]',
                className,
            )}
            aria-label="Mapa de riesgo ciudadano"
        >
            {/* ── grid callejero ── */}
            <svg className="absolute inset-0 h-full w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#94a3b8" strokeWidth="0.8"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* avenidas */}
                <line x1="0" y1="38%" x2="100%" y2="34%" stroke="#94a3b8" strokeWidth="3" opacity="0.5"/>
                <line x1="0" y1="62%" x2="100%" y2="66%" stroke="#94a3b8" strokeWidth="3" opacity="0.5"/>
                <line x1="30%" y1="0" x2="28%" y2="100%" stroke="#94a3b8" strokeWidth="3" opacity="0.5"/>
                <line x1="65%" y1="0" x2="67%" y2="100%" stroke="#94a3b8" strokeWidth="3" opacity="0.5"/>
                {/* manzanas rellenas */}
                <rect x="2%" y="6%" width="26%" height="24%" rx="3" fill="#dde3f0" opacity="0.5"/>
                <rect x="32%" y="6%" width="31%" height="24%" rx="3" fill="#dde3f0" opacity="0.5"/>
                <rect x="69%" y="6%" width="29%" height="24%" rx="3" fill="#dde3f0" opacity="0.5"/>
                <rect x="2%" y="42%" width="26%" height="18%" rx="3" fill="#dde3f0" opacity="0.5"/>
                <rect x="32%" y="42%" width="31%" height="18%" rx="3" fill="#dde3f0" opacity="0.5"/>
                <rect x="69%" y="42%" width="29%" height="18%" rx="3" fill="#dde3f0" opacity="0.5"/>
                <rect x="2%" y="70%" width="26%" height="24%" rx="3" fill="#dde3f0" opacity="0.5"/>
                <rect x="32%" y="70%" width="31%" height="24%" rx="3" fill="#dde3f0" opacity="0.5"/>
                <rect x="69%" y="70%" width="29%" height="24%" rx="3" fill="#dde3f0" opacity="0.5"/>
            </svg>

            {/* ── pins ── */}
            {pins.map((pin) => {
                const rs = riskStyle[pin.risk as keyof typeof riskStyle];
                return (
                    <div
                        key={pin.label}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group"
                        style={{ left: pin.x, top: pin.y }}
                    >
                        {/* glow halo */}
                        <span className={cn(
                            'absolute inset-0 -m-5 rounded-full blur-md',
                            rs.glow,
                            pin.pulse && 'animate-ping',
                        )} style={pin.pulse ? { animationDuration: '2.4s' } : {}} />

                        {/* pin button */}
                        <button
                            type="button"
                            className={cn(
                                'relative flex size-10 items-center justify-center rounded-full border-2 bg-white shadow-md transition-transform duration-200 hover:scale-110 active:scale-95',
                                rs.ring,
                            )}
                            aria-label={pin.label}
                        >
                            <span className={cn('size-3 rounded-full', rs.dot)} />
                            {pin.count > 1 && (
                                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-[var(--ac-primary)] text-[9px] font-bold text-white">
                                    {pin.count}
                                </span>
                            )}
                        </button>

                        {/* tooltip on hover */}
                        <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--ac-inverse-surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ac-inverse-on-surface)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            {pin.label}
                        </span>
                    </div>
                );
            })}

            {/* ── leyenda ── */}
            <div className="absolute bottom-4 left-4 rounded-xl border border-[var(--ac-outline-variant)]/40 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm">
                <p className="text-[12px] font-bold text-[var(--ac-on-surface)]">Nivel de riesgo</p>
                <div className="mt-2 space-y-1.5">
                    {(['alto','medio','bajo'] as const).map(r => (
                        <span key={r} className="flex items-center gap-2 text-[11px] font-semibold capitalize text-[var(--ac-on-surface-variant)]">
                            <span className={cn('size-2 rounded-full', riskStyle[r].dot)} />
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── total badge ── */}
            <div className="absolute top-4 right-4 rounded-xl border border-[var(--ac-outline-variant)]/40 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-bold text-[var(--ac-primary)]">{pins.length} reportes activos</p>
                <p className="text-[10px] text-[var(--ac-on-surface-variant)]">Últimas 24 horas</p>
            </div>
        </div>
    );
}

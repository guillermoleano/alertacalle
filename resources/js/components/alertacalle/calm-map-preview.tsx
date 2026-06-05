import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const points = [
    {
        x: '22%',
        y: '32%',
        size: 'h-24 w-24',
        tone: 'bg-red-400/30',
        label: 'Riesgo alto',
    },
    {
        x: '58%',
        y: '42%',
        size: 'h-20 w-20',
        tone: 'bg-amber-400/30',
        label: 'Riesgo medio',
    },
    {
        x: '72%',
        y: '68%',
        size: 'h-16 w-16',
        tone: 'bg-emerald-400/30',
        label: 'Riesgo bajo',
    },
];

export function CalmMapPreview({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'relative min-h-[360px] overflow-hidden rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-low)] shadow-[0_16px_40px_rgba(15,23,42,0.08)]',
                className,
            )}
            aria-label="Vista previa de mapa de riesgo"
        >
            <div className="absolute inset-0 opacity-60">
                <div className="absolute top-0 left-[10%] h-full w-10 rotate-12 bg-white/70" />
                <div className="absolute top-0 left-[34%] h-full w-8 -rotate-12 bg-white/70" />
                <div className="absolute top-0 left-[62%] h-full w-12 rotate-6 bg-white/70" />
                <div className="absolute top-[22%] left-0 h-8 w-full -rotate-3 bg-white/70" />
                <div className="absolute top-[55%] left-0 h-10 w-full rotate-6 bg-white/70" />
                <div className="absolute top-[78%] left-0 h-8 w-full -rotate-2 bg-white/70" />
            </div>

            {points.map((point) => (
                <div
                    key={point.label}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: point.x, top: point.y }}
                >
                    <span
                        className={cn(
                            'block rounded-full blur-sm',
                            point.size,
                            point.tone,
                        )}
                    />
                    <span className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--ac-primary)] shadow-md">
                        <MapPin className="size-5" aria-hidden="true" />
                    </span>
                    <span className="sr-only">{point.label}</span>
                </div>
            ))}

            <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 p-4 shadow-sm">
                <p className="text-sm font-bold text-[var(--ac-on-surface)]">
                    Densidad + confianza
                </p>
                <div className="mt-3 grid gap-2 text-xs font-semibold text-[var(--ac-on-surface-variant)]">
                    <span className="inline-flex items-center gap-2">
                        <span className="size-2 rounded-full bg-red-500" /> Alto
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="size-2 rounded-full bg-amber-500" />{' '}
                        Medio
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />{' '}
                        Bajo
                    </span>
                </div>
            </div>
        </div>
    );
}

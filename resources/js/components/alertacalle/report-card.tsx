import { router } from '@inertiajs/react';
import {
    Clock,
    MapPin,
    ShieldAlert,
    ShieldCheck,
    StickyNote,
    ThumbsDown,
    ThumbsUp,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type Severity = 'Alta' | 'Media' | 'Baja';

export type ReportSummary = {
    id: string | number;
    title: string;
    type: string;
    location: string;
    description: string;
    time: string;
    risk: 'Alto' | 'Medio' | 'Bajo';
    severity?: Severity;
    note?: string | null;
    trustScore: number;
    confirms: number;
    denies: number;
    lat?: number;
    lng?: number;
    createdAt?: string;
    occurredAt?: string;
};

export const severityConfig: Record<Severity, { label: string; text: string }> =
    {
        Alta: { label: 'Severidad alta', text: 'text-red-600' },
        Media: { label: 'Severidad media', text: 'text-amber-600' },
        Baja: { label: 'Severidad baja', text: 'text-emerald-600' },
    };

const riskConfig = {
    Alto: {
        pill: 'bg-red-100 text-red-700 border border-red-200',
        dot: 'bg-red-500',
        bar: 'bg-red-500',
    },
    Medio: {
        pill: 'bg-amber-100 text-amber-700 border border-amber-200',
        dot: 'bg-amber-500',
        bar: 'bg-amber-500',
    },
    Bajo: {
        pill: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        dot: 'bg-emerald-500',
        bar: 'bg-emerald-500',
    },
};

const typeIcons: Record<string, string> = {
    'Hurto celular': '📱',
    'Atraco a pie': '🚶',
    'Atraco en moto': '🏍️',
    Fleteo: '💳',
    Cosquilleo: '👋',
    'Intimidación con arma': '⚠️',
    Otro: '📋',
};

export function ReportCard({ report }: { report: ReportSummary }) {
    const [confirms, setConfirms] = useState(report.confirms);
    const [denies, setDenies] = useState(report.denies);
    const [voted, setVoted] = useState<'up' | 'down' | null>(null);
    const rc = riskConfig[report.risk];
    const emoji = typeIcons[report.type] ?? '📋';
    const trustPct = `${Math.min(report.trustScore, 100)}%`;

    function vote(dir: 'up' | 'down') {
        if (voted === dir) {
            return;
        }

        // feedback optimista inmediato
        if (dir === 'up') {
            setConfirms((c) => c + 1);

            if (voted === 'down') {
                setDenies((d) => d - 1);
            }
        }

        if (dir === 'down') {
            setDenies((d) => d + 1);

            if (voted === 'up') {
                setConfirms((c) => c - 1);
            }
        }

        setVoted(dir);

        // persistir en el backend (guest → redirige a login por middleware auth)
        router.post(
            `/reportes/${report.id}/vote`,
            { vote: dir === 'up' ? 'confirm' : 'deny' },
            { preserveScroll: true, preserveState: true },
        );
    }

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] shadow-[0_2px_12px_rgba(19,27,46,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(19,27,46,0.10)] dark:shadow-none dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
            {/* risk accent bar */}
            <div className={cn('h-1 w-full', rc.bar)} />

            <div className="p-4">
                {/* header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ac-surface-container-low)] text-[18px]">
                            {emoji}
                        </span>
                        <div>
                            <p className="text-[11px] font-bold tracking-wide text-[var(--ac-secondary)] uppercase">
                                {report.type}
                            </p>
                            <h3 className="text-[15px] leading-snug font-bold text-[var(--ac-on-surface)]">
                                {report.title}
                            </h3>
                        </div>
                    </div>
                    <span
                        className={cn(
                            'flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase',
                            rc.pill,
                        )}
                    >
                        <span className={cn('size-1.5 rounded-full', rc.dot)} />
                        {report.risk}
                    </span>
                </div>

                {/* description */}
                <p className="mt-3 line-clamp-2 text-[13px] leading-5 text-[var(--ac-on-surface-variant)]">
                    {report.description}
                </p>

                {/* nota adicional */}
                {report.note && (
                    <div className="mt-2 flex gap-2 rounded-lg bg-[var(--ac-surface-container-low)] px-3 py-2">
                        <StickyNote className="mt-0.5 size-3.5 shrink-0 text-[var(--ac-secondary)]" />
                        <p className="text-[12px] leading-5 text-[var(--ac-on-surface-variant)]">
                            {report.note}
                        </p>
                    </div>
                )}

                {/* meta */}
                <div className="mt-3 space-y-1.5">
                    <span className="flex items-center gap-2 text-[12px] text-[var(--ac-on-surface-variant)]">
                        <MapPin className="size-3.5 shrink-0 text-[var(--ac-primary)]" />
                        {report.location}
                    </span>
                    <span className="flex items-center gap-2 text-[12px] text-[var(--ac-on-surface-variant)]">
                        <Clock className="size-3.5 shrink-0 text-[var(--ac-primary)]" />
                        {report.time}
                    </span>
                    {report.severity && (
                        <span className="flex items-center gap-2 text-[12px] text-[var(--ac-on-surface-variant)]">
                            <ShieldAlert
                                className={cn(
                                    'size-3.5 shrink-0',
                                    severityConfig[report.severity].text,
                                )}
                            />
                            {severityConfig[report.severity].label}
                        </span>
                    )}
                </div>

                {/* trust score bar */}
                <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--ac-on-surface-variant)]">
                            <ShieldCheck className="size-3 text-[var(--ac-secondary)]" />
                            Confianza
                        </span>
                        <span className="text-[11px] font-bold text-[var(--ac-secondary)]">
                            {report.trustScore}/100
                        </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--ac-surface-container)]">
                        <div
                            className="h-full rounded-full bg-[var(--ac-secondary)] transition-all duration-700"
                            style={{ width: trustPct }}
                        />
                    </div>
                </div>

                {/* vote row */}
                <div className="mt-4 flex gap-2">
                    <button
                        type="button"
                        onClick={() => vote('up')}
                        className={cn(
                            'inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13px] font-bold transition-all duration-150 active:scale-95',
                            voted === 'up'
                                ? 'bg-[var(--ac-primary)] text-white shadow-sm'
                                : 'bg-[var(--ac-primary-fixed)] text-[var(--ac-primary)] hover:bg-[var(--ac-primary-fixed-dim)]',
                        )}
                    >
                        <ThumbsUp className="size-3.5" />
                        {confirms}
                    </button>
                    <button
                        type="button"
                        onClick={() => vote('down')}
                        className={cn(
                            'inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13px] font-bold transition-all duration-150 active:scale-95',
                            voted === 'down'
                                ? 'bg-red-500 text-white shadow-sm'
                                : 'bg-[var(--ac-surface-container)] text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container-high)]',
                        )}
                    >
                        <ThumbsDown className="size-3.5" />
                        {denies}
                    </button>
                </div>
            </div>
        </article>
    );
}

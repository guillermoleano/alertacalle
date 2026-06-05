import { Clock, MapPin, ShieldCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import { RiskBadge } from '@/components/alertacalle/risk-badge';

export type ReportSummary = {
    id: string;
    title: string;
    type: string;
    location: string;
    description: string;
    time: string;
    risk: 'Alto' | 'Medio' | 'Bajo';
    trustScore: number;
    confirms: number;
    denies: number;
};

export function ReportCard({ report }: { report: ReportSummary }) {
    return (
        <article className="rounded-xl border border-[var(--ac-outline-variant)] bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold tracking-wide text-[var(--ac-secondary)] uppercase">
                        {report.type}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-[var(--ac-on-surface)]">
                        {report.title}
                    </h3>
                </div>
                <RiskBadge level={report.risk} />
            </div>

            <p className="mt-3 text-sm leading-6 text-[var(--ac-on-surface-variant)]">
                {report.description}
            </p>

            <div className="mt-4 grid gap-2 text-sm text-[var(--ac-on-surface-variant)]">
                <span className="inline-flex items-center gap-2">
                    <MapPin
                        className="size-4 text-[var(--ac-primary)]"
                        aria-hidden="true"
                    />
                    {report.location}
                </span>
                <span className="inline-flex items-center gap-2">
                    <Clock
                        className="size-4 text-[var(--ac-primary)]"
                        aria-hidden="true"
                    />
                    {report.time}
                </span>
                <span className="inline-flex items-center gap-2">
                    <ShieldCheck
                        className="size-4 text-[var(--ac-secondary)]"
                        aria-hidden="true"
                    />
                    Confianza {report.trustScore}/100
                </span>
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    type="button"
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--ac-primary-fixed)] px-3 text-sm font-bold text-[var(--ac-primary)] hover:bg-[var(--ac-primary-fixed-dim)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
                >
                    <ThumbsUp className="size-4" aria-hidden="true" />
                    {report.confirms}
                </button>
                <button
                    type="button"
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--ac-surface-container)] px-3 text-sm font-bold text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container-high)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
                >
                    <ThumbsDown className="size-4" aria-hidden="true" />
                    {report.denies}
                </button>
            </div>
        </article>
    );
}

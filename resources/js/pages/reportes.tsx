import { Head } from '@inertiajs/react';
import {
    ArrowDownUp,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { AppFrame } from '@/components/alertacalle/app-frame';
import { ReportCard } from '@/components/alertacalle/report-card';
import type { ReportSummary } from '@/components/alertacalle/report-card';
import { incidentTypes } from '@/data/demo-reports';
import { useStagger } from '@/hooks/use-stagger';
import { cn } from '@/lib/utils';

type StatusFilter = 'Todos' | 'Alto' | 'Medio' | 'Bajo';
type SortOption = 'reciente' | 'confianza' | 'riesgo';
type DateRange = 'todo' | '24h' | '7d' | '30d';

const dateRanges: { value: DateRange; label: string }[] = [
    { value: 'todo', label: 'Todo' },
    { value: '24h', label: '24 h' },
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
];

const rangeMs: Record<DateRange, number> = {
    todo: Infinity,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
};

type SeverityFilter = 'Todas' | 'Alta' | 'Media' | 'Baja';

const severityFilters: SeverityFilter[] = ['Todas', 'Alta', 'Media', 'Baja'];

const statusTabs: {
    value: StatusFilter;
    label: string;
    icon: React.ElementType;
    color: string;
}[] = [
    {
        value: 'Todos',
        label: 'Todos',
        icon: Shield,
        color: 'text-[var(--ac-primary)]',
    },
    { value: 'Alto', label: 'Alto', icon: ShieldAlert, color: 'text-red-600' },
    {
        value: 'Medio',
        label: 'Medio',
        icon: ShieldCheck,
        color: 'text-amber-600',
    },
    {
        value: 'Bajo',
        label: 'Bajo',
        icon: ShieldCheck,
        color: 'text-emerald-600',
    },
];

const sortLabels: Record<SortOption, string> = {
    reciente: 'Más recientes',
    confianza: 'Mayor confianza',
    riesgo: 'Mayor riesgo',
};

const riskOrder = { Alto: 3, Medio: 2, Bajo: 1 };

export default function Reportes({
    reports = [],
}: {
    reports?: ReportSummary[];
}) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<StatusFilter>('Todos');
    const [type, setType] = useState('Todos');
    const [sort, setSort] = useState<SortOption>('reciente');
    const [dateRange, setDateRange] = useState<DateRange>('todo');
    const [severity, setSeverity] = useState<SeverityFilter>('Todas');
    const gridRef = useStagger<HTMLDivElement>(70, 50);

    const now = Date.now();
    const filtered = reports
        .filter((r) => {
            const matchStatus = status === 'Todos' || r.risk === status;
            const matchType = type === 'Todos' || r.type === type;
            const matchSeverity =
                severity === 'Todas' || r.severity === severity;
            const matchSearch =
                search === '' ||
                r.title.toLowerCase().includes(search.toLowerCase()) ||
                r.location.toLowerCase().includes(search.toLowerCase());
            const when = r.occurredAt ?? r.createdAt;
            const matchDate =
                dateRange === 'todo' ||
                !when ||
                now - new Date(when).getTime() <= rangeMs[dateRange];

            return (
                matchStatus &&
                matchType &&
                matchSeverity &&
                matchSearch &&
                matchDate
            );
        })
        .sort((a, b) => {
            if (sort === 'confianza') {
                return b.trustScore - a.trustScore;
            }

            if (sort === 'riesgo') {
                return riskOrder[b.risk] - riskOrder[a.risk];
            }

            return 0; // reciente: orden original
        });

    const total = reports.length;
    const alto = reports.filter((r) => r.risk === 'Alto').length;
    const medio = reports.filter((r) => r.risk === 'Medio').length;
    const bajo = reports.filter((r) => r.risk === 'Bajo').length;

    return (
        <AppFrame>
            <Head title="Reportes" />

            <section className="px-4 py-6 md:px-8">
                <div className="mx-auto max-w-6xl">
                    {/* ── header ── */}
                    <div className="mb-6">
                        <p className="text-[11px] font-bold tracking-widest text-[var(--ac-secondary)] uppercase">
                            Actividad comunitaria
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-[var(--ac-primary)]">
                            Reportes
                        </h1>
                    </div>

                    {/* ── stats ── */}
                    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            {
                                label: 'Total',
                                value: total,
                                bg: 'bg-[var(--ac-primary-fixed)]/40',
                                text: 'text-[var(--ac-primary)]',
                            },
                            {
                                label: 'Alto riesgo',
                                value: alto,
                                bg: 'bg-red-500/10',
                                text: 'text-red-500',
                            },
                            {
                                label: 'Riesgo medio',
                                value: medio,
                                bg: 'bg-amber-500/10',
                                text: 'text-amber-500',
                            },
                            {
                                label: 'Bajo riesgo',
                                value: bajo,
                                bg: 'bg-emerald-500/10',
                                text: 'text-emerald-500',
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className={cn('rounded-2xl px-4 py-3', s.bg)}
                            >
                                <p className={cn('text-3xl font-bold', s.text)}>
                                    {s.value}
                                </p>
                                <p className="mt-0.5 text-[12px] font-medium text-[var(--ac-on-surface-variant)]">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* ── search + sort ── */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                        <label className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--ac-on-surface-variant)]" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="min-h-11 w-full rounded-xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] pr-4 pl-10 text-sm text-[var(--ac-on-surface)] transition-shadow outline-none focus:ring-2 focus:ring-[var(--ac-primary)]"
                                placeholder="Buscar por título o ubicación…"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--ac-outline)] hover:text-[var(--ac-on-surface)]"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </label>

                        {/* sort selector */}
                        <div className="relative">
                            <ArrowDownUp className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--ac-on-surface-variant)]" />
                            <select
                                value={sort}
                                onChange={(e) =>
                                    setSort(e.target.value as SortOption)
                                }
                                className="min-h-11 appearance-none rounded-xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] pr-8 pl-10 text-sm font-semibold text-[var(--ac-on-surface)] outline-none focus:ring-2 focus:ring-[var(--ac-primary)]"
                            >
                                {(Object.keys(sortLabels) as SortOption[]).map(
                                    (k) => (
                                        <option key={k} value={k}>
                                            {sortLabels[k]}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                    </div>

                    {/* ── status tabs ── */}
                    <div className="mb-4 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1">
                        {statusTabs.map((tab) => {
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setStatus(tab.value)}
                                    className={cn(
                                        'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-all active:scale-95',
                                        status === tab.value
                                            ? 'bg-[var(--ac-primary)] text-white shadow-sm'
                                            : 'border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container)]',
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'size-3.5',
                                            status === tab.value
                                                ? 'text-white'
                                                : tab.color,
                                        )}
                                    />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── type chips ── */}
                    <div className="mb-5 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1">
                        {['Todos', ...incidentTypes].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={cn(
                                    'min-h-8 shrink-0 rounded-full px-3 text-[12px] font-semibold transition-all active:scale-95',
                                    type === t
                                        ? 'bg-[var(--ac-secondary)] text-white'
                                        : 'border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container)]',
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* ── date range + severidad ── */}
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                        <div className="flex w-fit gap-1.5 rounded-xl bg-[var(--ac-surface-container)] p-1">
                            {dateRanges.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setDateRange(r.value)}
                                    className={cn(
                                        'min-h-8 rounded-lg px-3 text-[12px] font-bold transition-all active:scale-95',
                                        dateRange === r.value
                                            ? 'bg-[var(--ac-surface-container-lowest)] text-[var(--ac-primary)] shadow-sm'
                                            : 'text-[var(--ac-on-surface-variant)] hover:text-[var(--ac-on-surface)]',
                                    )}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--ac-on-surface-variant)]">
                                <ShieldAlert className="size-3.5" />
                                Severidad
                            </span>
                            <div className="flex w-fit gap-1.5 rounded-xl bg-[var(--ac-surface-container)] p-1">
                                {severityFilters.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setSeverity(s)}
                                        className={cn(
                                            'min-h-8 rounded-lg px-3 text-[12px] font-bold transition-all active:scale-95',
                                            severity === s
                                                ? 'bg-[var(--ac-surface-container-lowest)] text-[var(--ac-primary)] shadow-sm'
                                                : 'text-[var(--ac-on-surface-variant)] hover:text-[var(--ac-on-surface)]',
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── results count ── */}
                    <p className="mb-4 text-[13px] text-[var(--ac-on-surface-variant)]">
                        {filtered.length === 0
                            ? 'Sin resultados'
                            : `${filtered.length} reporte${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
                    </p>

                    {/* ── grid ── */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-center text-[var(--ac-on-surface-variant)]">
                            <Shield className="mb-4 size-12 opacity-20" />
                            <p className="text-base font-semibold">
                                Sin reportes
                            </p>
                            <p className="mt-1 text-sm">
                                Intentá con otros filtros o términos de búsqueda
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('Todos');
                                    setType('Todos');
                                    setDateRange('todo');
                                    setSeverity('Todas');
                                }}
                                className="mt-4 rounded-xl bg-[var(--ac-primary-fixed)] px-4 py-2 text-sm font-bold text-[var(--ac-primary)] transition-all hover:bg-[var(--ac-primary-fixed-dim)] active:scale-95"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    ) : (
                        <div
                            ref={gridRef}
                            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                        >
                            {filtered.map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </AppFrame>
    );
}

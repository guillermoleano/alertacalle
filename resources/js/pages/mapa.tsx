import { Head, Link } from '@inertiajs/react';
import { Filter, Flame, MapPin, PlusCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { AppFrame } from '@/components/alertacalle/app-frame';
import { MapboxMap, type MapViewMode } from '@/components/alertacalle/mapbox-map';
import { ReportCard, type ReportSummary } from '@/components/alertacalle/report-card';
import { incidentTypes } from '@/data/demo-reports';
import { cn } from '@/lib/utils';

type DateRange = 'todo' | '24h' | '7d' | '30d';

const dateRanges: { value: DateRange; label: string }[] = [
    { value: 'todo', label: 'Todo' },
    { value: '24h', label: '24 h' },
    { value: '7d',  label: '7 días' },
    { value: '30d', label: '30 días' },
];

const rangeMs: Record<DateRange, number> = {
    todo: Infinity,
    '24h': 24 * 60 * 60 * 1000,
    '7d':  7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
};

const stats = [
    { label: 'Reportes hoy',       value: '14',  color: 'text-red-500',                          bg: 'bg-red-500/10'                          },
    { label: 'Zona de alto riesgo', value: '3',   color: 'text-amber-500',                        bg: 'bg-amber-500/10'                        },
    { label: 'Validados',          value: '9',   color: 'text-emerald-500',                      bg: 'bg-emerald-500/10'                      },
    { label: 'Confianza prom.',    value: '62%', color: 'text-[var(--ac-primary)]',              bg: 'bg-[var(--ac-primary-fixed)]/40'        },
];

export default function Mapa({ reports = [] }: { reports?: ReportSummary[] }) {
    const [activeType,       setActiveType]       = useState<string>('Todos');
    const [showFilters,      setShowFilters]      = useState(false);
    const [search,           setSearch]           = useState('');
    const [selectedReportId, setSelectedReportId] = useState<string | number | null>(null);
    const [viewMode,         setViewMode]         = useState<MapViewMode>('pins');
    const [dateRange,        setDateRange]        = useState<DateRange>('todo');

    const allTypes = ['Todos', ...incidentTypes];

    const now = Date.now();
    const filtered = reports.filter(r => {
        const matchType   = activeType === 'Todos' || r.type === activeType;
        const matchSearch = search === '' ||
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.location.toLowerCase().includes(search.toLowerCase());
        const when = r.occurredAt ?? r.createdAt;
        const matchDate = dateRange === 'todo' || !when ||
            (now - new Date(when).getTime()) <= rangeMs[dateRange];
        return matchType && matchSearch && matchDate;
    });

    return (
        <AppFrame>
            <Head title="Mapa de riesgo" />

            <div className="grid min-h-[calc(100vh-92px)] xl:grid-cols-[1fr_400px]">

                {/* ── columna mapa ── */}
                <section className="p-4 md:p-6">

                    {/* header */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--ac-primary)]">Mapa de riesgo</h1>
                            <p className="mt-0.5 text-sm text-[var(--ac-on-surface-variant)]">
                                Reportes ponderados por confianza y recencia
                            </p>
                        </div>
                        <Link
                            href="/reportar"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--ac-primary)] px-5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
                        >
                            <PlusCircle className="size-4" />
                            Reportar
                        </Link>
                    </div>

                    {/* stats row */}
                    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {stats.map(s => (
                            <div key={s.label} className={cn('rounded-xl px-3 py-2.5', s.bg)}>
                                <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
                                <p className="text-[11px] font-medium text-[var(--ac-on-surface-variant)]">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* search + filter */}
                    <div className="mb-3 flex gap-2">
                        <label className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--ac-on-surface-variant)]" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="min-h-11 w-full rounded-xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] text-[var(--ac-on-surface)] pr-4 pl-10 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[var(--ac-primary)]"
                                placeholder="Buscar por tipo o ubicación…"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--ac-outline)] hover:text-[var(--ac-on-surface)]">
                                    <X className="size-4" />
                                </button>
                            )}
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                'inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all active:scale-95',
                                showFilters
                                    ? 'border-[var(--ac-primary)] bg-[var(--ac-primary-fixed)] text-[var(--ac-primary)]'
                                    : 'border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container)]',
                            )}
                        >
                            <SlidersHorizontal className="size-4" />
                            Filtros
                        </button>
                    </div>

                    {/* type chips */}
                    <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                        {allTypes.map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setActiveType(type)}
                                className={cn(
                                    'min-h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold transition-all duration-150 active:scale-95',
                                    activeType === type
                                        ? 'bg-[var(--ac-secondary)] text-white shadow-sm'
                                        : 'border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container)]',
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* ── date range + view toggle ── */}
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex gap-1.5 rounded-xl bg-[var(--ac-surface-container)] p-1">
                            {dateRanges.map(r => (
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

                        <div className="flex gap-1.5 rounded-xl bg-[var(--ac-surface-container)] p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('pins')}
                                className={cn(
                                    'inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-bold transition-all active:scale-95',
                                    viewMode === 'pins'
                                        ? 'bg-[var(--ac-surface-container-lowest)] text-[var(--ac-primary)] shadow-sm'
                                        : 'text-[var(--ac-on-surface-variant)] hover:text-[var(--ac-on-surface)]',
                                )}
                            >
                                <MapPin className="size-3.5" /> Pines
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('heat')}
                                className={cn(
                                    'inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-bold transition-all active:scale-95',
                                    viewMode === 'heat'
                                        ? 'bg-[var(--ac-surface-container-lowest)] text-[var(--ac-primary)] shadow-sm'
                                        : 'text-[var(--ac-on-surface-variant)] hover:text-[var(--ac-on-surface)]',
                                )}
                            >
                                <Flame className="size-3.5" /> Calor
                            </button>
                        </div>
                    </div>

                    {/* ── Mapbox ── */}
                    <MapboxMap
                        reports={filtered}
                        className="min-h-[440px] w-full"
                        viewMode={viewMode}
                        onSelectReport={setSelectedReportId}
                        selectedReportId={selectedReportId}
                    />
                </section>

                {/* ── sidebar reportes ── */}
                <aside className="border-t border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] xl:border-t-0 xl:border-l">
                    <div className="sticky top-[68px] p-4 md:p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-[16px] font-bold text-[var(--ac-on-surface)]">
                                Reportes recientes
                            </h2>
                            <span className="rounded-full bg-[var(--ac-surface-container)] px-2.5 py-0.5 text-[12px] font-bold text-[var(--ac-on-surface-variant)]">
                                {filtered.length}
                            </span>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center py-10 text-center text-[var(--ac-on-surface-variant)]">
                                <Filter className="mb-3 size-8 opacity-30" />
                                <p className="text-sm font-medium">Sin resultados</p>
                                <p className="mt-1 text-[12px]">Probá con otro filtro o búsqueda</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 overflow-y-auto xl:max-h-[calc(100vh-160px)]">
                                {filtered.map(report => (
                                    <div
                                        key={report.id}
                                        className={cn(
                                            'rounded-2xl transition-all duration-200',
                                            selectedReportId === report.id
                                                ? 'ring-2 ring-[var(--ac-primary)] ring-offset-1 ring-offset-[var(--ac-surface-container-lowest)]'
                                                : '',
                                        )}
                                        onClick={() => setSelectedReportId(
                                            selectedReportId === report.id ? null : report.id
                                        )}
                                    >
                                        <ReportCard report={report} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </AppFrame>
    );
}

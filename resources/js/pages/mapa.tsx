import { Head, Link } from '@inertiajs/react';
import { Filter, PlusCircle, Search } from 'lucide-react';
import { AppFrame } from '@/components/alertacalle/app-frame';
import { CalmMapPreview } from '@/components/alertacalle/calm-map-preview';
import { ReportCard } from '@/components/alertacalle/report-card';
import { demoReports, incidentTypes } from '@/data/demo-reports';

export default function Mapa() {
    return (
        <AppFrame>
            <Head title="Mapa de riesgo" />

            <div className="grid min-h-[calc(100vh-92px)] gap-0 xl:grid-cols-[1fr_420px]">
                <section className="p-4 md:p-8">
                    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--ac-primary)]">
                                Mapa de riesgo
                            </h1>
                            <p className="mt-1 text-sm text-[var(--ac-on-surface-variant)]">
                                Vista desaturada con reportes ponderados por
                                confianza y recencia.
                            </p>
                        </div>
                        <Link
                            href="/reportar"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--ac-primary)] px-4 text-sm font-bold text-white hover:bg-[var(--ac-primary-container)]"
                        >
                            <PlusCircle className="size-4" aria-hidden="true" />
                            Reportar
                        </Link>
                    </div>

                    <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
                        <label className="relative block">
                            <span className="sr-only">
                                Buscar ubicación o reporte
                            </span>
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--ac-on-surface-variant)]" />
                            <input
                                disabled
                                className="min-h-11 w-full rounded-xl border border-[var(--ac-outline-variant)] bg-white pr-4 pl-11 text-sm text-[var(--ac-on-surface-variant)] opacity-70"
                                placeholder="Buscar ubicación o reporte (fase 2)"
                                type="text"
                            />
                        </label>
                        <button
                            type="button"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--ac-outline-variant)] bg-white px-4 text-sm font-bold text-[var(--ac-on-surface-variant)]"
                        >
                            <Filter className="size-4" aria-hidden="true" />
                            Filtros
                        </button>
                    </div>

                    <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                        {incidentTypes.map((type, index) => (
                            <button
                                key={type}
                                type="button"
                                className={
                                    index === 0
                                        ? 'min-h-11 shrink-0 rounded-full bg-[var(--ac-secondary)] px-4 text-sm font-bold text-white'
                                        : 'min-h-11 shrink-0 rounded-full border border-[var(--ac-outline-variant)] bg-white px-4 text-sm font-bold text-[var(--ac-on-surface-variant)]'
                                }
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <CalmMapPreview className="min-h-[520px]" />
                </section>

                <aside className="border-t border-[var(--ac-outline-variant)] bg-white p-4 md:p-6 xl:border-t-0 xl:border-l">
                    <h2 className="text-lg font-bold text-[var(--ac-on-surface)]">
                        Reportes recientes
                    </h2>
                    <div className="mt-4 grid gap-4">
                        {demoReports.map((report) => (
                            <ReportCard key={report.id} report={report} />
                        ))}
                    </div>
                </aside>
            </div>
        </AppFrame>
    );
}

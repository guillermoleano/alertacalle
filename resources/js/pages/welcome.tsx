import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    LockKeyhole,
    MapPinned,
    ShieldCheck,
} from 'lucide-react';
import { AppFrame } from '@/components/alertacalle/app-frame';
import { CalmMapPreview } from '@/components/alertacalle/calm-map-preview';
import { ReportCard } from '@/components/alertacalle/report-card';
import { demoReports } from '@/data/demo-reports';

export default function Welcome() {
    return (
        <AppFrame>
            <Head title="AlertaCalle" />

            <section className="px-4 py-8 md:px-8 md:py-12">
                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
                    <div>
                        <p className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[var(--ac-secondary-fixed)] px-3 text-sm font-bold text-[var(--ac-on-secondary-fixed)]">
                            <ShieldCheck
                                className="size-4"
                                aria-hidden="true"
                            />
                            Anónimo por defecto
                        </p>
                        <h1 className="mt-6 max-w-3xl text-4xl leading-tight font-bold text-[var(--ac-primary)] md:text-5xl">
                            AlertaCalle
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--ac-on-surface-variant)]">
                            Reporta incidentes de seguridad en segundos,
                            consulta zonas de riesgo y ayuda a tu comunidad con
                            información útil, privada y no alarmista.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/reportar"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--ac-primary)] px-5 text-sm font-bold text-white shadow-sm hover:bg-[var(--ac-primary-container)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
                            >
                                Crear reporte
                                <ArrowRight
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </Link>
                            <Link
                                href="/mapa"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--ac-outline-variant)] bg-white px-5 text-sm font-bold text-[var(--ac-primary)] hover:bg-[var(--ac-surface-container)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
                            >
                                Ver mapa
                            </Link>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            {[
                                ['3 toques', 'Reporte rápido con ubicación.'],
                                ['14 días', 'Los reportes activos expiran.'],
                                ['0 datos públicos', 'No exponemos identidad.'],
                            ].map(([value, label]) => (
                                <div
                                    key={value}
                                    className="rounded-xl border border-[var(--ac-outline-variant)] bg-white p-4"
                                >
                                    <p className="text-xl font-bold text-[var(--ac-primary)]">
                                        {value}
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--ac-on-surface-variant)]">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <CalmMapPreview />
                </div>
            </section>

            <section className="border-y border-[var(--ac-outline-variant)] bg-white px-4 py-8 md:px-8">
                <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
                    {[
                        {
                            icon: LockKeyhole,
                            title: 'Privacidad desde el diseño',
                            text: 'El reporte puede ser anónimo y evita datos que identifiquen a terceros.',
                        },
                        {
                            icon: MapPinned,
                            title: 'Hechos en lugares',
                            text: 'La información se centra en ubicación, momento y tipo de incidente.',
                        },
                        {
                            icon: CheckCircle2,
                            title: 'Confianza comunitaria',
                            text: 'Confirmaciones, desmentidos y cercanía ayudan a estimar el nivel de riesgo.',
                        },
                    ].map((item) => {
                        const Icon = item.icon;

                        return (
                            <article
                                key={item.title}
                                className="rounded-xl bg-[var(--ac-surface-container-low)] p-5"
                            >
                                <Icon
                                    className="size-6 text-[var(--ac-secondary)]"
                                    aria-hidden="true"
                                />
                                <h2 className="mt-4 text-lg font-bold text-[var(--ac-on-surface)]">
                                    {item.title}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-[var(--ac-on-surface-variant)]">
                                    {item.text}
                                </p>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="px-4 py-10 md:px-8">
                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1fr]">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--ac-primary)]">
                            Reportes recientes
                        </h2>
                        <p className="mt-3 max-w-xl text-base leading-7 text-[var(--ac-on-surface-variant)]">
                            Esta primera versión usa datos de demostración
                            limpios. El siguiente paso será conectarlos con
                            Laravel, PostGIS y el cálculo de confianza.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {demoReports.slice(0, 2).map((report) => (
                            <ReportCard key={report.id} report={report} />
                        ))}
                    </div>
                </div>
            </section>
        </AppFrame>
    );
}

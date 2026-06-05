import { Head } from '@inertiajs/react';
import { AppFrame } from '@/components/alertacalle/app-frame';
import { ReportCard } from '@/components/alertacalle/report-card';
import { demoReports } from '@/data/demo-reports';

export default function Reportes() {
    return (
        <AppFrame>
            <Head title="Reportes" />

            <section className="px-4 py-8 md:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-bold tracking-wide text-[var(--ac-secondary)] uppercase">
                                Actividad comunitaria
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-[var(--ac-primary)]">
                                Reportes
                            </h1>
                        </div>
                        <p className="max-w-xl text-sm leading-6 text-[var(--ac-on-surface-variant)]">
                            Listado inicial de reportes activos. La conexión a
                            datos reales quedará sobre `ReportController` y
                            recursos JSON seguros.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {demoReports.map((report) => (
                            <ReportCard key={report.id} report={report} />
                        ))}
                    </div>
                </div>
            </section>
        </AppFrame>
    );
}

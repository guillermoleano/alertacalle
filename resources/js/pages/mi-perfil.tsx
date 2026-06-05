import { Head } from '@inertiajs/react';
import { AlertTriangle, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { AppFrame } from '@/components/alertacalle/app-frame';
import { ReportCard } from '@/components/alertacalle/report-card';
import { demoReports } from '@/data/demo-reports';

export default function MiPerfil() {
    return (
        <AppFrame>
            <Head title="Mi Perfil" />

            <section className="px-4 py-8 md:px-8">
                <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
                    <aside className="rounded-2xl border border-[var(--ac-outline-variant)] bg-white p-6 shadow-[0_10px_32px_rgba(15,23,42,0.06)]">
                        <div className="flex items-center gap-4">
                            <span className="flex size-16 items-center justify-center rounded-full bg-[var(--ac-primary-fixed)] text-[var(--ac-primary)]">
                                <UserRound
                                    className="size-8"
                                    aria-hidden="true"
                                />
                            </span>
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--ac-primary)]">
                                    Mi Perfil
                                </h1>
                                <p className="text-sm text-[var(--ac-on-surface-variant)]">
                                    Usuario anónimo
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-xl bg-[var(--ac-surface-container-low)] p-4">
                            <p className="text-sm font-bold text-[var(--ac-on-surface-variant)]">
                                Reputación
                            </p>
                            <p className="mt-1 text-3xl font-bold text-[var(--ac-primary)]">
                                720/1000
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[var(--ac-on-surface-variant)]">
                                Basada en reportes confirmados y participación
                                responsable.
                            </p>
                        </div>

                        <div className="mt-6 rounded-xl bg-[var(--ac-secondary-fixed)] p-4 text-sm leading-6 text-[var(--ac-on-secondary-fixed)]">
                            <p className="flex gap-2 font-bold">
                                <ShieldCheck
                                    className="mt-0.5 size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                Privacidad activa
                            </p>
                            <p className="mt-1 pl-6">
                                Tu identidad no se muestra en reportes públicos.
                                Puedes borrar tus datos cuando lo necesites.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                        >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Borrar mis datos
                        </button>
                    </aside>

                    <div className="grid gap-6">
                        <section className="rounded-2xl border border-[var(--ac-outline-variant)] bg-white p-6">
                            <h2 className="text-xl font-bold text-[var(--ac-on-surface)]">
                                Mis reportes recientes
                            </h2>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                {demoReports.slice(0, 2).map((report) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                    />
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-[var(--ac-outline-variant)] bg-white p-6">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--ac-on-surface)]">
                                <AlertTriangle
                                    className="size-5 text-amber-600"
                                    aria-hidden="true"
                                />
                                Reglas de publicación
                            </h2>
                            <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--ac-on-surface-variant)]">
                                <li>
                                    Describe hechos, ubicaciones y condiciones
                                    del lugar.
                                </li>
                                <li>
                                    No incluyas nombres, placas, teléfonos,
                                    cédulas, rostros ni fotos de personas.
                                </li>
                                <li>
                                    Usa confirmar o desmentir solo cuando tengas
                                    contexto directo del reporte.
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            </section>
        </AppFrame>
    );
}

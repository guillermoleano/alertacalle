import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, FileText, Settings, ShieldCheck, TrendingUp } from 'lucide-react';
import { AppFrame } from '@/components/alertacalle/app-frame';
import { ReportCard, type ReportSummary } from '@/components/alertacalle/report-card';
import { cn } from '@/lib/utils';

type ProfileUser = {
    name: string;
    email: string;
    memberSince: string;
};

type Stats = {
    total: number;
    validated: number;
    confirms: number;
    avgTrust: number;
};

type Props = {
    profileUser: ProfileUser;
    reports: ReportSummary[];
    stats: Stats;
    reputation: number;
};

function initials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function MiPerfil({ profileUser, reports = [], stats, reputation }: Props) {
    const repPct = Math.min(100, Math.round((reputation / 1000) * 100));

    const statTiles = [
        { label: 'Reportes', value: stats.total, icon: FileText },
        { label: 'Validados', value: stats.validated, icon: ShieldCheck },
        { label: 'Confirmaciones', value: stats.confirms, icon: TrendingUp },
    ];

    return (
        <AppFrame>
            <Head title="Mi Perfil" />

            <section className="px-4 py-8 md:px-8">
                <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
                    {/* ── columna izquierda ── */}
                    <aside className="rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] p-6 shadow-[0_10px_32px_rgba(15,23,42,0.06)] dark:shadow-none">
                        <div className="flex items-center gap-4">
                            <span className="flex size-16 items-center justify-center rounded-full bg-[var(--ac-primary)] text-xl font-bold text-white">
                                {initials(profileUser.name)}
                            </span>
                            <div className="min-w-0">
                                <h1 className="truncate text-xl font-bold text-[var(--ac-on-surface)]">
                                    {profileUser.name}
                                </h1>
                                <p className="truncate text-sm text-[var(--ac-on-surface-variant)]">
                                    {profileUser.email}
                                </p>
                                <p className="mt-0.5 text-[12px] text-[var(--ac-on-surface-variant)]">
                                    Miembro desde {profileUser.memberSince}
                                </p>
                            </div>
                        </div>

                        {/* reputación */}
                        <div className="mt-6 rounded-xl bg-[var(--ac-surface-container-low)] p-4">
                            <div className="flex items-end justify-between">
                                <p className="text-sm font-bold text-[var(--ac-on-surface-variant)]">
                                    Reputación
                                </p>
                                <p className="text-3xl font-bold text-[var(--ac-primary)]">
                                    {reputation}
                                    <span className="text-base font-semibold text-[var(--ac-on-surface-variant)]">/1000</span>
                                </p>
                            </div>
                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--ac-surface-container-high)]">
                                <div
                                    className="h-full rounded-full bg-[var(--ac-secondary)] transition-all duration-700"
                                    style={{ width: `${repPct}%` }}
                                />
                            </div>
                            <p className="mt-2 text-[12px] leading-5 text-[var(--ac-on-surface-variant)]">
                                Basada en reportes validados y confirmaciones recibidas de la comunidad.
                            </p>
                        </div>

                        {/* stats */}
                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {statTiles.map((t) => {
                                const Icon = t.icon;
                                return (
                                    <div
                                        key={t.label}
                                        className="flex flex-col items-center gap-1 rounded-xl bg-[var(--ac-surface-container-low)] px-2 py-3 text-center"
                                    >
                                        <Icon className="size-4 text-[var(--ac-secondary)]" />
                                        <span className="text-lg font-bold text-[var(--ac-on-surface)]">{t.value}</span>
                                        <span className="text-[10px] font-medium leading-tight text-[var(--ac-on-surface-variant)]">{t.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 rounded-xl bg-[var(--ac-secondary-fixed)] p-4 text-sm leading-6 text-[var(--ac-on-secondary-fixed)]">
                            <p className="flex gap-2 font-bold">
                                <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                Privacidad activa
                            </p>
                            <p className="mt-1 pl-6">
                                Tu identidad no se muestra en reportes públicos, incluso en los que hiciste con tu cuenta.
                            </p>
                        </div>

                        <Link
                            href="/ajustes"
                            className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--ac-outline-variant)] px-4 text-sm font-bold text-[var(--ac-on-surface)] transition-all hover:bg-[var(--ac-surface-container)] active:scale-95"
                        >
                            <Settings className="size-4" aria-hidden="true" />
                            Ajustes de cuenta
                        </Link>
                    </aside>

                    {/* ── columna derecha ── */}
                    <div className="grid gap-6">
                        <section className="rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-[var(--ac-on-surface)]">
                                    Mis reportes
                                </h2>
                                <span className="rounded-full bg-[var(--ac-surface-container)] px-2.5 py-0.5 text-[12px] font-bold text-[var(--ac-on-surface-variant)]">
                                    {reports.length}
                                </span>
                            </div>

                            {reports.length === 0 ? (
                                <div className="flex flex-col items-center py-12 text-center text-[var(--ac-on-surface-variant)]">
                                    <FileText className="mb-3 size-10 opacity-25" />
                                    <p className="text-sm font-semibold">Todavía no hiciste reportes</p>
                                    <p className="mt-1 text-[13px]">Cuando reportes un incidente aparecerá acá.</p>
                                    <Link
                                        href="/reportar"
                                        className="mt-4 rounded-xl bg-[var(--ac-primary)] px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                                    >
                                        Crear mi primer reporte
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {reports.map((report) => (
                                        <ReportCard key={report.id} report={report} />
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className={cn('rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] p-6')}>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--ac-on-surface)]">
                                <AlertTriangle className="size-5 text-amber-500" aria-hidden="true" />
                                Reglas de publicación
                            </h2>
                            <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--ac-on-surface-variant)]">
                                <li>Describe hechos, ubicaciones y condiciones del lugar.</li>
                                <li>No incluyas nombres, placas, teléfonos, cédulas, rostros ni fotos de personas.</li>
                                <li>Usa confirmar o desmentir solo cuando tengas contexto directo del reporte.</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </section>
        </AppFrame>
    );
}

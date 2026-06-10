import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    ShieldAlert,
    ShieldX,
    Trash2,
} from 'lucide-react';
import { AppFrame } from '@/components/alertacalle/app-frame';
import { cn } from '@/lib/utils';

type Status = 'pending' | 'validated' | 'rejected' | 'fake';

type ModReport = {
    id: number;
    title: string;
    type: string;
    location: string;
    time: string;
    status: Status;
    confirms: number;
    denies: number;
    trustScore: number;
    anonymous: boolean;
};

type Counts = Record<Status, number>;

const statusConfig: Record<Status, { label: string; chip: string }> = {
    pending: {
        label: 'Pendiente',
        chip: 'bg-amber-100 text-amber-700 border border-amber-200',
    },
    validated: {
        label: 'Validado',
        chip: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    },
    rejected: {
        label: 'Rechazado',
        chip: 'bg-slate-100 text-slate-600 border border-slate-200',
    },
    fake: {
        label: 'Falso',
        chip: 'bg-red-100 text-red-700 border border-red-200',
    },
};

const actions: { status: Status; label: string; icon: React.ElementType }[] = [
    { status: 'validated', label: 'Validar', icon: CheckCircle2 },
    { status: 'rejected', label: 'Rechazar', icon: ShieldX },
    { status: 'fake', label: 'Falso', icon: Trash2 },
    { status: 'pending', label: 'Pendiente', icon: Clock },
];

function setStatus(id: number, status: Status) {
    router.patch(
        `/moderacion/${id}`,
        { status },
        { preserveScroll: true, preserveState: false },
    );
}

export default function Moderacion({
    reports = [],
    counts,
}: {
    reports?: ModReport[];
    counts: Counts;
}) {
    return (
        <AppFrame>
            <Head title="Moderación" />

            <section className="px-4 py-8 md:px-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    {/* header */}
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="size-6 text-[var(--ac-primary)]" />
                        <h1 className="text-2xl font-bold text-[var(--ac-on-surface)]">
                            Moderación
                        </h1>
                    </div>

                    {/* counts */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {(Object.keys(statusConfig) as Status[]).map((s) => (
                            <div
                                key={s}
                                className="rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] px-4 py-3"
                            >
                                <p className="text-3xl font-bold text-[var(--ac-on-surface)]">
                                    {counts[s]}
                                </p>
                                <p className="mt-0.5 text-[12px] font-medium text-[var(--ac-on-surface-variant)]">
                                    {statusConfig[s].label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* lista */}
                    {reports.length === 0 ? (
                        <p className="py-16 text-center text-sm text-[var(--ac-on-surface-variant)]">
                            No hay reportes para moderar.
                        </p>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)]">
                            <div className="divide-y divide-[var(--ac-outline-variant)]/50">
                                {reports.map((r) => (
                                    <div
                                        key={r.id}
                                        className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase',
                                                        statusConfig[r.status]
                                                            .chip,
                                                    )}
                                                >
                                                    {
                                                        statusConfig[r.status]
                                                            .label
                                                    }
                                                </span>
                                                <span className="text-[11px] font-bold tracking-wide text-[var(--ac-secondary)] uppercase">
                                                    {r.type}
                                                </span>
                                            </div>
                                            <p className="mt-1 truncate text-[14px] font-semibold text-[var(--ac-on-surface)]">
                                                {r.title}
                                            </p>
                                            <p className="truncate text-[12px] text-[var(--ac-on-surface-variant)]">
                                                {r.location} · {r.time} · 👍{' '}
                                                {r.confirms} · 👎 {r.denies} ·
                                                confianza {r.trustScore}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap gap-2">
                                            {actions.map((a) => {
                                                const Icon = a.icon;
                                                const active =
                                                    r.status === a.status;

                                                return (
                                                    <button
                                                        key={a.status}
                                                        type="button"
                                                        disabled={active}
                                                        onClick={() =>
                                                            setStatus(
                                                                r.id,
                                                                a.status,
                                                            )
                                                        }
                                                        className={cn(
                                                            'inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-[12px] font-semibold transition-all active:scale-95',
                                                            active
                                                                ? 'cursor-default border-[var(--ac-primary)] bg-[var(--ac-primary-fixed)] text-[var(--ac-primary)]'
                                                                : 'border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container)]',
                                                        )}
                                                    >
                                                        <Icon className="size-3.5" />
                                                        {a.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </AppFrame>
    );
}

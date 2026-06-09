import { Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-[var(--ac-background)] p-6 md:p-10">
            {/* fondo sutil con glows de marca */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(circle at 20% 18%, rgba(113,248,228,0.18), transparent 32%), radial-gradient(circle at 82% 78%, rgba(182,196,255,0.22), transparent 34%)',
                }}
            />

            <div className="relative w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="group flex flex-col items-center gap-3"
                        >
                            <span className="flex size-14 items-center justify-center rounded-2xl bg-[var(--ac-primary)] text-white shadow-lg shadow-[var(--ac-primary)]/20 transition-transform duration-200 group-hover:scale-105">
                                <ShieldCheck className="size-7" aria-hidden="true" />
                            </span>
                            <span className="flex flex-col items-center">
                                <span className="text-lg font-bold leading-5 text-[var(--ac-primary)]">
                                    ZDanger
                                </span>
                                <span className="text-xs font-medium text-[var(--ac-on-surface-variant)]">
                                    Seguridad ciudadana
                                </span>
                            </span>
                        </Link>

                        <div className="mt-2 space-y-2 text-center">
                            <h1 className="text-xl font-bold text-[var(--ac-on-surface)]">
                                {title}
                            </h1>
                            <p className="text-center text-sm text-[var(--ac-on-surface-variant)]">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] p-6 shadow-[0_8px_32px_rgba(19,27,46,0.08)] dark:shadow-none">
                        {children}
                    </div>

                    <p className="text-center text-[11px] leading-5 text-[var(--ac-on-surface-variant)]">
                        Reportá de forma anónima. Tu identidad nunca es pública.
                    </p>
                </div>
            </div>
        </div>
    );
}

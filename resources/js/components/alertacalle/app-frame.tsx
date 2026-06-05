import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    ClipboardList,
    HelpCircle,
    Home,
    Map,
    PlusCircle,
    Settings,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Mapa', href: '/mapa', icon: Map },
    { label: 'Reportar', href: '/reportar', icon: PlusCircle },
    { label: 'Reportes', href: '/reportes', icon: ClipboardList },
    { label: 'Mi Perfil', href: '/mi-perfil', icon: UserRound },
    { label: 'Ajustes', href: '/ajustes', icon: Settings, disabled: true },
];

function BrandMark() {
    return (
        <Link
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
        >
            <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--ac-primary)] text-white shadow-sm">
                <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
                <span className="block text-lg leading-5 font-bold text-[var(--ac-primary)]">
                    AlertaCalle
                </span>
                <span className="text-xs font-medium text-[var(--ac-on-surface-variant)]">
                    Reportes cívicos anónimos
                </span>
            </span>
        </Link>
    );
}

export function AppFrame({ children }: PropsWithChildren) {
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-[var(--ac-background)] text-[var(--ac-on-surface)]">
            <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[280px_1fr]">
                <aside className="hidden border-r border-[var(--ac-outline-variant)] bg-white/80 px-5 py-6 lg:block">
                    <BrandMark />

                    <nav
                        className="mt-10 space-y-2"
                        aria-label="Navegación principal"
                    >
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = url.startsWith(item.href);

                            if (item.disabled) {
                                return (
                                    <span
                                        key={item.label}
                                        className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-xl px-4 text-sm font-semibold text-[var(--ac-on-surface-variant)] opacity-55"
                                    >
                                        <Icon
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                        {item.label}
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        'flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none',
                                        active
                                            ? 'bg-[var(--ac-primary-fixed)] text-[var(--ac-primary)]'
                                            : 'text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)]',
                                    )}
                                >
                                    <Icon
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex min-w-0 flex-col">
                    <header className="sticky top-0 z-30 border-b border-[var(--ac-outline-variant)] bg-[var(--ac-background)]/90 px-4 py-3 backdrop-blur md:px-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="lg:hidden">
                                <BrandMark />
                            </div>

                            <div className="hidden lg:block">
                                <Link
                                    href="/"
                                    className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
                                >
                                    <Home
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Inicio
                                </Link>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="flex size-11 items-center justify-center rounded-xl text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
                                    aria-label="Ayuda"
                                >
                                    <HelpCircle
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </button>
                                <button
                                    type="button"
                                    className="flex size-11 items-center justify-center rounded-xl text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
                                    aria-label="Notificaciones"
                                >
                                    <Bell
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </button>
                                <Link
                                    href="/mi-perfil"
                                    className="flex size-11 items-center justify-center rounded-full bg-[var(--ac-primary-fixed)] text-sm font-bold text-[var(--ac-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
                                    aria-label="Abrir mi perfil"
                                >
                                    AC
                                </Link>
                            </div>
                        </div>

                        <nav
                            className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden"
                            aria-label="Navegación móvil"
                        >
                            {navItems.slice(0, 4).map((item) => {
                                const Icon = item.icon;
                                const active = url.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={cn(
                                            'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold',
                                            active
                                                ? 'bg-[var(--ac-primary)] text-white'
                                                : 'bg-white text-[var(--ac-on-surface-variant)]',
                                        )}
                                    >
                                        <Icon
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </header>

                    <main className="flex-1">{children}</main>
                </div>
            </div>
        </div>
    );
}

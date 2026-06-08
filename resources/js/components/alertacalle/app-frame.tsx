import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    ClipboardList,
    HelpCircle,
    Home,
    Map,
    Moon,
    PlusCircle,
    Settings,
    ShieldCheck,
    Sun,
    UserRound,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Mapa',      href: '/mapa',      icon: Map          },
    { label: 'Reportar',  href: '/reportar',  icon: PlusCircle   },
    { label: 'Reportes',  href: '/reportes',  icon: ClipboardList},
    { label: 'Mi Perfil', href: '/mi-perfil', icon: UserRound    },
    { label: 'Ajustes',   href: '/ajustes',   icon: Settings     },
];

function BrandMark() {
    return (
        <Link
            href="/"
            className="group flex min-h-11 items-center gap-3 rounded-xl px-1 focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
        >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ac-primary)] text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
                <span className="block text-lg leading-5 font-bold text-[var(--ac-primary)] transition-colors group-hover:opacity-80">
                    ZDanger
                </span>
                <span className="text-xs font-medium text-[var(--ac-on-surface-variant)]">
                    Seguridad ciudadana
                </span>
            </span>
        </Link>
    );
}

function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    return (
        <button
            type="button"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="group relative flex size-11 items-center justify-center overflow-hidden rounded-xl text-[var(--ac-on-surface-variant)] transition-all duration-200 hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none active:scale-95"
        >
            <Sun
                className={cn(
                    'absolute size-5 transition-all duration-300',
                    isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0',
                )}
            />
            <Moon
                className={cn(
                    'absolute size-5 transition-all duration-300',
                    isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
                )}
            />
        </button>
    );
}

export function AppFrame({ children }: PropsWithChildren) {
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-[var(--ac-background)] text-[var(--ac-on-surface)] transition-colors duration-300">
            <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[280px_1fr]">

                {/* ── Sidebar desktop ── */}
                <aside className="hidden border-r border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] px-4 py-6 lg:flex lg:flex-col transition-colors duration-300">
                    <div className="px-1">
                        <BrandMark />
                    </div>

                    <nav className="mt-8 flex-1 space-y-1" aria-label="Navegación principal">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = url.startsWith(item.href);

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        'group relative flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold',
                                        'transition-all duration-200',
                                        'focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none',
                                        active
                                            ? 'bg-[var(--ac-primary-fixed)] text-[var(--ac-primary)] shadow-sm'
                                            : 'text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)] hover:translate-x-0.5 active:scale-[0.98]',
                                    )}
                                >
                                    {/* active indicator */}
                                    {active && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[var(--ac-primary)]" />
                                    )}
                                    <Icon
                                        className={cn(
                                            'size-[18px] shrink-0 transition-transform duration-200',
                                            !active && 'group-hover:scale-110',
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* bottom actions */}
                    <div className="mt-auto space-y-1 border-t border-[var(--ac-outline-variant)] pt-4">
                        <ThemeToggle />
                    </div>
                </aside>

                {/* ── Contenido principal ── */}
                <div className="flex min-w-0 flex-col">
                    {/* header sticky */}
                    <header className="sticky top-0 z-30 border-b border-[var(--ac-outline-variant)] bg-[var(--ac-background)]/90 px-4 py-3 backdrop-blur-md transition-colors duration-300 md:px-8">
                        <div className="flex items-center justify-between gap-4">
                            {/* logo mobile */}
                            <div className="lg:hidden">
                                <BrandMark />
                            </div>

                            {/* breadcrumb desktop */}
                            <div className="hidden lg:block">
                                <Link
                                    href="/"
                                    className="inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--ac-on-surface-variant)] transition-all hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none active:scale-95"
                                >
                                    <Home className="size-4" aria-hidden="true" />
                                    Inicio
                                </Link>
                            </div>

                            {/* actions */}
                            <div className="flex items-center gap-1">
                                <ThemeToggle />

                                <button
                                    type="button"
                                    className="relative flex size-11 items-center justify-center rounded-xl text-[var(--ac-on-surface-variant)] transition-all hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none active:scale-95"
                                    aria-label="Ayuda"
                                >
                                    <HelpCircle className="size-5" aria-hidden="true" />
                                </button>

                                <button
                                    type="button"
                                    className="relative flex size-11 items-center justify-center rounded-xl text-[var(--ac-on-surface-variant)] transition-all hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none active:scale-95"
                                    aria-label="Notificaciones"
                                >
                                    <Bell className="size-5" aria-hidden="true" />
                                    {/* dot */}
                                    <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500 ring-2 ring-[var(--ac-background)]" />
                                </button>

                                <Link
                                    href="/mi-perfil"
                                    className="flex size-11 items-center justify-center rounded-full bg-[var(--ac-primary)] text-sm font-bold text-white ring-2 ring-[var(--ac-primary-fixed)] transition-all hover:opacity-90 hover:ring-[var(--ac-primary-fixed-dim)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none active:scale-95"
                                    aria-label="Abrir mi perfil"
                                >
                                    AC
                                </Link>
                            </div>
                        </div>

                        {/* nav mobile */}
                        <nav
                            className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:hidden"
                            aria-label="Navegación móvil"
                        >
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = url.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={cn(
                                            'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-200 active:scale-95',
                                            active
                                                ? 'bg-[var(--ac-primary)] text-white shadow-sm'
                                                : 'bg-[var(--ac-surface-container)] text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container-high)]',
                                        )}
                                    >
                                        <Icon className="size-4" aria-hidden="true" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </header>

                    <main className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

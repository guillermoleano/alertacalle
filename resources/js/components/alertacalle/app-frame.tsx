import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    BellOff,
    ClipboardList,
    HelpCircle,
    Home,
    Map,
    MapPin,
    Moon,
    PlusCircle,
    Settings,
    ShieldCheck,
    Sun,
    UserRound,
} from 'lucide-react';
import { useEffect, useRef, useState  } from 'react';
import type {PropsWithChildren} from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

type NotificationItem = {
    id: string;
    kind: 'zone' | 'validation';
    title: string;
    description: string;
    reportId: number;
    time: string;
    at: string;
};

type NotificationsProp = {
    unread: number;
    items: NotificationItem[];
};

const navItems = [
    { label: 'Mapa', href: '/mapa', icon: Map },
    { label: 'Reportar', href: '/reportar', icon: PlusCircle },
    { label: 'Reportes', href: '/reportes', icon: ClipboardList },
    { label: 'Mi Perfil', href: '/mi-perfil', icon: UserRound },
    { label: 'Ajustes', href: '/ajustes', icon: Settings },
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
            aria-label={
                isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
            }
            className="group relative flex size-11 items-center justify-center overflow-hidden rounded-xl text-[var(--ac-on-surface-variant)] transition-all duration-200 hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none active:scale-95"
        >
            <Sun
                className={cn(
                    'absolute size-5 transition-all duration-300',
                    isDark
                        ? 'scale-100 rotate-0 opacity-100'
                        : 'scale-0 rotate-90 opacity-0',
                )}
            />
            <Moon
                className={cn(
                    'absolute size-5 transition-all duration-300',
                    isDark
                        ? 'scale-0 -rotate-90 opacity-0'
                        : 'scale-100 rotate-0 opacity-100',
                )}
            />
        </button>
    );
}

function NotificationBell() {
    const notifications = usePage<{ notifications?: NotificationsProp }>().props
        .notifications ?? { unread: 0, items: [] };
    const { unread, items } = notifications;

    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // cerrar al hacer click afuera o con Escape
    useEffect(() => {
        if (!open) {
return;
}

        function onPointer(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
setOpen(false);
}
        }

        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    function toggle() {
        const next = !open;
        setOpen(next);

        // al abrir, marcamos como visto (solo refresca la prop compartida)
        if (next && unread > 0) {
            router.post(
                '/notificaciones/visto',
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['notifications'],
                },
            );
        }
    }

    const hrefFor = (item: NotificationItem) =>
        item.kind === 'validation' ? '/mi-perfil' : '/mapa';

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={toggle}
                aria-label="Notificaciones"
                aria-expanded={open}
                className="relative flex size-11 items-center justify-center rounded-xl text-[var(--ac-on-surface-variant)] transition-all hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none active:scale-95"
            >
                <Bell className="size-5" aria-hidden="true" />
                {unread > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-[var(--ac-background)]">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right animate-in overflow-hidden rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] shadow-[0_8px_32px_rgba(19,27,46,0.18)] duration-150 zoom-in-95 fade-in">
                    <div className="flex items-center justify-between border-b border-[var(--ac-outline-variant)]/60 px-4 py-3">
                        <p className="text-sm font-bold text-[var(--ac-on-surface)]">
                            Notificaciones
                        </p>
                        {items.length > 0 && (
                            <span className="text-[11px] font-medium text-[var(--ac-on-surface-variant)]">
                                {items.length}{' '}
                                {items.length === 1 ? 'novedad' : 'novedades'}
                            </span>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                            <span className="flex size-12 items-center justify-center rounded-full bg-[var(--ac-surface-container)]">
                                <BellOff className="size-5 text-[var(--ac-on-surface-variant)]" />
                            </span>
                            <p className="text-[13px] font-semibold text-[var(--ac-on-surface)]">
                                Sin novedades por ahora
                            </p>
                            <p className="text-[12px] leading-5 text-[var(--ac-on-surface-variant)]">
                                Te avisaremos de reportes cerca de tus zonas y
                                de validaciones a tus reportes.
                            </p>
                        </div>
                    ) : (
                        <ul className="max-h-96 divide-y divide-[var(--ac-outline-variant)]/40 overflow-y-auto">
                            {items.map((item) => {
                                const Icon =
                                    item.kind === 'validation'
                                        ? ShieldCheck
                                        : MapPin;

                                return (
                                    <li key={item.id}>
                                        <Link
                                            href={hrefFor(item)}
                                            onClick={() => setOpen(false)}
                                            className="flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--ac-surface-container-low)]"
                                        >
                                            <span
                                                className={cn(
                                                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl',
                                                    item.kind === 'validation'
                                                        ? 'bg-[var(--ac-secondary-fixed)] text-[var(--ac-secondary)]'
                                                        : 'bg-[var(--ac-primary-fixed)] text-[var(--ac-primary)]',
                                                )}
                                            >
                                                <Icon className="size-[18px]" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-semibold text-[var(--ac-on-surface)]">
                                                    {item.title}
                                                </p>
                                                <p className="truncate text-[12px] text-[var(--ac-on-surface-variant)]">
                                                    {item.description}
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-[var(--ac-outline)]">
                                                    {item.time}
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export function AppFrame({ children }: PropsWithChildren) {
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-[var(--ac-background)] text-[var(--ac-on-surface)] transition-colors duration-300">
            <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[280px_1fr]">
                {/* ── Sidebar desktop ── */}
                <aside className="hidden border-r border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] px-4 py-6 transition-colors duration-300 lg:flex lg:flex-col">
                    <div className="px-1">
                        <BrandMark />
                    </div>

                    <nav
                        className="mt-8 flex-1 space-y-1"
                        aria-label="Navegación principal"
                    >
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
                                            : 'text-[var(--ac-on-surface-variant)] hover:translate-x-0.5 hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)] active:scale-[0.98]',
                                    )}
                                >
                                    {/* active indicator */}
                                    {active && (
                                        <span className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--ac-primary)]" />
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
                                    <Home
                                        className="size-4"
                                        aria-hidden="true"
                                    />
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
                                    <HelpCircle
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </button>

                                <NotificationBell />

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
                            className="mt-3 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 lg:hidden"
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

                    <main className="flex-1 animate-in duration-300 fade-in slide-in-from-bottom-2">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

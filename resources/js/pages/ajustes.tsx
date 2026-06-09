import { Head, router, usePage } from '@inertiajs/react';
import {
    Bell,
    Check,
    ChevronRight,
    Download,
    Eye,
    EyeOff,
    FileText,
    Globe,
    KeyRound,
    Loader2,
    LocateFixed,
    LogOut,
    Mail,
    MapPin,
    Moon,
    Palette,
    Search,
    Settings,
    Shield,
    Smartphone,
    Sun,
    SunMoon,
    Trash2,
    TrendingUp,
    User,
    Volume2,
    Wifi,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { AppFrame } from '@/components/alertacalle/app-frame';
import { useStagger } from '@/hooks/use-stagger';
import { forwardGeocode, reverseGeocode } from '@/lib/mapbox-geocode';
import { cn } from '@/lib/utils';

type Zone = {
    id: number;
    label: string;
    lat: number;
    lng: number;
    radius: number;
    active: boolean;
};

/* ─── tiny primitives ───────────────────────────────────────── */

function SectionHeader({
    icon: Icon,
    title,
    subtitle,
    accent = 'primary',
}: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    accent?: 'primary' | 'secondary' | 'amber' | 'error';
}) {
    const colors = {
        primary: {
            wrap: 'from-[var(--ac-primary-fixed)]/40 to-white',
            bg: 'bg-[var(--ac-primary-fixed)]',
            icon: 'text-[var(--ac-primary)]',
        },
        secondary: {
            wrap: 'from-[var(--ac-secondary-fixed)]/30 to-white',
            bg: 'bg-[var(--ac-secondary-fixed)]',
            icon: 'text-[var(--ac-secondary)]',
        },
        amber: {
            wrap: 'from-amber-50 to-white',
            bg: 'bg-amber-100',
            icon: 'text-amber-700',
        },
        error: {
            wrap: 'from-red-50 to-white',
            bg: 'bg-red-100',
            icon: 'text-red-600',
        },
    };
    const c = colors[accent];

    return (
        <div
            className={cn(
                'flex items-center gap-3 border-b border-[var(--ac-outline-variant)]/60 bg-gradient-to-r px-6 py-4',
                c.wrap,
            )}
        >
            <span
                className={cn(
                    'flex size-9 items-center justify-center rounded-xl',
                    c.bg,
                )}
            >
                <Icon className={cn('size-[18px]', c.icon)} />
            </span>
            <div>
                <p className="text-[15px] font-semibold text-[var(--ac-on-surface)]">
                    {title}
                </p>
                <p className="text-[12px] text-[var(--ac-on-surface-variant)]">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}

function SettingRow({
    icon: Icon,
    label,
    sub,
    right,
    onClick,
    danger = false,
}: {
    icon: React.ElementType;
    label: string;
    sub?: string;
    right?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
}) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'group flex items-center justify-between px-6 py-4 transition-all duration-150',
                onClick &&
                    'cursor-pointer hover:translate-x-0.5 hover:bg-[var(--ac-surface-container-low)] active:scale-[0.99]',
            )}
        >
            <div className="flex items-center gap-3">
                <Icon
                    className={cn(
                        'size-[18px] shrink-0',
                        danger
                            ? 'text-red-500'
                            : 'text-[var(--ac-on-surface-variant)]',
                    )}
                />
                <div>
                    <p
                        className={cn(
                            'text-[14px] font-medium',
                            danger
                                ? 'text-red-600'
                                : 'text-[var(--ac-on-surface)]',
                        )}
                    >
                        {label}
                    </p>
                    {sub && (
                        <p className="text-[12px] text-[var(--ac-on-surface-variant)]">
                            {sub}
                        </p>
                    )}
                </div>
            </div>
            {right ??
                (onClick && (
                    <ChevronRight className="size-4 text-[var(--ac-outline)] transition-transform group-hover:translate-x-0.5" />
                ))}
        </div>
    );
}

function Toggle({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={cn(
                'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-250 focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none',
                checked
                    ? 'bg-[var(--ac-secondary)]'
                    : 'bg-[var(--ac-outline-variant)]',
            )}
        >
            <span
                className={cn(
                    'absolute top-[3px] size-[18px] rounded-full bg-white shadow transition-all duration-250',
                    checked ? 'left-[23px]' : 'left-[3px]',
                )}
                style={{
                    transition:
                        'left 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms',
                    boxShadow: checked
                        ? '0 1px 6px rgba(0,107,95,0.30)'
                        : '0 1px 4px rgba(0,0,0,0.18)',
                }}
            />
        </button>
    );
}

function Chips({
    options,
    value,
    onChange,
}: {
    options: { value: string; label: string; icon?: React.ElementType }[];
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((o) => {
                const Icon = o.icon;
                const active = value === o.value;

                return (
                    <button
                        key={o.value}
                        type="button"
                        onClick={() => onChange(o.value)}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12px] font-semibold transition-all duration-200 active:scale-95',
                            active
                                ? 'border-[var(--ac-primary)] bg-[var(--ac-primary)] text-white'
                                : 'border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container)]',
                        )}
                    >
                        {Icon && <Icon className="size-3.5" />}
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}

/* ─── Delete modal ──────────────────────────────────────────── */
function DeleteModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-sm animate-in rounded-2xl border border-red-200 bg-white p-6 shadow-2xl duration-200 zoom-in-95">
                <div className="flex flex-col items-center text-center">
                    <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                        <Trash2 className="size-7 text-red-600" />
                    </span>
                    <h3 className="text-lg font-bold text-[var(--ac-on-surface)]">
                        ¿Eliminar cuenta?
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--ac-on-surface-variant)]">
                        Esta acción es{' '}
                        <strong>permanente e irreversible</strong>. Perderás
                        todos tus reportes, tu reputación y tu historial.
                    </p>
                </div>
                <div className="mt-6 grid gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-11 w-full rounded-xl bg-[var(--ac-primary)] text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                    >
                        Cancelar, mantener cuenta
                    </button>
                    <button
                        type="button"
                        className="min-h-11 w-full rounded-xl border border-red-300 text-sm font-bold text-red-600 transition-all hover:bg-red-50 active:scale-95"
                    >
                        Sí, eliminar todo
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Zone row ───────────────────────────────────────────────── */
function ZoneRow({
    zone,
    onEdit,
    onDelete,
}: {
    zone: Zone;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="group flex items-center justify-between px-6 py-4 transition-all hover:bg-[var(--ac-surface-container-low)]">
            <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--ac-secondary-fixed)] text-[var(--ac-secondary)] transition-colors">
                    <MapPin className="size-5" />
                </span>
                <div>
                    <p className="text-[14px] font-semibold text-[var(--ac-on-surface)]">
                        {zone.label}
                    </p>
                    <p className="text-[12px] text-[var(--ac-on-surface-variant)]">
                        {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)} ·{' '}
                        {zone.radius} m
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    type="button"
                    onClick={onEdit}
                    aria-label={`Editar zona ${zone.label}`}
                    className="flex size-8 items-center justify-center rounded-lg text-[var(--ac-outline)] transition-colors hover:bg-[var(--ac-surface-container)] hover:text-[var(--ac-primary)]"
                >
                    <Settings className="size-4" />
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    aria-label={`Eliminar zona ${zone.label}`}
                    className="flex size-8 items-center justify-center rounded-lg text-[var(--ac-outline)] transition-colors hover:bg-red-50 hover:text-red-500"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>
        </div>
    );
}

/* ─── Zone form modal ────────────────────────────────────────── */
const RADIUS_OPTIONS = [300, 500, 800, 1000];

function ZoneFormModal({
    zone,
    onClose,
}: {
    zone: Zone | null;
    onClose: () => void;
}) {
    const [label, setLabel] = useState(zone?.label ?? '');
    const [address, setAddress] = useState('');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
        zone ? { lat: zone.lat, lng: zone.lng } : null,
    );
    const [radius, setRadius] = useState(zone?.radius ?? 500);
    const [geoStatus, setGeoStatus] = useState<
        'idle' | 'locating' | 'searching' | 'error'
    >('idle');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const canSubmit = label.trim().length > 0 && coords !== null;

    async function searchAddress() {
        if (!address.trim()) {
return;
}

        setGeoStatus('searching');
        const r = await forwardGeocode(address);

        if (r) {
            setCoords({ lat: r.lat, lng: r.lng });
            setGeoStatus('idle');
        } else {
            setGeoStatus('error');
        }
    }

    function useMyLocation() {
        if (!navigator.geolocation) {
            setGeoStatus('error');

            return;
        }

        setGeoStatus('locating');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setCoords({ lat, lng });
                const r = await reverseGeocode(lat, lng);

                if (r) {
                    setAddress(r.placeName.split(',')[0] ?? r.placeName);
                }

                setGeoStatus('idle');
            },
            () => setGeoStatus('error'),
            { enableHighAccuracy: true, timeout: 10000 },
        );
    }

    function submit() {
        if (!canSubmit || processing) {
return;
}

        const payload = {
            label: label.trim(),
            latitude: coords!.lat,
            longitude: coords!.lng,
            radius_meters: radius,
        };
        const options = {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onError: (e: Record<string, string>) => setErrors(e),
            onSuccess: () => onClose(),
            onFinish: () => setProcessing(false),
        };

        if (zone) {
            router.put(`/zonas/${zone.id}`, payload, options);
        } else {
            router.post('/zonas', payload, options);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md animate-in overflow-hidden rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] shadow-2xl duration-200 zoom-in-95">
                {/* header */}
                <div className="flex items-center justify-between border-b border-[var(--ac-outline-variant)]/60 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--ac-secondary-fixed)]">
                            <MapPin className="size-[18px] text-[var(--ac-secondary)]" />
                        </span>
                        <p className="text-[15px] font-semibold text-[var(--ac-on-surface)]">
                            {zone ? 'Editar zona' : 'Nueva zona de alerta'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="flex size-8 items-center justify-center rounded-lg text-[var(--ac-outline)] transition-colors hover:bg-[var(--ac-surface-container)]"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* body */}
                <div className="space-y-4 px-6 py-5">
                    {/* nombre */}
                    <label className="grid gap-1.5">
                        <span className="text-[13px] font-semibold text-[var(--ac-on-surface)]">
                            Nombre
                        </span>
                        <input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            maxLength={60}
                            placeholder="Ej: Casa, Trabajo, Gym"
                            className={cn(
                                'min-h-11 rounded-xl border bg-[var(--ac-surface-container-lowest)] px-4 text-sm text-[var(--ac-on-surface)] outline-none focus:ring-2 focus:ring-[var(--ac-primary)]',
                                errors.label
                                    ? 'border-red-400'
                                    : 'border-[var(--ac-outline-variant)]',
                            )}
                        />
                        {errors.label && (
                            <span className="text-[11px] font-medium text-red-500">
                                {errors.label}
                            </span>
                        )}
                    </label>

                    {/* dirección + acciones */}
                    <label className="grid gap-1.5">
                        <span className="text-[13px] font-semibold text-[var(--ac-on-surface)]">
                            Dirección
                        </span>
                        <div className="flex gap-2">
                            <input
                                value={address}
                                onChange={(e) => {
                                    setAddress(e.target.value);

                                    if (!zone) {
setCoords(null);
}
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        searchAddress();
                                    }
                                }}
                                placeholder="Ej: Calle 72 #13-54"
                                className="min-h-11 flex-1 rounded-xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] px-4 text-sm text-[var(--ac-on-surface)] outline-none focus:ring-2 focus:ring-[var(--ac-primary)]"
                            />
                            <button
                                type="button"
                                onClick={searchAddress}
                                disabled={
                                    !address.trim() || geoStatus === 'searching'
                                }
                                aria-label="Buscar dirección"
                                className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--ac-outline-variant)] px-3 text-[var(--ac-primary)] transition-colors hover:bg-[var(--ac-surface-container)] active:scale-95 disabled:opacity-50"
                            >
                                {geoStatus === 'searching' ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Search className="size-4" />
                                )}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={useMyLocation}
                            disabled={geoStatus === 'locating'}
                            className="mt-0.5 inline-flex w-fit items-center gap-1.5 text-[12px] font-semibold text-[var(--ac-primary)] transition-opacity hover:opacity-80 disabled:opacity-60"
                        >
                            {geoStatus === 'locating' ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />{' '}
                                    Ubicando…
                                </>
                            ) : (
                                <>
                                    <LocateFixed className="size-3.5" /> Usar mi
                                    ubicación
                                </>
                            )}
                        </button>

                        {coords && (
                            <span className="inline-flex w-fit items-center gap-1 rounded-lg bg-[var(--ac-secondary-fixed)] px-2 py-1 text-[11px] font-bold text-[var(--ac-secondary)]">
                                <Check className="size-3" /> Ubicación fijada (
                                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                                )
                            </span>
                        )}
                        {geoStatus === 'error' && (
                            <span className="text-[11px] font-medium text-red-500">
                                No se pudo resolver la ubicación. Probá otra
                                dirección o usá tu ubicación.
                            </span>
                        )}
                    </label>

                    {/* radio */}
                    <div className="grid gap-1.5">
                        <span className="text-[13px] font-semibold text-[var(--ac-on-surface)]">
                            Radio de alerta
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {RADIUS_OPTIONS.map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRadius(r)}
                                    className={cn(
                                        'rounded-full border px-4 py-2 text-[12px] font-semibold transition-all duration-200 active:scale-95',
                                        radius === r
                                            ? 'border-[var(--ac-primary)] bg-[var(--ac-primary)] text-white'
                                            : 'border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] text-[var(--ac-on-surface-variant)] hover:bg-[var(--ac-surface-container)]',
                                    )}
                                >
                                    {r} m
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* footer */}
                <div className="flex items-center justify-end gap-2 border-t border-[var(--ac-outline-variant)]/60 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-11 rounded-xl border border-[var(--ac-outline-variant)] px-5 text-sm font-bold text-[var(--ac-on-surface)] transition-all hover:bg-[var(--ac-surface-container)] active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={!canSubmit || processing}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--ac-secondary)] px-6 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Check className="size-4" />
                        )}
                        {zone ? 'Guardar cambios' : 'Crear zona'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main page ──────────────────────────────────────────────── */
type AuthUser = { name: string; email: string } | null;

export default function Ajustes() {
    const page = usePage<{ auth: { user: AuthUser }; zones: Zone[] }>().props;
    const user = page.auth.user;
    const zones = page.zones ?? [];

    /* alert zones modal */
    const [zoneModal, setZoneModal] = useState<{
        open: boolean;
        editing: Zone | null;
    }>({ open: false, editing: null });

    function deleteZone(zone: Zone) {
        if (!confirm(`¿Eliminar la zona "${zone.label}"?`)) {
return;
}

        router.delete(`/zonas/${zone.id}`, { preserveScroll: true });
    }

    /* notifications */
    const [notifCercanas, setNotifCercanas] = useState(true);
    const [notifValidaciones, setNotifValidaciones] = useState(true);
    const [notifResumen, setNotifResumen] = useState(false);
    const [notifOficiales, setNotifOficiales] = useState(true);
    const [soundMode, setSoundMode] = useState('activado');

    /* privacy */
    const [anonimo, setAnonimo] = useState(false);
    const [ubicacionExacta, setUbicacionExacta] = useState(true);
    const [datosUso, setDatosUso] = useState(true);

    /* appearance */
    const [theme, setTheme] = useState('auto');
    const [mapStyle, setMapStyle] = useState('estandar');
    const [fontSize, setFontSize] = useState(2);

    /* delete modal */
    const [showDelete, setShowDelete] = useState(false);

    const sectionsRef = useStagger<HTMLDivElement>(80, 40);

    const fontLabels: Record<number, string> = {
        1: 'Pequeño',
        2: 'Normal',
        3: 'Grande',
    };

    return (
        <AppFrame>
            <Head title="Ajustes" />

            <section className="px-4 py-8 md:px-8">
                <div ref={sectionsRef} className="mx-auto max-w-3xl space-y-5">
                    {/* ── page title ── */}
                    <div className="flex items-center gap-3">
                        <Settings className="size-6 text-[var(--ac-primary)]" />
                        <h1 className="text-2xl font-bold text-[var(--ac-on-surface)]">
                            Ajustes
                        </h1>
                    </div>

                    {/* ── 1. Cuenta ── */}
                    <div className="overflow-hidden rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] shadow-[0_2px_12px_rgba(19,27,46,0.06)]">
                        <SectionHeader
                            icon={User}
                            title="Cuenta"
                            subtitle="Información personal y verificación"
                            accent="primary"
                        />
                        <div className="divide-y divide-[var(--ac-outline-variant)]/40">
                            <SettingRow
                                icon={User}
                                label="Nombre completo"
                                sub={user?.name ?? 'Sin definir'}
                                onClick={() =>
                                    router.visit('/settings/profile')
                                }
                            />
                            <SettingRow
                                icon={Mail}
                                label="Correo electrónico"
                                sub={user?.email ?? 'Sin definir'}
                                onClick={() =>
                                    router.visit('/settings/profile')
                                }
                            />
                            <SettingRow
                                icon={KeyRound}
                                label="Contraseña"
                                sub="Cambiar contraseña"
                                onClick={() =>
                                    router.visit('/settings/security')
                                }
                            />
                        </div>
                    </div>

                    {/* ── 2. Notificaciones ── */}
                    <div className="overflow-hidden rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] shadow-[0_2px_12px_rgba(19,27,46,0.06)]">
                        <SectionHeader
                            icon={Bell}
                            title="Notificaciones"
                            subtitle="Cuándo y cómo te avisamos"
                            accent="secondary"
                        />
                        <div className="divide-y divide-[var(--ac-outline-variant)]/40">
                            <SettingRow
                                icon={Wifi}
                                label="Alertas cercanas"
                                sub="Incidentes a menos de 500m"
                                right={
                                    <Toggle
                                        checked={notifCercanas}
                                        onChange={() =>
                                            setNotifCercanas(!notifCercanas)
                                        }
                                    />
                                }
                            />
                            <SettingRow
                                icon={Shield}
                                label="Validaciones"
                                sub="Cuando validan tus reportes"
                                right={
                                    <Toggle
                                        checked={notifValidaciones}
                                        onChange={() =>
                                            setNotifValidaciones(
                                                !notifValidaciones,
                                            )
                                        }
                                    />
                                }
                            />
                            <SettingRow
                                icon={TrendingUp}
                                label="Resumen semanal"
                                sub="Estadísticas de tu zona"
                                right={
                                    <Toggle
                                        checked={notifResumen}
                                        onChange={() =>
                                            setNotifResumen(!notifResumen)
                                        }
                                    />
                                }
                            />
                            <SettingRow
                                icon={Globe}
                                label="Comunicados oficiales"
                                sub="Mensajes de las autoridades"
                                right={
                                    <Toggle
                                        checked={notifOficiales}
                                        onChange={() =>
                                            setNotifOficiales(!notifOficiales)
                                        }
                                    />
                                }
                            />
                            {/* Sound mode chips */}
                            <div className="px-6 py-4">
                                <div className="mb-3 flex items-center gap-3">
                                    <Volume2 className="size-[18px] text-[var(--ac-on-surface-variant)]" />
                                    <p className="text-[14px] font-medium text-[var(--ac-on-surface)]">
                                        Sonido de alertas
                                    </p>
                                </div>
                                <Chips
                                    options={[
                                        {
                                            value: 'activado',
                                            label: 'Activado',
                                        },
                                        {
                                            value: 'vibracion',
                                            label: 'Solo vibración',
                                        },
                                        {
                                            value: 'silencioso',
                                            label: 'Silencioso',
                                        },
                                    ]}
                                    value={soundMode}
                                    onChange={setSoundMode}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── 3. Privacidad ── */}
                    <div className="overflow-hidden rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] shadow-[0_2px_12px_rgba(19,27,46,0.06)]">
                        <SectionHeader
                            icon={Shield}
                            title="Privacidad"
                            subtitle="Control de tus datos"
                            accent="primary"
                        />
                        <div className="divide-y divide-[var(--ac-outline-variant)]/40">
                            <SettingRow
                                icon={EyeOff}
                                label="Reportar anónimamente"
                                sub="Tu nombre no aparece en reportes"
                                right={
                                    <Toggle
                                        checked={anonimo}
                                        onChange={() => setAnonimo(!anonimo)}
                                    />
                                }
                            />
                            <SettingRow
                                icon={MapPin}
                                label="Compartir ubicación exacta"
                                sub="Para reportes más precisos"
                                right={
                                    <Toggle
                                        checked={ubicacionExacta}
                                        onChange={() =>
                                            setUbicacionExacta(!ubicacionExacta)
                                        }
                                    />
                                }
                            />
                            <SettingRow
                                icon={Eye}
                                label="Datos de uso anónimos"
                                sub="Ayudanos a mejorar la app"
                                right={
                                    <Toggle
                                        checked={datosUso}
                                        onChange={() => setDatosUso(!datosUso)}
                                    />
                                }
                            />
                            <SettingRow
                                icon={Download}
                                label="Exportar mis datos"
                                sub="Descargá un resumen de tu actividad"
                                onClick={() => {}}
                            />
                            <SettingRow
                                icon={FileText}
                                label="Aviso de privacidad"
                                sub="Ver términos completos"
                                onClick={() => {}}
                            />
                        </div>
                    </div>

                    {/* ── 4. Apariencia ── */}
                    <div className="overflow-hidden rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] shadow-[0_2px_12px_rgba(19,27,46,0.06)]">
                        <SectionHeader
                            icon={Palette}
                            title="Apariencia"
                            subtitle="Tema y personalización visual"
                            accent="amber"
                        />
                        <div className="divide-y divide-[var(--ac-outline-variant)]/40">
                            {/* Theme */}
                            <div className="px-6 py-4">
                                <div className="mb-3 flex items-center gap-3">
                                    <SunMoon className="size-[18px] text-[var(--ac-on-surface-variant)]" />
                                    <p className="text-[14px] font-medium text-[var(--ac-on-surface)]">
                                        Tema de la interfaz
                                    </p>
                                </div>
                                <Chips
                                    options={[
                                        {
                                            value: 'claro',
                                            label: 'Claro',
                                            icon: Sun,
                                        },
                                        {
                                            value: 'oscuro',
                                            label: 'Oscuro',
                                            icon: Moon,
                                        },
                                        {
                                            value: 'auto',
                                            label: 'Auto',
                                            icon: SunMoon,
                                        },
                                    ]}
                                    value={theme}
                                    onChange={setTheme}
                                />
                            </div>
                            {/* Map style */}
                            <div className="px-6 py-4">
                                <div className="mb-3 flex items-center gap-3">
                                    <MapPin className="size-[18px] text-[var(--ac-on-surface-variant)]" />
                                    <p className="text-[14px] font-medium text-[var(--ac-on-surface)]">
                                        Estilo de mapa
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        {
                                            value: 'estandar',
                                            label: 'Estándar',
                                            bg: 'from-emerald-100 to-sky-100',
                                            textIcon: '🗺️',
                                        },
                                        {
                                            value: 'nocturno',
                                            label: 'Nocturno',
                                            bg: 'from-slate-800 to-slate-900',
                                            textIcon: '🌙',
                                        },
                                        {
                                            value: 'sincolor',
                                            label: 'Sin color',
                                            bg: 'from-gray-200 to-gray-300',
                                            textIcon: '⬜',
                                        },
                                    ].map((s) => (
                                        <button
                                            key={s.value}
                                            type="button"
                                            onClick={() => setMapStyle(s.value)}
                                            className={cn(
                                                'flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all duration-200 hover:shadow-md active:scale-95',
                                                mapStyle === s.value
                                                    ? 'border-[var(--ac-primary)]'
                                                    : 'border-[var(--ac-outline-variant)] hover:border-[var(--ac-primary-fixed-dim)]',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-br text-xl',
                                                    s.bg,
                                                )}
                                            >
                                                {s.textIcon}
                                            </div>
                                            <span
                                                className={cn(
                                                    'text-[12px] font-semibold',
                                                    mapStyle === s.value
                                                        ? 'text-[var(--ac-primary)]'
                                                        : 'text-[var(--ac-on-surface-variant)]',
                                                )}
                                            >
                                                {s.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Font size */}
                            <div className="px-6 py-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Settings className="size-[18px] text-[var(--ac-on-surface-variant)]" />
                                        <p className="text-[14px] font-medium text-[var(--ac-on-surface)]">
                                            Tamaño de texto
                                        </p>
                                    </div>
                                    <span className="text-[12px] font-semibold text-[var(--ac-primary)]">
                                        {fontLabels[fontSize]}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={1}
                                    value={fontSize}
                                    onChange={(e) =>
                                        setFontSize(Number(e.target.value))
                                    }
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-[var(--ac-primary)]"
                                />
                                <div className="mt-1.5 flex justify-between">
                                    <span className="text-[11px] text-[var(--ac-outline)]">
                                        Pequeño
                                    </span>
                                    <span className="text-[11px] text-[var(--ac-outline)]">
                                        Grande
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── 5. Zonas de alerta ── */}
                    <div className="overflow-hidden rounded-2xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] shadow-[0_2px_12px_rgba(19,27,46,0.06)]">
                        <div className="flex items-center justify-between border-b border-[var(--ac-outline-variant)]/60 bg-gradient-to-r from-[var(--ac-secondary-fixed)]/30 to-white px-6 py-4">
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--ac-secondary-fixed)]">
                                    <MapPin className="size-[18px] text-[var(--ac-secondary)]" />
                                </span>
                                <div>
                                    <p className="text-[15px] font-semibold text-[var(--ac-on-surface)]">
                                        Zonas de alerta
                                    </p>
                                    <p className="text-[12px] text-[var(--ac-on-surface-variant)]">
                                        {zones.length === 0
                                            ? 'Sin zonas configuradas'
                                            : `${zones.length} ${zones.length === 1 ? 'zona configurada' : 'zonas configuradas'}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setZoneModal({ open: true, editing: null })
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--ac-secondary)] px-3 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                            >
                                <span className="text-base leading-none">
                                    +
                                </span>
                                Nueva
                            </button>
                        </div>
                        {zones.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                                <span className="flex size-12 items-center justify-center rounded-full bg-[var(--ac-surface-container)]">
                                    <MapPin className="size-5 text-[var(--ac-on-surface-variant)]" />
                                </span>
                                <p className="text-[13px] font-semibold text-[var(--ac-on-surface)]">
                                    Todavía no tenés zonas
                                </p>
                                <p className="max-w-xs text-[12px] leading-5 text-[var(--ac-on-surface-variant)]">
                                    Creá una zona para recibir avisos de
                                    reportes cercanos a los lugares que te
                                    importan.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--ac-outline-variant)]/40">
                                {zones.map((zone) => (
                                    <ZoneRow
                                        key={zone.id}
                                        zone={zone}
                                        onEdit={() =>
                                            setZoneModal({
                                                open: true,
                                                editing: zone,
                                            })
                                        }
                                        onDelete={() => deleteZone(zone)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── 6. Zona de peligro ── */}
                    <div className="overflow-hidden rounded-2xl border border-red-200 bg-[var(--ac-surface-container-lowest)] shadow-[0_2px_12px_rgba(19,27,46,0.06)]">
                        <SectionHeader
                            icon={Smartphone}
                            title="Zona de peligro"
                            subtitle="Acciones irreversibles"
                            accent="error"
                        />
                        <div className="divide-y divide-red-100">
                            <SettingRow
                                icon={LogOut}
                                label="Cerrar sesión"
                                sub="Salir de esta cuenta"
                                onClick={() => {}}
                            />
                            <SettingRow
                                icon={Trash2}
                                label="Eliminar mi cuenta"
                                sub="Borra permanentemente todos tus datos"
                                onClick={() => setShowDelete(true)}
                                danger
                            />
                        </div>
                    </div>

                    {/* app info */}
                    <p className="pb-4 text-center text-[12px] text-[var(--ac-outline)]">
                        ZDanger v1.0.0-beta · Hecho con ❤️ en Colombia
                    </p>
                </div>
            </section>

            {showDelete && <DeleteModal onClose={() => setShowDelete(false)} />}

            {zoneModal.open && (
                <ZoneFormModal
                    zone={zoneModal.editing}
                    onClose={() => setZoneModal({ open: false, editing: null })}
                />
            )}
        </AppFrame>
    );
}

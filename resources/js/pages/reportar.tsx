import { Head, router } from '@inertiajs/react';
import {
    Camera, CheckCircle2, ChevronRight, Clock, EyeOff, Loader2,
    LocateFixed, MapPin, ShieldCheck, Upload, X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { AppFrame } from '@/components/alertacalle/app-frame';
import { incidentTypes } from '@/data/demo-reports';
import { forwardGeocode, reverseGeocode } from '@/lib/mapbox-geocode';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;
type GeoStatus = 'idle' | 'locating' | 'located' | 'error';

const steps = [
    { n: 1 as Step, label: 'Ubicación'  },
    { n: 2 as Step, label: 'Detalles'   },
    { n: 3 as Step, label: 'Evidencia'  },
];

type Coords = { lat: number; lng: number } | null;

export default function Reportar() {
    const [step,      setStep]      = useState<Step>(1);
    const [incType,   setIncType]   = useState(incidentTypes[0]);
    const [location,  setLocation]  = useState('');
    const [cross,     setCross]     = useState('');
    const [barrio,    setBarrio]    = useState('');
    const [datetime,  setDatetime]  = useState('');
    const [desc,      setDesc]      = useState('');
    const [anon,      setAnon]      = useState(true);
    const [files,     setFiles]     = useState<File[]>([]);
    const [coords,    setCoords]    = useState<Coords>(null);
    const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
    const [processing, setProcessing] = useState(false);
    const [errors,    setErrors]    = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canSubmit = location.trim().length > 0;

    // Si el usuario edita la dirección a mano, invalidamos las coords previas
    function onAddressChange(v: string) {
        setLocation(v);
        if (coords) { setCoords(null); setGeoStatus('idle'); }
    }

    /* ── Geolocalización del navegador ── */
    function useMyLocation() {
        if (!navigator.geolocation) { setGeoStatus('error'); return; }
        setGeoStatus('locating');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setCoords({ lat, lng });
                const r = await reverseGeocode(lat, lng);
                if (r) {
                    setLocation(r.placeName.split(',')[0] ?? r.placeName);
                    if (r.neighborhood) setBarrio(r.neighborhood);
                }
                setGeoStatus('located');
            },
            () => setGeoStatus('error'),
            { enableHighAccuracy: true, timeout: 10000 },
        );
    }

    /* ── Archivos de evidencia ── */
    function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
        const picked = Array.from(e.target.files ?? []);
        setFiles(f => [...f, ...picked].slice(0, 3));
        e.target.value = ''; // permitir re-seleccionar el mismo archivo
    }

    function removeFile(idx: number) {
        setFiles(f => f.filter((_, i) => i !== idx));
    }

    /* ── Envío ── */
    async function submit() {
        if (!canSubmit || processing) {
            if (!canSubmit) setStep(1); // falta la ubicación
            return;
        }

        const address = cross.trim()
            ? `${location.trim()} con ${cross.trim()}`
            : location.trim();

        // Si no tenemos coords (no usó "mi ubicación"), geocodificamos la dirección
        let resolved = coords;
        if (!resolved) {
            setProcessing(true);
            const r = await forwardGeocode(address);
            if (r) { resolved = { lat: r.lat, lng: r.lng }; setCoords(resolved); }
            setProcessing(false);
        }

        router.post('/reportar', {
            type:         incType,
            title:        incType,
            description:  desc || null,
            address,
            neighborhood: barrio || null,
            latitude:     resolved?.lat ?? null,
            longitude:    resolved?.lng ?? null,
            occurred_at:  datetime || null,
            anonymous:    anon ? 1 : 0,
            media:        files,
        }, {
            forceFormData: true,
            onStart:   () => setProcessing(true),
            onError:   (e) => setErrors(e as Record<string, string>),
            onFinish:  () => setProcessing(false),
        });
    }

    return (
        <AppFrame>
            <Head title="Nuevo reporte" />

            <section className="px-4 py-8 md:px-8">
                <div className="mx-auto max-w-2xl">

                    {/* ── header ── */}
                    <div className="mb-8">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ac-secondary)]">
                            Nuevo reporte
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-[var(--ac-primary)]">Reportar incidente</h1>
                        <p className="mt-2 text-sm leading-6 text-[var(--ac-on-surface-variant)]">
                            Evitá incluir nombres, caras o datos que identifiquen personas.
                        </p>
                    </div>

                    {/* ── step indicator ── */}
                    <div className="mb-8 flex items-center gap-0">
                        {steps.map((s, i) => (
                            <div key={s.n} className="flex flex-1 items-center">
                                <div className="flex flex-col items-center">
                                    <button
                                        type="button"
                                        onClick={() => s.n < step && setStep(s.n)}
                                        className={cn(
                                            'flex size-9 items-center justify-center rounded-full text-[13px] font-bold transition-all duration-200',
                                            step === s.n
                                                ? 'bg-[var(--ac-primary)] text-white shadow-md scale-110'
                                                : step > s.n
                                                    ? 'bg-[var(--ac-secondary)] text-white cursor-pointer hover:opacity-90'
                                                    : 'border-2 border-[var(--ac-outline-variant)] bg-white text-[var(--ac-on-surface-variant)]',
                                        )}
                                    >
                                        {step > s.n ? <CheckCircle2 className="size-4" /> : s.n}
                                    </button>
                                    <span className={cn(
                                        'mt-1.5 text-[11px] font-semibold',
                                        step === s.n ? 'text-[var(--ac-primary)]' : 'text-[var(--ac-on-surface-variant)]',
                                    )}>
                                        {s.label}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={cn(
                                        'mb-5 h-0.5 flex-1 mx-1 transition-all duration-300',
                                        step > s.n ? 'bg-[var(--ac-secondary)]' : 'bg-[var(--ac-outline-variant)]',
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ── card ── */}
                    <div className="rounded-2xl border border-[var(--ac-outline-variant)] bg-white shadow-[0_4px_24px_rgba(19,27,46,0.07)] overflow-hidden">

                        {/* ── STEP 1: Ubicación ── */}
                        {step === 1 && (
                            <div className="p-6 md:p-8 space-y-5 animate-in fade-in slide-in-from-right-4 duration-250">
                                <h2 className="text-[16px] font-bold text-[var(--ac-on-surface)]">¿Dónde ocurrió?</h2>

                                {/* mock map + geolocalización */}
                                <div className="relative h-36 overflow-hidden rounded-xl bg-[#eef1f8] border border-[var(--ac-outline-variant)]">
                                    <svg className="absolute inset-0 h-full w-full opacity-25" xmlns="http://www.w3.org/2000/svg">
                                        <defs><pattern id="g2" width="40" height="40" patternUnits="userSpaceOnUse">
                                            <path d="M40 0L0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.7"/>
                                        </pattern></defs>
                                        <rect width="100%" height="100%" fill="url(#g2)"/>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={cn(
                                            'flex size-10 items-center justify-center rounded-full border-2 bg-white shadow-md transition-colors',
                                            coords ? 'border-[var(--ac-secondary)]' : 'border-[var(--ac-primary)]',
                                        )}>
                                            <MapPin className={cn('size-5', coords ? 'text-[var(--ac-secondary)]' : 'text-[var(--ac-primary)]')} />
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={useMyLocation}
                                        disabled={geoStatus === 'locating'}
                                        className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] font-bold text-[var(--ac-primary)] shadow-sm backdrop-blur-sm transition-all hover:bg-white active:scale-95 disabled:opacity-60"
                                    >
                                        {geoStatus === 'locating'
                                            ? <><Loader2 className="size-3 animate-spin" /> Ubicando…</>
                                            : <><LocateFixed className="size-3" /> Mi ubicación</>}
                                    </button>
                                    {coords && (
                                        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-lg bg-[var(--ac-secondary)] px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                                            <CheckCircle2 className="size-3" /> Ubicación fijada
                                        </span>
                                    )}
                                    {geoStatus === 'error' && (
                                        <span className="absolute bottom-2 left-2 rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                                            No se pudo obtener tu ubicación
                                        </span>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="grid gap-1.5">
                                        <span className="text-[13px] font-semibold text-[var(--ac-on-surface)]">Calle / Avenida</span>
                                        <input
                                            value={location}
                                            onChange={e => onAddressChange(e.target.value)}
                                            className={cn(
                                                'min-h-11 rounded-xl border bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ac-primary)]',
                                                errors.address ? 'border-red-400' : 'border-[var(--ac-outline-variant)]',
                                            )}
                                            placeholder="Ej: Carrera 7 con Calle 72"
                                        />
                                        {errors.address && (
                                            <span className="text-[11px] font-medium text-red-500">{errors.address}</span>
                                        )}
                                    </label>
                                    <label className="grid gap-1.5">
                                        <span className="text-[13px] font-semibold text-[var(--ac-on-surface)]">Cruce / Referencia</span>
                                        <input
                                            value={cross}
                                            onChange={e => setCross(e.target.value)}
                                            className="min-h-11 rounded-xl border border-[var(--ac-outline-variant)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ac-primary)]"
                                            placeholder="Ej: con Pueyrredón"
                                        />
                                    </label>
                                    <label className="grid gap-1.5">
                                        <span className="text-[13px] font-semibold text-[var(--ac-on-surface)]">Barrio</span>
                                        <input
                                            value={barrio}
                                            onChange={e => setBarrio(e.target.value)}
                                            className="min-h-11 rounded-xl border border-[var(--ac-outline-variant)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ac-primary)]"
                                            placeholder="Ej: Palermo"
                                        />
                                    </label>
                                    <label className="grid gap-1.5">
                                        <span className="text-[13px] font-semibold text-[var(--ac-on-surface)] flex items-center gap-1.5">
                                            <Clock className="size-3.5 text-[var(--ac-primary)]" /> ¿Cuándo ocurrió?
                                        </span>
                                        <input
                                            type="datetime-local"
                                            value={datetime}
                                            onChange={e => setDatetime(e.target.value)}
                                            className="min-h-11 rounded-xl border border-[var(--ac-outline-variant)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ac-primary)]"
                                        />
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Detalles ── */}
                        {step === 2 && (
                            <div className="p-6 md:p-8 space-y-5 animate-in fade-in slide-in-from-right-4 duration-250">
                                <h2 className="text-[16px] font-bold text-[var(--ac-on-surface)]">¿Qué ocurrió?</h2>

                                {/* tipo de incidente */}
                                <div>
                                    <p className="mb-3 text-[13px] font-semibold text-[var(--ac-on-surface)]">Tipo de incidente</p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {incidentTypes.map(type => (
                                            <label
                                                key={type}
                                                className={cn(
                                                    'flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-[13px] font-semibold transition-all duration-150 hover:bg-[var(--ac-surface-container-low)] active:scale-[0.98]',
                                                    incType === type
                                                        ? 'border-[var(--ac-primary)] bg-[var(--ac-primary-fixed)] text-[var(--ac-primary)]'
                                                        : 'border-[var(--ac-outline-variant)] bg-white text-[var(--ac-on-surface-variant)]',
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    checked={incType === type}
                                                    onChange={() => setIncType(type)}
                                                    className="size-4 accent-[var(--ac-primary)]"
                                                />
                                                {type}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* descripción */}
                                <label className="grid gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] font-semibold text-[var(--ac-on-surface)]">Descripción</span>
                                        <span className={cn('text-[11px]', desc.length > 250 ? 'text-red-500' : 'text-[var(--ac-on-surface-variant)]')}>
                                            {desc.length}/280
                                        </span>
                                    </div>
                                    <textarea
                                        value={desc}
                                        onChange={e => setDesc(e.target.value)}
                                        maxLength={280}
                                        className="min-h-28 w-full resize-none rounded-xl border border-[var(--ac-outline-variant)] bg-white p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-[var(--ac-primary)]"
                                        placeholder="Ej: ocurrió frente al paradero, zona poco iluminada…"
                                    />
                                </label>

                                {/* anonimato */}
                                <div className="flex items-center justify-between rounded-xl bg-[var(--ac-surface-container-low)] px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <EyeOff className="size-4 text-[var(--ac-on-surface-variant)]" />
                                        <div>
                                            <p className="text-[13px] font-semibold text-[var(--ac-on-surface)]">Reportar anónimamente</p>
                                            <p className="text-[11px] text-[var(--ac-on-surface-variant)]">Tu nombre no será visible</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAnon(!anon)}
                                        className={cn(
                                            'relative h-6 w-11 rounded-full transition-colors duration-200',
                                            anon ? 'bg-[var(--ac-secondary)]' : 'bg-[var(--ac-outline-variant)]',
                                        )}
                                    >
                                        <span className={cn(
                                            'absolute top-[3px] size-[18px] rounded-full bg-white shadow transition-all duration-200',
                                            anon ? 'left-[23px]' : 'left-[3px]',
                                        )} style={{ transition: 'left 220ms cubic-bezier(0.34,1.56,0.64,1)' }} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Evidencia ── */}
                        {step === 3 && (
                            <div className="p-6 md:p-8 space-y-5 animate-in fade-in slide-in-from-right-4 duration-250">
                                <div>
                                    <h2 className="text-[16px] font-bold text-[var(--ac-on-surface)]">Evidencia (opcional)</h2>
                                    <p className="mt-1 text-[13px] text-[var(--ac-on-surface-variant)]">
                                        Una foto o video ayuda a validar el reporte. Máx. 3 archivos, 10 MB c/u.
                                    </p>
                                </div>

                                {/* input real (oculto) */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,video/mp4"
                                    multiple
                                    onChange={onPickFiles}
                                    className="hidden"
                                />

                                {/* upload area */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={files.length >= 3}
                                    className={cn(
                                        'flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 transition-all duration-200',
                                        files.length >= 3
                                            ? 'cursor-not-allowed border-[var(--ac-outline-variant)] opacity-50'
                                            : 'cursor-pointer border-[var(--ac-primary-fixed-dim)] hover:bg-[var(--ac-primary-fixed)]/20 active:scale-[0.99]',
                                    )}
                                >
                                    <span className="flex size-12 items-center justify-center rounded-full bg-[var(--ac-primary-fixed)]">
                                        <Upload className="size-5 text-[var(--ac-primary)]" />
                                    </span>
                                    <div className="text-center">
                                        <p className="text-[13px] font-semibold text-[var(--ac-primary)]">
                                            {files.length >= 3 ? 'Límite alcanzado' : 'Subir foto o video'}
                                        </p>
                                        <p className="text-[11px] text-[var(--ac-on-surface-variant)]">
                                            JPG, PNG, MP4 · Máx. 10 MB · {3 - files.length} restante{3 - files.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </button>

                                {errors['media.0'] && (
                                    <p className="text-[12px] font-medium text-red-500">
                                        Algún archivo no es válido (formato o tamaño). Máx. 10 MB, JPG/PNG/MP4.
                                    </p>
                                )}

                                {/* file previews con thumbnails */}
                                {files.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {files.map((f, i) => {
                                            const isVideo = f.type.startsWith('video');
                                            const url = URL.createObjectURL(f);
                                            return (
                                                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-low)]">
                                                    {isVideo ? (
                                                        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[var(--ac-secondary)]">
                                                            <Camera className="size-6" />
                                                            <span className="px-2 text-center text-[10px] font-semibold text-[var(--ac-on-surface-variant)] line-clamp-1">{f.name}</span>
                                                        </div>
                                                    ) : (
                                                        <img src={url} alt={f.name} className="h-full w-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(i)}
                                                        className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                                                    >
                                                        <X className="size-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* privacy note */}
                                <div className="flex gap-3 rounded-xl bg-[var(--ac-secondary-fixed)] p-4">
                                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--ac-secondary)]" />
                                    <p className="text-[12px] leading-5 text-[var(--ac-on-secondary-fixed)]">
                                        <strong>Tu reporte es anónimo por defecto.</strong> Las fotos no incluyen metadatos de ubicación al ser procesadas. Podés solicitar borrar tus datos desde Mi Perfil.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── footer buttons ── */}
                        <div className="flex items-center justify-between border-t border-[var(--ac-outline-variant)] px-6 py-4">
                            <button
                                type="button"
                                onClick={() => step > 1 && setStep((step - 1) as Step)}
                                className={cn(
                                    'min-h-11 rounded-xl px-5 text-sm font-bold transition-all active:scale-95',
                                    step === 1
                                        ? 'invisible'
                                        : 'border border-[var(--ac-outline-variant)] text-[var(--ac-on-surface)] hover:bg-[var(--ac-surface-container)]',
                                )}
                            >
                                Atrás
                            </button>

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep((step + 1) as Step)}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--ac-primary)] px-6 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                                >
                                    Siguiente <ChevronRight className="size-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={submit}
                                    disabled={processing}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--ac-secondary)] px-6 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="size-4" />
                                    {processing ? 'Enviando…' : 'Enviar reporte'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </AppFrame>
    );
}

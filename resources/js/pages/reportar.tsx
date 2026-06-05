import { Head } from '@inertiajs/react';
import { CheckCircle2, LocateFixed, ShieldCheck } from 'lucide-react';
import { AppFrame } from '@/components/alertacalle/app-frame';
import { incidentTypes } from '@/data/demo-reports';

export default function Reportar() {
    return (
        <AppFrame>
            <Head title="Nuevo reporte" />

            <section className="px-4 py-8 md:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8">
                        <p className="text-sm font-bold tracking-wide text-[var(--ac-secondary)] uppercase">
                            Nuevo reporte
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[var(--ac-primary)]">
                            Reportar incidente
                        </h1>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--ac-on-surface-variant)]">
                            Cuéntanos qué ocurrió, dónde ocurrió y cuándo. Evita
                            nombres, caras, placas, teléfonos o cualquier dato
                            que identifique a una persona.
                        </p>
                    </div>

                    <form className="grid gap-6 rounded-2xl border border-[var(--ac-outline-variant)] bg-white p-5 shadow-[0_10px_32px_rgba(15,23,42,0.06)] md:p-8">
                        <section>
                            <h2 className="text-lg font-bold text-[var(--ac-on-surface)]">
                                Tipo de incidente
                            </h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {incidentTypes.map((type, index) => (
                                    <label
                                        key={type}
                                        className="flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-lowest)] p-4 text-sm font-bold text-[var(--ac-on-surface)] has-[:checked]:border-[var(--ac-primary)] has-[:checked]:bg-[var(--ac-primary-fixed)]"
                                    >
                                        <input
                                            type="radio"
                                            name="incident_type"
                                            defaultChecked={index === 0}
                                            className="size-4 accent-[var(--ac-primary)]"
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section className="grid gap-4 md:grid-cols-2">
                            <label className="grid gap-2">
                                <span className="text-sm font-bold text-[var(--ac-on-surface)]">
                                    Ubicación o referencia
                                </span>
                                <span className="relative">
                                    <LocateFixed className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--ac-primary)]" />
                                    <input
                                        className="min-h-11 w-full rounded-xl border border-[var(--ac-outline-variant)] bg-white pr-4 pl-11 text-sm outline-none focus:ring-2 focus:ring-[var(--ac-primary)]"
                                        placeholder="Ej: paradero frente al parque"
                                        type="text"
                                    />
                                </span>
                            </label>
                            <label className="grid gap-2">
                                <span className="text-sm font-bold text-[var(--ac-on-surface)]">
                                    Momento aproximado
                                </span>
                                <input
                                    className="min-h-11 w-full rounded-xl border border-[var(--ac-outline-variant)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ac-primary)]"
                                    type="datetime-local"
                                />
                            </label>
                        </section>

                        <label className="grid gap-2">
                            <span className="text-sm font-bold text-[var(--ac-on-surface)]">
                                Descripción opcional
                            </span>
                            <textarea
                                className="min-h-28 w-full resize-none rounded-xl border border-[var(--ac-outline-variant)] bg-white p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-[var(--ac-primary)]"
                                maxLength={280}
                                placeholder="Ej: ocurrió frente al paradero, zona poco iluminada"
                            />
                            <span className="text-xs text-[var(--ac-on-surface-variant)]">
                                Máximo 280 caracteres. No publiques datos
                                personales ni señales que identifiquen terceros.
                            </span>
                        </label>

                        <div className="rounded-xl bg-[var(--ac-secondary-fixed)] p-4 text-sm leading-6 text-[var(--ac-on-secondary-fixed)]">
                            <p className="flex gap-2 font-bold">
                                <ShieldCheck
                                    className="mt-0.5 size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                Tu reporte será anónimo por defecto.
                            </p>
                            <p className="mt-1 pl-6">
                                La ubicación se usa para análisis de riesgo y
                                confianza comunitaria. Puedes solicitar borrar
                                tus datos desde Mi Perfil.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--ac-primary)] px-5 text-sm font-bold text-white hover:bg-[var(--ac-primary-container)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
                        >
                            <CheckCircle2
                                className="size-4"
                                aria-hidden="true"
                            />
                            Enviar reporte
                        </button>
                    </form>
                </div>
            </section>
        </AppFrame>
    );
}

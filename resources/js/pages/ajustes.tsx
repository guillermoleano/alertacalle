import { Head } from '@inertiajs/react';
import { AppFrame } from '@/components/alertacalle/app-frame';

export default function Ajustes() {
    return (
        <AppFrame>
            <Head title="Ajustes" />
            <section className="px-4 py-8 md:px-8">
                <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--ac-outline-variant)] bg-white p-8">
                    <p className="text-sm font-bold tracking-wide text-[var(--ac-secondary)] uppercase">
                        Fase 2
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-[var(--ac-primary)]">
                        Ajustes
                    </h1>
                    <p className="mt-3 text-base leading-7 text-[var(--ac-on-surface-variant)]">
                        Esta sección queda reservada para preferencias,
                        privacidad avanzada y notificaciones.
                    </p>
                </div>
            </section>
        </AppFrame>
    );
}

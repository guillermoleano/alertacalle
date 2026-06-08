import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

type PageWithFlash = {
    props?: { flash?: { toast?: FlashToast | null } };
};

/**
 * Muestra toasts a partir de `flash.toast` compartido por el backend.
 * Se monta dentro del <Toaster>, que vive FUERA del contexto de Inertia,
 * por eso usamos el bus de eventos del router en lugar de usePage().
 */
export function useFlashToast(): void {
    useEffect(() => {
        const show = (page: PageWithFlash | undefined) => {
            const data = page?.props?.flash?.toast;
            if (data) {
                toast[data.type](data.message);
            }
        };

        // Flash en la carga inicial
        show((router as unknown as { page?: PageWithFlash }).page);

        // Flash tras cada navegación/redirect (ej: enviar reporte)
        const off = router.on('navigate', (event) => {
            show((event as CustomEvent).detail?.page as PageWithFlash | undefined);
        });

        return off;
    }, []);
}

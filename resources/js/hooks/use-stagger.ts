import { useEffect, useRef } from 'react';

/**
 * Aplica una animación de entrada escalonada a los hijos directos
 * del elemento referenciado.
 *
 * Uso:
 *   const ref = useStagger<HTMLDivElement>();
 *   <div ref={ref}> ... children ... </div>
 *
 * Cada hijo recibe la clase `ac-stagger-item` que debe estar definida en CSS.
 */
export function useStagger<T extends HTMLElement>(
    delayStep = 60,     // ms entre cada hijo
    baseDelay = 40,     // ms de delay inicial
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const parent = ref.current;
        if (!parent) return;

        const children = Array.from(parent.children) as HTMLElement[];

        children.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(16px)';
            el.style.transition = 'opacity 0.38s cubic-bezier(0.16,1,0.3,1), transform 0.38s cubic-bezier(0.16,1,0.3,1)';

            const delay = baseDelay + i * delayStep;
            const timer = setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, delay);

            return () => clearTimeout(timer);
        });
    }, [delayStep, baseDelay]);

    return ref;
}

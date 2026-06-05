import { cn } from '@/lib/utils';

type RiskLevel = 'Alto' | 'Medio' | 'Bajo';

const styles: Record<RiskLevel, string> = {
    Alto: 'bg-red-50 text-red-700 ring-red-200',
    Medio: 'bg-amber-50 text-amber-700 ring-amber-200',
    Bajo: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const dotStyles: Record<RiskLevel, string> = {
    Alto: 'bg-red-500',
    Medio: 'bg-amber-500',
    Bajo: 'bg-emerald-500',
};

export function RiskBadge({
    level,
    className,
}: {
    level: RiskLevel;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex min-h-7 items-center gap-2 rounded-full px-3 text-xs font-bold ring-1',
                styles[level],
                className,
            )}
        >
            <span
                className={cn('size-2 rounded-full', dotStyles[level])}
                aria-hidden="true"
            />
            Riesgo {level}
        </span>
    );
}

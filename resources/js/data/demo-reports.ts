import type { ReportSummary } from '@/components/alertacalle/report-card';

export const demoReports: ReportSummary[] = [
    {
        id: 'r-001',
        title: 'Hurto de celular',
        type: 'Hurto celular',
        location: 'Calle 100 con Carrera 15',
        description:
            'Reporte cerca del cruce peatonal, alta afluencia y salida rápida hacia la avenida.',
        time: 'Hace 12 minutos',
        risk: 'Alto',
        trustScore: 82,
        confirms: 14,
        denies: 1,
    },
    {
        id: 'r-002',
        title: 'Atraco a pie',
        type: 'Atraco a pie',
        location: 'Paradero frente al parque',
        description:
            'Ocurrió junto al paradero en una zona con baja iluminación y poca visibilidad lateral.',
        time: 'Hace 35 minutos',
        risk: 'Medio',
        trustScore: 61,
        confirms: 8,
        denies: 2,
    },
    {
        id: 'r-003',
        title: 'Cosquilleo',
        type: 'Cosquilleo',
        location: 'Entrada estación norte',
        description:
            'Reporte en zona de filas y concentración de peatones durante hora pico.',
        time: 'Hace 1 hora',
        risk: 'Bajo',
        trustScore: 44,
        confirms: 5,
        denies: 1,
    },
];

export const incidentTypes = [
    'Atraco a pie',
    'Atraco en moto',
    'Fleteo',
    'Cosquilleo',
    'Hurto celular',
    'Intimidación con arma',
    'Otro',
];

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
        lat: 4.6869,
        lng: -74.0532,
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
        lat: 4.6772,
        lng: -74.0485,
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
        lat: 4.6950,
        lng: -74.0440,
    },
    {
        id: 'r-004',
        title: 'Atraco en moto',
        type: 'Atraco en moto',
        location: 'Av. El Dorado con Carrera 50',
        description:
            'Dos sujetos en motocicleta robaron a un peatón en el semáforo durante hora pico.',
        time: 'Hace 2 horas',
        risk: 'Alto',
        trustScore: 75,
        confirms: 11,
        denies: 0,
        lat: 4.6580,
        lng: -74.0910,
    },
    {
        id: 'r-005',
        title: 'Fleteo bancario',
        type: 'Fleteo',
        location: 'Salida Banco Popular Chapinero',
        description:
            'Víctima seguida desde el banco hasta la Calle 57. Le sustrajeron efectivo recién retirado.',
        time: 'Hace 3 horas',
        risk: 'Alto',
        trustScore: 90,
        confirms: 20,
        denies: 2,
        lat: 4.6440,
        lng: -74.0660,
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

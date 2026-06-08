<?php

namespace Database\Seeders;

use App\Models\Report;
use Illuminate\Database\Seeder;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        $reports = [
            [
                'type'          => 'Hurto celular',
                'title'         => 'Hurto de celular',
                'description'   => 'Reporte cerca del cruce peatonal, alta afluencia y salida rápida hacia la avenida.',
                'address'       => 'Calle 100 con Carrera 15',
                'neighborhood'  => 'Chicó',
                'city'          => 'Bogotá',
                'latitude'      => 4.6796,
                'longitude'     => -74.0476,
                'status'        => 'validated',
                'risk_level'    => 'Alto',
                'confirms_count'=> 14,
                'denies_count'  => 1,
                'trust_score'   => 82,
                'occurred_at'   => now()->subMinutes(12),
                'anonymous'     => true,
            ],
            [
                'type'          => 'Atraco a pie',
                'title'         => 'Atraco a pie',
                'description'   => 'Ocurrió junto al paradero en una zona con baja iluminación y poca visibilidad lateral.',
                'address'       => 'Paradero frente al parque',
                'neighborhood'  => 'Chapinero',
                'city'          => 'Bogotá',
                'latitude'      => 4.6340,
                'longitude'     => -74.0640,
                'status'        => 'validated',
                'risk_level'    => 'Medio',
                'confirms_count'=> 8,
                'denies_count'  => 2,
                'trust_score'   => 61,
                'occurred_at'   => now()->subMinutes(35),
                'anonymous'     => true,
            ],
            [
                'type'          => 'Cosquilleo',
                'title'         => 'Cosquilleo',
                'description'   => 'Reporte en zona de filas y concentración de peatones durante hora pico.',
                'address'       => 'Entrada estación norte',
                'neighborhood'  => 'Usaquén',
                'city'          => 'Bogotá',
                'latitude'      => 4.7090,
                'longitude'     => -74.0310,
                'status'        => 'pending',
                'risk_level'    => 'Bajo',
                'confirms_count'=> 5,
                'denies_count'  => 1,
                'trust_score'   => 44,
                'occurred_at'   => now()->subHour(),
                'anonymous'     => true,
            ],
            [
                'type'          => 'Atraco en moto',
                'title'         => 'Atraco en moto',
                'description'   => 'Dos personas en moto arrebatan bolso a peatón en la esquina del semáforo.',
                'address'       => 'Av. Caracas con Calle 57',
                'neighborhood'  => 'Teusaquillo',
                'city'          => 'Bogotá',
                'latitude'      => 4.6490,
                'longitude'     => -74.0660,
                'status'        => 'validated',
                'risk_level'    => 'Alto',
                'confirms_count'=> 11,
                'denies_count'  => 0,
                'trust_score'   => 90,
                'occurred_at'   => now()->subHours(2),
                'anonymous'     => false,
            ],
            [
                'type'          => 'Fleteo',
                'title'         => 'Fleteo bancario',
                'description'   => 'Persona fue seguida desde un cajero automático y le robaron el efectivo al llegar a su vehículo.',
                'address'       => 'Carrera 13 con Calle 93',
                'neighborhood'  => 'Zona Rosa',
                'city'          => 'Bogotá',
                'latitude'      => 4.6760,
                'longitude'     => -74.0490,
                'status'        => 'pending',
                'risk_level'    => 'Medio',
                'confirms_count'=> 3,
                'denies_count'  => 1,
                'trust_score'   => 55,
                'occurred_at'   => now()->subHours(4),
                'anonymous'     => true,
            ],
        ];

        foreach ($reports as $data) {
            Report::create($data);
        }
    }
}

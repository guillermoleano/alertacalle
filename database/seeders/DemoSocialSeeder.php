<?php

namespace Database\Seeders;

use App\Models\AlertZone;
use App\Models\Report;
use App\Models\ReportVote;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Datos de demostración para los flujos "sociales" (zonas + notificaciones +
 * validaciones), que de otro modo arrancan vacíos. Idempotente: limpia su propia
 * data demo (marcada) antes de recrearla. Pensado para entorno de desarrollo.
 *
 * Uso: php artisan db:seed --class=DemoSocialSeeder
 */
class DemoSocialSeeder extends Seeder
{
    private const ADDR_PREFIX = 'DEMO ·';

    public function run(): void
    {
        $primary = User::where('email', 'mariozapa@gmail.com')->first()
            ?? User::first();

        if (! $primary) {
            $this->command?->warn('No hay usuarios. Corré primero el DatabaseSeeder.');

            return;
        }

        $voter = User::where('email', 'test@example.com')->first()
            ?? User::where('id', '!=', $primary->id)->first()
            ?? User::factory()->create(['name' => 'Vecino Demo']);

        // ── limpieza idempotente de la data demo previa ──
        AlertZone::where('user_id', $primary->id)
            ->where('label', 'like', '%(demo)')
            ->delete();
        Report::where('address', 'like', self::ADDR_PREFIX.'%')->delete();

        // ── zonas de alerta del usuario principal ──
        $zones = [
            ['label' => 'Casa (demo)', 'lat' => 4.6510, 'lng' => -74.0580, 'radius' => 600],
            ['label' => 'Trabajo (demo)', 'lat' => 4.6760, 'lng' => -74.0490, 'radius' => 500],
        ];

        foreach ($zones as $zone) {
            AlertZone::create([
                'user_id' => $primary->id,
                'label' => $zone['label'],
                'latitude' => $zone['lat'],
                'longitude' => $zone['lng'],
                'radius_meters' => $zone['radius'],
                'active' => true,
            ]);

            // (a) reportes ajenos DENTRO de la zona → alertas "nuevo reporte cerca de…"
            foreach (['Hurto celular', 'Atraco en moto'] as $i => $type) {
                Report::create([
                    'user_id' => $voter->id,
                    'type' => $type,
                    'title' => $type,
                    'description' => "Reporte de demostración cerca de {$zone['label']}.",
                    'address' => self::ADDR_PREFIX." cerca de {$zone['label']}",
                    'neighborhood' => 'Bogotá',
                    'city' => 'Bogotá',
                    'latitude' => $zone['lat'] + 0.001 * ($i + 1),
                    'longitude' => $zone['lng'] - 0.001 * ($i + 1),
                    'status' => 'pending',
                    'risk_level' => 'Medio',
                    'occurred_at' => now()->subHours(2 * $i + 1),
                    'anonymous' => true,
                ]);
            }
        }

        // ── (b) reportes propios + votos de un tercero → "validaron tu reporte" ──
        $own = [
            ['type' => 'Fleteo', 'lat' => 4.6600, 'lng' => -74.0620],
            ['type' => 'Atraco a pie', 'lat' => 4.6450, 'lng' => -74.0700],
            ['type' => 'Intimidación con arma', 'lat' => 4.6700, 'lng' => -74.0550],
        ];

        foreach ($own as $i => $data) {
            $report = Report::create([
                'user_id' => $primary->id,
                'type' => $data['type'],
                'title' => $data['type'],
                'description' => 'Reporte propio de demostración.',
                'address' => self::ADDR_PREFIX." mi reporte {$i}",
                'neighborhood' => 'Bogotá',
                'city' => 'Bogotá',
                'latitude' => $data['lat'],
                'longitude' => $data['lng'],
                'status' => 'pending',
                'risk_level' => 'Medio',
                'occurred_at' => now()->subHours($i + 1),
                'anonymous' => false,
            ]);

            ReportVote::create([
                'report_id' => $report->id,
                'user_id' => $voter->id,
                'ip_address' => '127.0.0.1',
                'vote' => 'confirm',
            ]);
            $report->increment('confirms_count');
            $report->refresh();
            $report->recalculateTrust();
        }

        $this->command?->info("Demo social lista para {$primary->name}: ".
            count($zones).' zonas, '.(count($zones) * 2).' reportes en zona, '.
            count($own).' reportes propios validados.');
    }
}

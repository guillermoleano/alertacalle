<?php

namespace App\Support;

use App\Models\Report;
use App\Models\ReportVote;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Construye el feed de notificaciones in-app de un usuario, derivado en vivo de
 * los datos existentes (sin tabla persistida): reportes nuevos dentro de sus
 * zonas de alerta activas y confirmaciones recibidas en sus propios reportes.
 *
 * @phpstan-type AlertItem array{id:string, kind:'zone'|'validation', title:string, description:string, reportId:int, time:string, at:string}
 */
class UserAlerts
{
    private const WINDOW_DAYS = 30;

    private const MAX_ITEMS = 15;

    public function __construct(private readonly User $user) {}

    public static function for(User $user): self
    {
        return new self($user);
    }

    /**
     * @return array{unread:int, items:list<AlertItem>}
     */
    public function toArray(): array
    {
        $items = $this->zoneAlerts()
            ->concat($this->validationAlerts())
            ->sortByDesc('atTimestamp')
            ->take(self::MAX_ITEMS)
            ->values();

        $seenAt = $this->user->alerts_seen_at?->timestamp;

        $unread = $items->filter(
            fn (array $item): bool => $seenAt === null || $item['atTimestamp'] > $seenAt,
        )->count();

        return [
            'unread' => $unread,
            'items' => $items
                ->map(fn (array $item): array => collect($item)->except('atTimestamp')->all())
                ->all(),
        ];
    }

    /**
     * Reportes recientes (ajenos) que caen dentro de alguna zona activa.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function zoneAlerts(): Collection
    {
        $zones = $this->user->alertZones()->where('active', true)->get();

        if ($zones->isEmpty()) {
            return collect();
        }

        $reports = Report::query()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->where('status', '!=', 'rejected')
            ->where('created_at', '>=', now()->subDays(self::WINDOW_DAYS))
            ->where(function ($query): void {
                $query->whereNull('user_id')->orWhere('user_id', '!=', $this->user->id);
            })
            ->latest()
            ->limit(100)
            ->get();

        return $reports
            ->map(function (Report $report) use ($zones): ?array {
                $zone = $zones->first(fn ($zone): bool => $this->haversine(
                    $zone->latitude, $zone->longitude,
                    (float) $report->latitude, (float) $report->longitude,
                ) <= $zone->radius_meters);

                if ($zone === null) {
                    return null;
                }

                return [
                    'id' => "zone-{$report->id}",
                    'kind' => 'zone',
                    'title' => "Nuevo reporte cerca de {$zone->label}",
                    'description' => "{$report->type} · {$report->address}",
                    'reportId' => $report->id,
                    'time' => $report->created_at->diffForHumans(),
                    'at' => $report->created_at->toIso8601String(),
                    'atTimestamp' => $report->created_at->timestamp,
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * Confirmaciones recientes (de terceros) sobre los reportes del usuario.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function validationAlerts(): Collection
    {
        return ReportVote::query()
            ->where('vote', 'confirm')
            ->where('created_at', '>=', now()->subDays(self::WINDOW_DAYS))
            ->where(function ($query): void {
                $query->whereNull('user_id')->orWhere('user_id', '!=', $this->user->id);
            })
            ->whereHas('report', fn ($query) => $query->where('user_id', $this->user->id))
            ->with('report')
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (ReportVote $vote): array => [
                'id' => "vote-{$vote->id}",
                'kind' => 'validation',
                'title' => 'Validaron tu reporte',
                'description' => "{$vote->report->title} · {$vote->report->confirms_count} confirmaciones",
                'reportId' => $vote->report_id,
                'time' => $vote->created_at->diffForHumans(),
                'at' => $vote->created_at->toIso8601String(),
                'atTimestamp' => $vote->created_at->timestamp,
            ]);
    }

    /** Distancia en metros entre dos coordenadas (fórmula de Haversine). */
    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000.0; // metros

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}

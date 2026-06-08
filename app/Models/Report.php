<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'anonymous',
        'type',
        'title',
        'description',
        'address',
        'neighborhood',
        'city',
        'latitude',
        'longitude',
        'status',
        'risk_level',
        'confirms_count',
        'denies_count',
        'trust_score',
        'occurred_at',
    ];

    protected $casts = [
        'anonymous'   => 'boolean',
        'latitude'    => 'float',
        'longitude'   => 'float',
        'occurred_at' => 'datetime',
    ];

    /* ── relaciones ── */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ReportVote::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(ReportMedia::class);
    }

    /* ── helpers ── */

    /**
     * Recalcula trust_score y risk_level en base a votos.
     * trust_score = confirms / (confirms + denies) * 100
     */
    public function recalculateTrust(): void
    {
        $total = $this->confirms_count + $this->denies_count;
        $score = $total > 0 ? (int) round(($this->confirms_count / $total) * 100) : 50;

        $risk = match (true) {
            $score >= 70 => 'Alto',
            $score >= 40 => 'Medio',
            default      => 'Bajo',
        };

        $this->update([
            'trust_score' => $score,
            'risk_level'  => $risk,
            'status'      => $this->confirms_count >= 5 ? 'validated' : $this->status,
        ]);
    }

    /** Serialización para Inertia (mismo shape que ReportSummary del frontend) */
    public function toInertia(): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'type'        => $this->type,
            'location'    => $this->address,
            'description' => $this->description ?? '',
            'time'        => $this->created_at->diffForHumans(),
            'risk'        => $this->risk_level,
            'trustScore'  => $this->trust_score,
            'confirms'    => $this->confirms_count,
            'denies'      => $this->denies_count,
            'status'      => $this->status,
            'lat'         => $this->latitude,
            'lng'         => $this->longitude,
        ];
    }
}

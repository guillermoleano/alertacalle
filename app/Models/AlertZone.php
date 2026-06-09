<?php

namespace App\Models;

use Database\Factories\AlertZoneFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlertZone extends Model
{
    /** @use HasFactory<AlertZoneFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'label',
        'latitude',
        'longitude',
        'radius_meters',
        'active',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'radius_meters' => 'integer',
        'active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Serialización para Inertia (shape que espera el frontend de Ajustes). */
    public function toInertia(): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'lat' => $this->latitude,
            'lng' => $this->longitude,
            'radius' => $this->radius_meters,
            'active' => $this->active,
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportMedia extends Model
{
    protected $fillable = ['report_id', 'path', 'url', 'type', 'size_bytes'];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}

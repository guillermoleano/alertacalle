<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Convierte `status` de enum a string para admitir el estado 'fake'
 * (marcado por la comunidad) sin la rigidez del CHECK de enum en SQLite.
 * Los valores válidos se controlan a nivel de aplicación.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->enum('status', ['pending', 'validated', 'rejected'])
                ->default('pending')
                ->change();
        });
    }
};

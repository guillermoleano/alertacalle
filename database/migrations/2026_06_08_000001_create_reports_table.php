<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('anonymous')->default(true);

            // Incidente
            $table->string('type');               // Atraco a pie, Hurto celular, etc.
            $table->string('title');
            $table->text('description')->nullable();

            // Ubicación
            $table->string('address');            // calle / cruce
            $table->string('neighborhood')->nullable();
            $table->string('city')->default('Bogotá');
            $table->decimal('latitude',  10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Estado
            $table->enum('status', ['pending', 'validated', 'rejected'])->default('pending');
            $table->enum('risk_level', ['Alto', 'Medio', 'Bajo'])->default('Medio');

            // Métricas (desnormalizadas para lectura rápida)
            $table->unsignedSmallInteger('confirms_count')->default(0);
            $table->unsignedSmallInteger('denies_count')->default(0);
            $table->unsignedTinyInteger('trust_score')->default(50);

            $table->timestamp('occurred_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};

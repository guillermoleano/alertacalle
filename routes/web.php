<?php

use App\Http\Controllers\AlertZoneController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

/* ── Lectura pública (mapa + listado) ── */
Route::get('/mapa', [ReportController::class, 'mapa'])->name('mapa');
Route::get('/reportes', [ReportController::class, 'index'])->name('reportes');

/* ── Acciones que requieren sesión (esquema mixto) ── */
Route::middleware(['auth'])->group(function () {
    Route::get('/reportar', [ReportController::class, 'create'])->name('reportar');
    Route::post('/reportar', [ReportController::class, 'store'])->name('reportar.store');
    Route::post('/reportes/{report}/vote', [ReportController::class, 'vote'])->name('reportes.vote');

    /* ── Páginas de cuenta ── */
    Route::get('/mi-perfil', [ReportController::class, 'profile'])->name('mi-perfil');
    Route::get('/ajustes', [AlertZoneController::class, 'index'])->name('ajustes');

    /* ── Zonas de alerta ── */
    Route::post('/zonas', [AlertZoneController::class, 'store'])->name('zonas.store');
    Route::put('/zonas/{zone}', [AlertZoneController::class, 'update'])->name('zonas.update');
    Route::delete('/zonas/{zone}', [AlertZoneController::class, 'destroy'])->name('zonas.destroy');

    /* ── Notificaciones ── */
    Route::post('/notificaciones/visto', [NotificationController::class, 'seen'])->name('notificaciones.visto');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';

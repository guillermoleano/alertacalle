<?php

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
});

/* ── Páginas de cuenta ── */
Route::inertia('/mi-perfil', 'mi-perfil')->name('mi-perfil');
Route::inertia('/ajustes', 'ajustes')->name('ajustes');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';

<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/mapa', 'mapa')->name('mapa');
Route::inertia('/reportar', 'reportar')->name('reportar');
Route::inertia('/reportes', 'reportes')->name('reportes');
Route::inertia('/mi-perfil', 'mi-perfil')->name('mi-perfil');
Route::inertia('/ajustes', 'ajustes')->name('ajustes');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';

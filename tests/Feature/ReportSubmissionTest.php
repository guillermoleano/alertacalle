<?php

use App\Models\Report;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests cannot submit a report and are redirected to login', function () {
    $this->post(route('reportar.store'), [
        'type' => 'Hurto celular',
        'address' => 'Calle 100 con Carrera 15',
    ])->assertRedirect(route('login'));

    expect(Report::count())->toBe(0);
});

test('authenticated user can submit a report with evidence', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());

    $response = $this->post(route('reportar.store'), [
        'type' => 'Atraco en moto',
        'title' => 'Atraco en moto',
        'description' => 'Dos sujetos en moto.',
        'address' => 'Av. El Dorado con Carrera 50',
        'neighborhood' => 'Modelia',
        'latitude' => 4.6580,
        'longitude' => -74.0910,
        'anonymous' => 1,
        'media' => [
            UploadedFile::fake()->image('evidencia.jpg'),
            UploadedFile::fake()->image('evidencia2.png'),
        ],
    ]);

    $response->assertRedirect(route('reportes'));

    $report = Report::firstOrFail();
    expect($report->type)->toBe('Atraco en moto')
        ->and($report->status)->toBe('pending')
        ->and($report->latitude)->toEqual(4.6580)
        ->and($report->media)->toHaveCount(2);

    // los archivos quedaron en el disco público
    foreach ($report->media as $media) {
        Storage::disk('public')->assertExists($media->path);
    }
});

test('report submission requires an address', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('reportar.store'), [
        'type' => 'Cosquilleo',
    ])->assertSessionHasErrors('address');

    expect(Report::count())->toBe(0);
});

test('media must respect type and size limits', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());

    $this->post(route('reportar.store'), [
        'type' => 'Otro',
        'address' => 'Calle X',
        'media' => [UploadedFile::fake()->create('virus.pdf', 200, 'application/pdf')],
    ])->assertSessionHasErrors('media.0');

    expect(Report::count())->toBe(0);
});

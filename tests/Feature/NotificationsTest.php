<?php

use App\Models\AlertZone;
use App\Models\Report;
use App\Models\ReportVote;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/** Crea un reporte ajeno con coordenadas dadas. */
function makeReport(array $attributes = []): Report
{
    return Report::create(array_merge([
        'user_id' => User::factory()->create()->id,
        'type' => 'Hurto celular',
        'title' => 'Reporte',
        'address' => 'Calle 100',
        'status' => 'pending',
        'risk_level' => 'Medio',
        'latitude' => 4.65,
        'longitude' => -74.09,
    ], $attributes));
}

test('a report inside an active zone surfaces as an unread notification', function () {
    $user = User::factory()->create();
    AlertZone::factory()->for($user)->create([
        'latitude' => 4.65, 'longitude' => -74.09, 'radius_meters' => 500,
    ]);

    makeReport(['latitude' => 4.6505, 'longitude' => -74.0905]); // ~ a metros

    $this->actingAs($user)
        ->get(route('ajustes'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('notifications.unread', 1)
            ->where('notifications.items.0.kind', 'zone')
        );
});

test('a report outside every zone does not notify', function () {
    $user = User::factory()->create();
    AlertZone::factory()->for($user)->create([
        'latitude' => 4.65, 'longitude' => -74.09, 'radius_meters' => 500,
    ]);

    makeReport(['latitude' => 4.75, 'longitude' => -74.00]); // lejos

    $this->actingAs($user)
        ->get(route('ajustes'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('notifications.unread', 0)
            ->has('notifications.items', 0)
        );
});

test('a confirm vote on my report surfaces as a validation notification', function () {
    $user = User::factory()->create();
    $report = Report::create([
        'user_id' => $user->id, 'type' => 'Atraco a pie', 'title' => 'Mi reporte',
        'address' => 'X', 'status' => 'pending', 'risk_level' => 'Medio',
    ]);

    ReportVote::create([
        'report_id' => $report->id,
        'user_id' => User::factory()->create()->id,
        'vote' => 'confirm',
    ]);

    $this->actingAs($user)
        ->get(route('ajustes'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('notifications.unread', 1)
            ->where('notifications.items.0.kind', 'validation')
        );
});

test('my own vote on my own report does not notify me', function () {
    $user = User::factory()->create();
    $report = Report::create([
        'user_id' => $user->id, 'type' => 'Otro', 'title' => 'Mi reporte',
        'address' => 'X', 'status' => 'pending', 'risk_level' => 'Bajo',
    ]);

    ReportVote::create([
        'report_id' => $report->id, 'user_id' => $user->id, 'vote' => 'confirm',
    ]);

    $this->actingAs($user)
        ->get(route('ajustes'))
        ->assertInertia(fn (Assert $page) => $page->where('notifications.unread', 0));
});

test('marking notifications as seen resets the unread count but keeps the items', function () {
    $user = User::factory()->create();
    AlertZone::factory()->for($user)->create([
        'latitude' => 4.65, 'longitude' => -74.09, 'radius_meters' => 500,
    ]);
    makeReport();

    $this->actingAs($user)->post(route('notificaciones.visto'))->assertRedirect();

    expect($user->fresh()->alerts_seen_at)->not->toBeNull();

    $this->actingAs($user)
        ->get(route('ajustes'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('notifications.unread', 0)
            ->has('notifications.items', 1)
        );
});

<?php

use App\Models\Report;
use App\Models\ReportVote;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function pendingReport(array $attributes = []): Report
{
    return Report::create(array_merge([
        'type' => 'Hurto celular',
        'title' => 'Reporte',
        'address' => 'Calle 100',
        'status' => 'pending',
        'risk_level' => 'Medio',
    ], $attributes));
}

test('guests cannot access the moderation panel', function () {
    $this->get(route('moderacion'))->assertRedirect(route('login'));
});

test('citizens cannot access the moderation panel', function () {
    $this->actingAs(User::factory()->create()) // rol citizen por defecto
        ->get(route('moderacion'))
        ->assertForbidden();
});

test('moderators can access the moderation panel', function () {
    pendingReport();

    $this->actingAs(User::factory()->moderator()->create())
        ->get(route('moderacion'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('moderacion')
            ->has('reports', 1)
            ->where('counts.pending', 1)
        );
});

test('a moderator can mark a report as fake and it disappears from the public map', function () {
    $report = pendingReport();
    $moderator = User::factory()->moderator()->create();

    $this->actingAs($moderator)
        ->patch(route('moderacion.update', $report), ['status' => 'fake'])
        ->assertRedirect();

    expect($report->fresh()->status)->toBe('fake');

    // ya no aparece en el mapa público
    $this->get(route('mapa'))->assertInertia(fn (Assert $page) => $page->has('reports', 0));
});

test('citizens cannot change a report status', function () {
    $report = pendingReport();

    $this->actingAs(User::factory()->create())
        ->patch(route('moderacion.update', $report), ['status' => 'fake'])
        ->assertForbidden();

    expect($report->fresh()->status)->toBe('pending');
});

test('an invalid status is rejected', function () {
    $report = pendingReport();

    $this->actingAs(User::factory()->moderator()->create())
        ->patch(route('moderacion.update', $report), ['status' => 'banana'])
        ->assertSessionHasErrors('status');
});

test('three negative votes auto-flag a report as fake', function () {
    $report = pendingReport();

    foreach (range(1, 3) as $i) {
        $voter = User::factory()->create();
        ReportVote::create([
            'report_id' => $report->id,
            'user_id' => $voter->id,
            'vote' => 'deny',
        ]);
        $report->increment('denies_count');
        $report->refresh();
        $report->recalculateTrust();
    }

    expect($report->fresh()->status)->toBe('fake');
});

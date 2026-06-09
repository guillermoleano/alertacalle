<?php

use App\Models\AlertZone;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot create an alert zone', function () {
    $this->post(route('zonas.store'), [
        'label' => 'Casa',
        'latitude' => 4.65,
        'longitude' => -74.09,
        'radius_meters' => 500,
    ])->assertRedirect(route('login'));

    expect(AlertZone::count())->toBe(0);
});

test('authenticated user can create an alert zone', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('zonas.store'), [
        'label' => 'Casa',
        'latitude' => 4.65,
        'longitude' => -74.09,
        'radius_meters' => 500,
    ])->assertRedirect();

    $zone = AlertZone::firstOrFail();
    expect($zone->label)->toBe('Casa')
        ->and($zone->user_id)->toBe($user->id)
        ->and($zone->radius_meters)->toBe(500)
        ->and($zone->active)->toBeTrue();
});

test('creating a zone requires label and coordinates', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('zonas.store'), ['radius_meters' => 500])
        ->assertSessionHasErrors(['label', 'latitude', 'longitude']);

    expect(AlertZone::count())->toBe(0);
});

test('user can update their own zone', function () {
    $user = User::factory()->create();
    $zone = AlertZone::factory()->for($user)->create(['radius_meters' => 300]);

    $this->actingAs($user)->put(route('zonas.update', $zone), [
        'label' => 'Trabajo',
        'latitude' => 4.66,
        'longitude' => -74.05,
        'radius_meters' => 800,
    ])->assertRedirect();

    expect($zone->fresh())
        ->label->toBe('Trabajo')
        ->radius_meters->toBe(800);
});

test('user cannot modify a zone owned by someone else', function () {
    $zone = AlertZone::factory()->create();

    $this->actingAs(User::factory()->create())
        ->put(route('zonas.update', $zone), [
            'label' => 'Hack',
            'latitude' => 4.66,
            'longitude' => -74.05,
            'radius_meters' => 800,
        ])->assertForbidden();

    $this->actingAs(User::factory()->create())
        ->delete(route('zonas.destroy', $zone))
        ->assertForbidden();

    expect(AlertZone::whereKey($zone->id)->exists())->toBeTrue();
});

test('user can delete their own zone', function () {
    $user = User::factory()->create();
    $zone = AlertZone::factory()->for($user)->create();

    $this->actingAs($user)
        ->delete(route('zonas.destroy', $zone))
        ->assertRedirect();

    expect(AlertZone::count())->toBe(0);
});

test('settings page exposes the user own zones', function () {
    $user = User::factory()->create();
    AlertZone::factory()->for($user)->create(['label' => 'Casa']);
    AlertZone::factory()->create(); // de otro usuario

    $this->actingAs($user)
        ->get(route('ajustes'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('ajustes')
            ->has('zones', 1)
            ->where('zones.0.label', 'Casa')
        );
});

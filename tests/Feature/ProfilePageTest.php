<?php

use App\Models\Report;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login from profile', function () {
    $this->get(route('mi-perfil'))->assertRedirect(route('login'));
});

test('profile shows the user own reports and computed stats', function () {
    $user = User::factory()->create();

    // 2 reportes del usuario (uno validado con confirmaciones) + 1 ajeno
    Report::create([
        'user_id' => $user->id, 'type' => 'Atraco a pie', 'title' => 'A',
        'address' => 'X', 'status' => 'validated', 'risk_level' => 'Alto',
        'confirms_count' => 8, 'denies_count' => 0, 'trust_score' => 90,
    ]);
    Report::create([
        'user_id' => $user->id, 'type' => 'Cosquilleo', 'title' => 'B',
        'address' => 'Y', 'status' => 'pending', 'risk_level' => 'Bajo',
        'confirms_count' => 2, 'denies_count' => 1, 'trust_score' => 40,
    ]);
    Report::create([
        'user_id' => User::factory()->create()->id, 'type' => 'Otro', 'title' => 'C',
        'address' => 'Z', 'status' => 'pending', 'risk_level' => 'Medio',
    ]);

    $this->actingAs($user)
        ->get(route('mi-perfil'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('mi-perfil')
            ->where('profileUser.name', $user->name)
            ->where('profileUser.email', $user->email)
            ->has('reports', 2)
            ->where('stats.total', 2)
            ->where('stats.validated', 1)
            ->where('stats.confirms', 10)
            ->where('reputation', 150 + 100) // validated*150 + confirms*10
        );
});

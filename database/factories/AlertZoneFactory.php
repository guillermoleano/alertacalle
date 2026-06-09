<?php

namespace Database\Factories;

use App\Models\AlertZone;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AlertZone>
 */
class AlertZoneFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'label' => fake()->randomElement(['Casa', 'Trabajo', 'Gym', 'Universidad']),
            'latitude' => fake()->latitude(4.55, 4.80),
            'longitude' => fake()->longitude(-74.20, -74.00),
            'radius_meters' => fake()->randomElement([300, 500, 800]),
            'active' => true,
        ];
    }
}

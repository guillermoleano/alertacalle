<?php

use App\Models\Report;

test('severity maps each incident type to its danger level', function (string $type, string $expected) {
    expect(Report::severityForType($type))->toBe($expected);
})->with([
    ['Intimidación con arma', 'Alta'],
    ['Atraco en moto', 'Alta'],
    ['Fleteo', 'Alta'],
    ['Atraco a pie', 'Media'],
    ['Hurto celular', 'Media'],
    ['Otro', 'Media'],
    ['Cosquilleo', 'Baja'],
]);

test('unknown or null types default to media severity', function () {
    expect(Report::severityForType('Tipo inexistente'))->toBe('Media')
        ->and(Report::severityForType(null))->toBe('Media');
});

test('serialized report includes its severity', function () {
    $report = Report::create([
        'user_id' => null,
        'type' => 'Fleteo',
        'title' => 'Fleteo',
        'address' => 'Calle X',
        'status' => 'pending',
        'risk_level' => 'Medio',
    ]);

    expect($report->toInertia())
        ->toHaveKey('severity')
        ->and($report->toInertia()['severity'])->toBe('Alta');
});

<?php

namespace App\Http\Controllers;

use App\Models\AlertZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlertZoneController extends Controller
{
    /** GET /ajustes — configuración del usuario, con sus zonas de alerta */
    public function index(Request $request): Response
    {
        $zones = $request->user()
            ->alertZones()
            ->latest()
            ->get()
            ->map(fn (AlertZone $zone) => $zone->toInertia());

        return Inertia::render('ajustes', [
            'zones' => $zones,
        ]);
    }

    /** POST /zonas — crear una zona de alerta */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['user_id'] = $request->user()->id;

        AlertZone::create($data);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Zona de alerta guardada.',
        ]);
    }

    /** PUT /zonas/{zone} — editar una zona */
    public function update(Request $request, AlertZone $zone): RedirectResponse
    {
        abort_unless($zone->user_id === $request->user()->id, 403);

        $zone->update($this->validated($request));

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Zona actualizada.',
        ]);
    }

    /** DELETE /zonas/{zone} — eliminar una zona */
    public function destroy(Request $request, AlertZone $zone): RedirectResponse
    {
        abort_unless($zone->user_id === $request->user()->id, 403);

        $zone->delete();

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Zona eliminada.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'label' => 'required|string|max:60',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|integer|between:100,5000',
            'active' => 'boolean',
        ]);
    }
}

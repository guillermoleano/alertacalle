<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportVote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /** GET /mapa — página con reportes para el mapa */
    public function mapa(): Response
    {
        $reports = Report::where('status', '!=', 'rejected')
            ->latest()
            ->take(50)
            ->get()
            ->map(fn(Report $r) => $r->toInertia());

        return Inertia::render('mapa', [
            'reports' => $reports,
        ]);
    }

    /** GET /reportes — listado completo con filtros */
    public function index(Request $request): Response
    {
        $query = Report::where('status', '!=', 'rejected')->latest();

        if ($request->filled('type') && $request->type !== 'Todos') {
            $query->where('type', $request->type);
        }
        if ($request->filled('risk') && $request->risk !== 'Todos') {
            $query->where('risk_level', $request->risk);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('address', 'like', "%{$request->search}%");
            });
        }

        $reports = $query->get()->map(fn(Report $r) => $r->toInertia());

        return Inertia::render('reportes', [
            'reports' => $reports,
            'filters' => $request->only(['type', 'risk', 'search']),
        ]);
    }

    /** GET /reportar — formulario */
    public function create(): Response
    {
        return Inertia::render('reportar');
    }

    /** POST /reportar — guardar reporte */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type'        => 'required|string|max:100',
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string|max:280',
            'address'     => 'required|string|max:300',
            'neighborhood'=> 'nullable|string|max:100',
            'city'        => 'nullable|string|max:100',
            'latitude'    => 'nullable|numeric|between:-90,90',
            'longitude'   => 'nullable|numeric|between:-180,180',
            'occurred_at' => 'nullable|date',
            'anonymous'   => 'boolean',
        ]);

        // Si no viene title calculamos uno del tipo
        $data['title'] ??= $data['type'];
        $data['user_id'] = auth()->id();
        $data['anonymous'] = $data['anonymous'] ?? true;

        Report::create($data);

        return redirect()->route('reportes')
            ->with('success', 'Reporte enviado. Quedará visible al recibir validaciones.');
    }

    /** POST /api/reports/{report}/vote — votar */
    public function vote(Request $request, Report $report): \Illuminate\Http\JsonResponse
    {
        $request->validate(['vote' => 'required|in:confirm,deny']);

        $userId = auth()->id();
        $ip     = $request->ip();

        // Evitar doble voto por IP si no está autenticado
        $existing = ReportVote::where('report_id', $report->id)
            ->where(function ($q) use ($userId, $ip) {
                if ($userId) $q->where('user_id', $userId);
                else         $q->where('ip_address', $ip);
            })
            ->first();

        if ($existing) {
            // Cambiar voto si es distinto
            if ($existing->vote !== $request->vote) {
                // Revertir voto anterior
                if ($existing->vote === 'confirm') $report->decrement('confirms_count');
                else                               $report->decrement('denies_count');

                $existing->update(['vote' => $request->vote]);
            } else {
                return response()->json(['message' => 'Ya votaste este reporte'], 409);
            }
        } else {
            ReportVote::create([
                'report_id'  => $report->id,
                'user_id'    => $userId,
                'ip_address' => $ip,
                'vote'       => $request->vote,
            ]);
        }

        // Actualizar contadores
        if ($request->vote === 'confirm') $report->increment('confirms_count');
        else                              $report->increment('denies_count');

        $report->refresh();
        $report->recalculateTrust();

        return response()->json([
            'confirms'    => $report->confirms_count,
            'denies'      => $report->denies_count,
            'trust_score' => $report->trust_score,
        ]);
    }
}

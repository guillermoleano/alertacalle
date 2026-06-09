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
            ->map(fn (Report $r) => $r->toInertia());

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

        $reports = $query->get()->map(fn (Report $r) => $r->toInertia());

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

    /** GET /mi-perfil — perfil del usuario con sus reportes y reputación */
    public function profile(Request $request): Response
    {
        $user = $request->user();

        $reports = Report::where('user_id', $user->id)->latest()->get();

        $stats = [
            'total' => $reports->count(),
            'validated' => $reports->where('status', 'validated')->count(),
            'confirms' => (int) $reports->sum('confirms_count'),
            'avgTrust' => (int) round($reports->avg('trust_score') ?? 0),
        ];

        // Reputación 0–1000: pondera reportes validados y confirmaciones recibidas
        $reputation = min(1000, $stats['validated'] * 150 + $stats['confirms'] * 10);

        return Inertia::render('mi-perfil', [
            'profileUser' => [
                'name' => $user->name,
                'email' => $user->email,
                'memberSince' => $user->created_at->locale('es')->isoFormat('MMMM [de] YYYY'),
            ],
            'reports' => $reports->map(fn (Report $r) => $r->toInertia()),
            'stats' => $stats,
            'reputation' => $reputation,
        ]);
    }

    /** POST /reportar — guardar reporte */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|max:100',
            'title' => 'nullable|string|max:200',
            'description' => 'nullable|string|max:280',
            'note' => 'nullable|string|max:200',
            'address' => 'required|string|max:300',
            'neighborhood' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'occurred_at' => 'nullable|date|before_or_equal:now',
            'anonymous' => 'boolean',
            'media' => 'nullable|array|max:3',
            'media.*' => 'file|mimes:jpg,jpeg,png,mp4|max:10240', // 10 MB
        ], [
            'occurred_at.before_or_equal' => 'La fecha del hecho no puede ser futura.',
        ]);

        $data = collect($validated)->except('media')->all();

        // Si no viene title (o llega vacío) lo derivamos del tipo
        $data['title'] = ($data['title'] ?? null) ?: $data['type'];
        $data['user_id'] = auth()->id();
        $data['anonymous'] = $data['anonymous'] ?? true;
        $data['status'] = 'pending';

        $report = Report::create($data);

        // Guardar evidencia (fotos / video)
        foreach ($request->file('media', []) as $file) {
            $path = $file->store("reports/{$report->id}", 'public');
            $report->media()->create([
                'path' => $path,
                'url' => \Storage::disk('public')->url($path),
                'type' => str_starts_with($file->getMimeType(), 'video') ? 'video' : 'photo',
                'size_bytes' => $file->getSize(),
            ]);
        }

        return redirect()->route('reportes')->with('toast', [
            'type' => 'success',
            'message' => 'Reporte enviado. Quedará visible al recibir validaciones.',
        ]);
    }

    /** POST /reportes/{report}/vote — votar (validación comunitaria) */
    public function vote(Request $request, Report $report): RedirectResponse
    {
        $request->validate(['vote' => 'required|in:confirm,deny']);

        $userId = auth()->id();
        $ip = $request->ip();

        // Evitar doble voto por usuario / IP
        $existing = ReportVote::where('report_id', $report->id)
            ->where(function ($q) use ($userId, $ip) {
                if ($userId) {
                    $q->where('user_id', $userId);
                } else {
                    $q->where('ip_address', $ip);
                }
            })
            ->first();

        if ($existing) {
            if ($existing->vote === $request->vote) {
                return back(); // mismo voto: no-op silencioso
            }

            // Cambiar voto: revertir el anterior
            if ($existing->vote === 'confirm') {
                $report->decrement('confirms_count');
            } else {
                $report->decrement('denies_count');
            }

            $existing->update(['vote' => $request->vote]);
        } else {
            ReportVote::create([
                'report_id' => $report->id,
                'user_id' => $userId,
                'ip_address' => $ip,
                'vote' => $request->vote,
            ]);
        }

        // Aplicar el nuevo voto
        if ($request->vote === 'confirm') {
            $report->increment('confirms_count');
        } else {
            $report->increment('denies_count');
        }

        $report->refresh();
        $report->recalculateTrust();

        return back();
    }
}

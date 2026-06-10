<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModerationController extends Controller
{
    /** GET /moderacion — cola de moderación (pendientes y recientes). */
    public function index(): Response
    {
        $reports = Report::latest()
            ->take(100)
            ->get()
            ->map(fn (Report $r) => [
                ...$r->toInertia(),
                'anonymous' => $r->anonymous,
            ]);

        return Inertia::render('moderacion', [
            'reports' => $reports,
            'counts' => [
                'pending' => Report::where('status', 'pending')->count(),
                'validated' => Report::where('status', 'validated')->count(),
                'rejected' => Report::where('status', 'rejected')->count(),
                'fake' => Report::where('status', 'fake')->count(),
            ],
        ]);
    }

    /** PATCH /moderacion/{report} — cambiar el estado de un reporte. */
    public function update(Request $request, Report $report): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:'.implode(',', Report::MODERATABLE_STATUSES)],
        ]);

        $report->update(['status' => $validated['status']]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => "Reporte marcado como {$validated['status']}.",
        ]);
    }
}

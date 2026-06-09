<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /** POST /notificaciones/visto — marca el feed como leído hasta ahora */
    public function seen(Request $request): RedirectResponse
    {
        $user = $request->user();
        $user->alerts_seen_at = now();
        $user->save();

        return back();
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->attributes->get('auth_usuario');

        if (!$usuario || $usuario->rol !== 'admin') {
            return response()->json([
                'message' => 'No tiene permisos para acceder a esta seccion administrativa.',
            ], 403);
        }

        return $next($request);
    }
}

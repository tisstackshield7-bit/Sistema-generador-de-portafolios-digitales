<?php

namespace App\Http\Middleware;

use App\Models\Sesion;
use App\Models\Usuario;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Authorization');

        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return response()->json([
                'message' => 'Debe iniciar sesion para acceder a las funciones privadas de su cuenta.'
            ], 401);
        }

        $token = trim(str_replace('Bearer', '', $header));

        $sesion = Sesion::where('token', $token)->first();

        if (!$sesion) {
            return response()->json([
                'message' => 'Debe iniciar sesion para acceder a las funciones privadas de su cuenta.'
            ], 401);
        }

        if ($sesion->fecha_expiracion && Carbon::parse($sesion->fecha_expiracion)->isPast()) {
            return response()->json([
                'message' => 'La sesion ha expirado. Inicie sesion nuevamente.'
            ], 401);
        }

        $usuario = Usuario::find($sesion->usuario_id);

        if (!$usuario) {
            return response()->json([
                'message' => 'Debe iniciar sesion para acceder a las funciones privadas de su cuenta.'
            ], 401);
        }

        $request->attributes->set('auth_usuario', $usuario);
        $request->attributes->set('auth_sesion', $sesion);

        return $next($request);
    }
}
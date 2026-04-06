<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Sesion;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $usuario = Usuario::create([
            'nombre' => null,
            'correo' => $request->correo,
            'contrasena' => Hash::make($request->contrasena),
            'estado' => 'activo',
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        $sesion = $this->createSession($usuario, $request);

        return response()->json([
            'message' => 'Registro exitoso.',
            'usuario_id' => $usuario->id,
            'redirect_to' => '/perfil/crear',
            'token' => $sesion->token,
            'usuario' => [
                'id' => $usuario->id,
                'correo' => $usuario->correo,
                'estado' => $usuario->estado,
            ],
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $usuario = Usuario::where('correo', $request->correo)->first();

        if (!$usuario || !Hash::check($request->contrasena, $usuario->contrasena)) {
            return response()->json([
                'message' => 'Credenciales incorrectas.'
            ], 422);
        }

        $sesion = $this->createSession($usuario, $request);

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'token' => $sesion->token,
            'usuario' => [
                'id' => $usuario->id,
                'correo' => $usuario->correo,
                'estado' => $usuario->estado,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $usuario = $request->attributes->get('auth_usuario');

        return response()->json([
            'usuario' => $usuario,
        ]);
    }

    public function logout(Request $request)
    {
        $sesion = $request->attributes->get('auth_sesion');

        if ($sesion) {
            $sesion->delete();
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente.'
        ]);
    }
    private function createSession(Usuario $usuario, Request $request): Sesion
    {
        return Sesion::create([
            'usuario_id' => $usuario->id,
            'token' => Str::random(80),
            'ip_usuario' => $request->ip(),
            'dispositivo' => substr((string) $request->userAgent(), 0, 255),
            'fecha_inicio' => now(),
            'fecha_expiracion' => Carbon::now()->addDays(7),
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);
    }
}

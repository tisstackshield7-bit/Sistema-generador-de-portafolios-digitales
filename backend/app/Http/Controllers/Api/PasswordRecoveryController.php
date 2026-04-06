<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\RecuperacionContrasena;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordRecoveryController extends Controller
{
    public function sendRecovery(ForgotPasswordRequest $request)
    {
        $usuario = Usuario::where('correo', $request->correo)->first();

        if (!$usuario) {
            return response()->json([
                'message' => 'No existe una cuenta asociada a ese correo.'
            ], 404);
        }

        $token = Str::random(64);

        RecuperacionContrasena::create([
            'usuario_id' => $usuario->id,
            'token' => $token,
            'expira_en' => Carbon::now()->addMinutes(30),
            'usado' => false,
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        return response()->json([
            'message' => 'Se envió el enlace o código de recuperación.',
            'token_prueba' => $token,
        ]);
    }

    public function validateToken(string $token)
    {
        $recovery = RecuperacionContrasena::where('token', $token)
            ->where('usado', false)
            ->first();

        if (!$recovery) {
            return response()->json([
                'message' => 'El enlace o código no es válido.'
            ], 404);
        }

        if (Carbon::parse($recovery->expira_en)->isPast()) {
            return response()->json([
                'message' => 'El enlace o código expiró.'
            ], 410);
        }

        return response()->json([
            'message' => 'Token válido.'
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $recovery = RecuperacionContrasena::where('token', $request->token)
            ->where('usado', false)
            ->first();

        if (!$recovery) {
            return response()->json([
                'message' => 'El enlace o código no es válido.'
            ], 404);
        }

        if (Carbon::parse($recovery->expira_en)->isPast()) {
            return response()->json([
                'message' => 'El enlace o código expiró.'
            ], 410);
        }

        $usuario = Usuario::findOrFail($recovery->usuario_id);
        $usuario->contrasena = Hash::make($request->contrasena);
        $usuario->actualizado_en = now();
        $usuario->save();

        $recovery->usado = true;
        $recovery->actualizado_en = now();
        $recovery->save();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.'
        ]);
    }
}
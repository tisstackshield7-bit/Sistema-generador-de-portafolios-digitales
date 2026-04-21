<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class PasswordRecoveryController extends Controller
{
    public function sendRecovery(ForgotPasswordRequest $request)
    {
        $status = Password::broker()->sendResetLink([
            'correo' => $request->correo,
        ]);

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'message' => 'Ya enviamos un enlace hace poco. Espera 60 segundos antes de solicitar otro.',
            ], 429);
        }

        return response()->json([
            'message' => 'Si el correo existe, te enviamos un enlace de recuperacion valido por 30 minutos.',
        ]);
    }

    public function validateToken(Request $request, string $token)
    {
        $request->validate([
            'correo' => ['required', 'email'],
        ]);

        $usuario = Usuario::where('correo', $request->query('correo'))->first();

        if (!$usuario || !Password::broker()->tokenExists($usuario, $token)) {
            return response()->json([
                'message' => 'El enlace no es valido o ya expiro.',
            ], 404);
        }

        return response()->json([
            'message' => 'Token valido.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $status = Password::broker()->reset([
            'correo' => $request->correo,
            'password' => $request->contrasena,
            'password_confirmation' => $request->contrasena_confirmation,
            'token' => $request->token,
        ], function (Usuario $usuario, string $password) {
            $usuario->contrasena = Hash::make($password);
            $usuario->debe_cambiar_contrasena = false;
            $usuario->contrasena_temporal_expira_en = null;
            $usuario->recuperacion_solicitada_en = now();
            $usuario->token_recordar = null;
            $usuario->actualizado_en = now();
            $usuario->save();
        });

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'No se pudo restablecer la contrasena. El enlace no es valido o ya expiro.',
            ], 422);
        }

        return response()->json([
            'message' => 'Contrasena actualizada correctamente.',
        ]);
    }
}

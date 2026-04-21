<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\Sesion;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PasswordRecoveryController extends Controller
{
    public function sendRecovery(ForgotPasswordRequest $request)
    {
        $usuario = Usuario::where('correo', $request->correo)->first();

        if (!$usuario) {
            return response()->json([
                'message' => 'Si el correo existe, te enviamos una contrasena temporal valida por 30 minutos.',
            ]);
        }

        if ($usuario->recuperacion_solicitada_en && Carbon::parse($usuario->recuperacion_solicitada_en)->addSeconds(60)->isFuture()) {
            return response()->json([
                'message' => 'Ya enviamos una contrasena temporal hace poco. Espera 60 segundos antes de solicitar otra.',
            ], 429);
        }

        $expireMinutes = 30;
        $temporaryPassword = $this->generateTemporaryPassword();

        $usuario->contrasena = Hash::make($temporaryPassword);
        $usuario->debe_cambiar_contrasena = true;
        $usuario->contrasena_temporal_expira_en = now()->addMinutes($expireMinutes);
        $usuario->recuperacion_solicitada_en = now();
        $usuario->token_recordar = null;
        $usuario->actualizado_en = now();
        $usuario->save();

        Sesion::where('usuario_id', $usuario->id)->delete();
        $usuario->sendTemporaryPasswordNotification($temporaryPassword, $expireMinutes);

        return response()->json([
            'message' => 'Si el correo existe, te enviamos una contrasena temporal valida por 30 minutos.',
        ]);
    }

    public function validateToken(Request $request, string $token)
    {
        return response()->json([
            'message' => 'Este flujo ya no usa enlaces de recuperacion. Solicita una contrasena temporal.',
        ], 410);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        return response()->json([
            'message' => 'Este flujo ya no usa enlaces de recuperacion. Solicita una contrasena temporal.',
        ], 410);
    }

    private function generateTemporaryPassword(int $length = 8): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        $password = '';
        $max = strlen($alphabet) - 1;

        for ($index = 0; $index < $length; $index++) {
            $password .= $alphabet[random_int(0, $max)];
        }

        return $password;
    }
}

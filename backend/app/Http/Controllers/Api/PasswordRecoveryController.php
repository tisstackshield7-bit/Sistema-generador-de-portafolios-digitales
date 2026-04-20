<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\RecuperacionContrasena;
use App\Models\Sesion;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordRecoveryController extends Controller
{
    public function sendRecovery(ForgotPasswordRequest $request)
    {
        $usuario = Usuario::where('correo', $request->correo)->first();

        if (!$usuario) {
            return response()->json([
                'message' => 'Si el correo existe, se envio una contrasena temporal.'
            ]);
        }

        $temporaryPassword = $this->generateTemporaryPassword();

        $usuario->contrasena = Hash::make($temporaryPassword);
        $usuario->debe_cambiar_contrasena = true;
        $usuario->contrasena_temporal_expira_en = Carbon::now()->addMinutes(15);
        $usuario->recuperacion_solicitada_en = now();
        $usuario->actualizado_en = now();
        $usuario->save();

        Sesion::where('usuario_id', $usuario->id)->delete();

        Mail::raw(
            "Hola,\n\nRecibimos una solicitud para recuperar el acceso a tu cuenta.\n\n" .
            "Tu contrasena temporal es:\n{$temporaryPassword}\n\n" .
            "Esta contrasena vence en 15 minutos. Inicia sesion y cambiala de inmediato desde tu perfil.\n\n" .
            "Si no solicitaste este cambio, ignora este mensaje y vuelve a solicitar recuperacion si lo necesitas.",
            function ($message) use ($usuario) {
                $message->to($usuario->correo)
                    ->subject('Contrasena temporal de acceso');
            }
        );

        return response()->json([
            'message' => 'Si el correo existe, se envio una contrasena temporal.',
            'contrasena_temporal_prueba' => app()->environment(['local', 'testing']) ? $temporaryPassword : null,
        ]);
    }

    public function validateToken(string $token)
    {
        $recovery = RecuperacionContrasena::where('token', $token)
            ->where('usado', false)
            ->first();

        if (!$recovery) {
            return response()->json([
                'message' => 'El enlace o codigo no es valido.'
            ], 404);
        }

        if (Carbon::parse($recovery->expira_en)->isPast()) {
            return response()->json([
                'message' => 'El enlace o codigo expiro.'
            ], 410);
        }

        return response()->json([
            'message' => 'Token valido.'
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $recovery = RecuperacionContrasena::where('token', $request->token)
            ->where('usado', false)
            ->first();

        if (!$recovery) {
            return response()->json([
                'message' => 'El enlace o codigo no es valido.'
            ], 404);
        }

        if (Carbon::parse($recovery->expira_en)->isPast()) {
            return response()->json([
                'message' => 'El enlace o codigo expiro.'
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
            'message' => 'Contrasena actualizada correctamente.'
        ]);
    }

    private function generateTemporaryPassword(int $length = 12): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*';
        $password = '';
        $max = strlen($alphabet) - 1;

        for ($index = 0; $index < $length; $index++) {
            $password .= $alphabet[random_int(0, $max)];
        }

        return $password;
    }
}

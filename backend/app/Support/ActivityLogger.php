<?php

namespace App\Support;

use App\Models\RegistroActividad;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Throwable;

class ActivityLogger
{
    public static function log(?Request $request, ?Usuario $usuario, string $categoria, string $tipo, string $descripcion, array $context = []): void
    {
        try {
            RegistroActividad::create([
                'usuario_id' => $usuario?->id,
                'actor_nombre' => self::resolveActorName($usuario),
                'actor_correo' => $usuario?->correo,
                'actor_rol' => $usuario?->rol,
                'categoria' => $categoria,
                'tipo' => $tipo,
                'descripcion' => $descripcion,
                'ip_usuario' => $request?->ip(),
                'entidad_tipo' => $context['entidad_tipo'] ?? null,
                'entidad_id' => $context['entidad_id'] ?? null,
                'meta' => $context['meta'] ?? null,
                'creado_en' => now(),
            ]);
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    private static function resolveActorName(?Usuario $usuario): ?string
    {
        if (!$usuario) {
            return null;
        }

        if ($usuario->relationLoaded('perfil') && $usuario->perfil?->nombre_completo) {
            return $usuario->perfil->nombre_completo;
        }

        $profileName = $usuario->perfil()->value('nombre_completo');

        if ($profileName) {
            return $profileName;
        }

        return $usuario->nombre ?: $usuario->correo;
    }
}

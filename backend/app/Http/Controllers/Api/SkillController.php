<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habilidad;
use App\Models\Perfil;
use App\Models\PerfilHabilidad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class SkillController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('auth_usuario');

        if (!$usuario) {
        return response()->json([
            'message' => 'Usuario autenticado no encontrado.'
        ], 401);
    }

        $perfil = Perfil::where('usuario_id', $usuario->id)->first();

        if (!$perfil) {
            return response()->json([
                'message' => 'El usuario no tiene un perfil registrado.'
            ], 404);
        }

        $habilidades = PerfilHabilidad::with('habilidad')
            ->where('perfil_id', $perfil->id)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'perfil_id' => $item->perfil_id,
                    'habilidad_id' => $item->habilidad_id,
                    'nombre' => $item->habilidad?->nombre,
                    'tipo' => $item->habilidad?->tipo,
                    'categoria' => $item->habilidad?->categoria,
                    'nivel' => $item->nivel,
                    'es_visible' => $item->es_visible,
                    'anios_experiencia' => $item->anios_experiencia,
                ];
            });

        return response()->json([
            'message' => 'Habilidades obtenidas correctamente.',
            'data' => $habilidades
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('auth_usuario');

        if (!$usuario) {
        return response()->json([
            'message' => 'Usuario autenticado no encontrado.'
        ], 401);
    }

        $perfil = Perfil::where('usuario_id', $usuario->id)->first();

        if (!$perfil) {
            return response()->json([
                'message' => 'El usuario no tiene un perfil registrado.'
            ], 404);
        }

        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'tipo' => ['required', Rule::in(['tecnica', 'blanda'])],
            'categoria' => ['nullable', 'string', 'max:100'],
            'nivel' => ['required', Rule::in(['basico', 'intermedio', 'avanzado'])],
            'es_visible' => ['nullable', 'boolean'],
            'anios_experiencia' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validated['tipo'] === 'tecnica' && empty($validated['categoria'])) {
            return response()->json([
                'message' => 'La categoría es obligatoria para habilidades técnicas.'
            ], 422);
        }

        if ($validated['tipo'] === 'blanda') {
            $validated['categoria'] = null;
        }

        $habilidad = Habilidad::where('nombre', $validated['nombre'])
            ->where('tipo', $validated['tipo'])
            ->where(function ($query) use ($validated) {
                if (is_null($validated['categoria'])) {
                    $query->whereNull('categoria');
                } else {
                    $query->where('categoria', $validated['categoria']);
                }
            })
            ->first();

        if (!$habilidad) {
            $habilidad = Habilidad::create([
                'nombre' => $validated['nombre'],
                'tipo' => $validated['tipo'],
                'categoria' => $validated['categoria'],
                'creado_en' => Carbon::now(),
                'actualizado_en' => Carbon::now(),
            ]);
        }

        $yaExisteEnPerfil = PerfilHabilidad::where('perfil_id', $perfil->id)
            ->where('habilidad_id', $habilidad->id)
            ->first();

        if ($yaExisteEnPerfil) {
            return response()->json([
                'message' => 'La habilidad ya está registrada en el perfil.'
            ], 409);
        }

        $perfilHabilidad = PerfilHabilidad::create([
            'perfil_id' => $perfil->id,
            'habilidad_id' => $habilidad->id,
            'nivel' => $validated['nivel'],
            'es_visible' => $validated['es_visible'] ?? false,
            'anios_experiencia' => $validated['anios_experiencia'] ?? null,
            'creado_en' => Carbon::now(),
            'actualizado_en' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Habilidad registrada correctamente.',
            'data' => [
                'id' => $perfilHabilidad->id,
                'perfil_id' => $perfilHabilidad->perfil_id,
                'habilidad_id' => $perfilHabilidad->habilidad_id,
                'nombre' => $habilidad->nombre,
                'tipo' => $habilidad->tipo,
                'categoria' => $habilidad->categoria,
                'nivel' => $perfilHabilidad->nivel,
                'es_visible' => $perfilHabilidad->es_visible,
                'anios_experiencia' => $perfilHabilidad->anios_experiencia,
            ]
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $usuario = $request->attributes->get('auth_usuario');

        if (!$usuario) {
        return response()->json([
            'message' => 'Usuario autenticado no encontrado.'
        ], 401);
    }
        $perfil = Perfil::where('usuario_id', $usuario->id)->first();

        if (!$perfil) {
            return response()->json([
                'message' => 'El usuario no tiene un perfil registrado.'
            ], 404);
        }

        $perfilHabilidad = PerfilHabilidad::with('habilidad')
            ->where('id', $id)
            ->where('perfil_id', $perfil->id)
            ->first();

        if (!$perfilHabilidad) {
            return response()->json([
                'message' => 'La habilidad no existe en el perfil del usuario.'
            ], 404);
        }

        $validated = $request->validate([
            'nivel' => ['sometimes', Rule::in(['basico', 'intermedio', 'avanzado'])],
            'es_visible' => ['sometimes', 'boolean'],
            'anios_experiencia' => ['nullable', 'integer', 'min:0'],
        ]);

        if (array_key_exists('nivel', $validated)) {
            $perfilHabilidad->nivel = $validated['nivel'];
        }

        if (array_key_exists('es_visible', $validated)) {
            $perfilHabilidad->es_visible = $validated['es_visible'];
        }

        if (array_key_exists('anios_experiencia', $validated)) {
            $perfilHabilidad->anios_experiencia = $validated['anios_experiencia'];
        }

        $perfilHabilidad->actualizado_en = Carbon::now();
        $perfilHabilidad->save();

        return response()->json([
            'message' => 'Habilidad actualizada correctamente.',
            'data' => [
                'id' => $perfilHabilidad->id,
                'perfil_id' => $perfilHabilidad->perfil_id,
                'habilidad_id' => $perfilHabilidad->habilidad_id,
                'nombre' => $perfilHabilidad->habilidad?->nombre,
                'tipo' => $perfilHabilidad->habilidad?->tipo,
                'categoria' => $perfilHabilidad->habilidad?->categoria,
                'nivel' => $perfilHabilidad->nivel,
                'es_visible' => $perfilHabilidad->es_visible,
                'anios_experiencia' => $perfilHabilidad->anios_experiencia,
            ]
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $usuario = $request->attributes->get('auth_usuario');

        if (!$usuario) {
        return response()->json([
            'message' => 'Usuario autenticado no encontrado.'
        ], 401);
    }

        $perfil = Perfil::where('usuario_id', $usuario->id)->first();

        if (!$perfil) {
            return response()->json([
                'message' => 'El usuario no tiene un perfil registrado.'
            ], 404);
        }

        $perfilHabilidad = PerfilHabilidad::where('id', $id)
            ->where('perfil_id', $perfil->id)
            ->first();

        if (!$perfilHabilidad) {
            return response()->json([
                'message' => 'La habilidad no existe en el perfil del usuario.'
            ], 404);
        }

        $perfilHabilidad->delete();

        return response()->json([
            'message' => 'Habilidad eliminada correctamente.'
        ]);
    }

    public function toggleVisibility(Request $request, int $id): JsonResponse
    {
        $usuario = $request->attributes->get('auth_usuario');

        if (!$usuario) {
        return response()->json([
            'message' => 'Usuario autenticado no encontrado.'
        ], 401);
    }

        $perfil = Perfil::where('usuario_id', $usuario->id)->first();

        if (!$perfil) {
            return response()->json([
                'message' => 'El usuario no tiene un perfil registrado.'
            ], 404);
        }

        $perfilHabilidad = PerfilHabilidad::with('habilidad')
            ->where('id', $id)
            ->where('perfil_id', $perfil->id)
            ->first();

        if (!$perfilHabilidad) {
            return response()->json([
                'message' => 'La habilidad no existe en el perfil del usuario.'
            ], 404);
        }

        $perfilHabilidad->es_visible = !$perfilHabilidad->es_visible;
        $perfilHabilidad->actualizado_en = Carbon::now();
        $perfilHabilidad->save();

        return response()->json([
            'message' => 'Visibilidad de la habilidad actualizada correctamente.',
            'data' => [
                'id' => $perfilHabilidad->id,
                'es_visible' => $perfilHabilidad->es_visible,
            ]
        ]);
    }
}
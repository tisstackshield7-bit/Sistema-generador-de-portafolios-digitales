<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Experience\StoreExperienceRequest;
use App\Http\Requests\Experience\UpdateExperienceRequest;
use App\Http\Requests\Experience\UpdateExperienceVisibilityRequest;
use App\Models\Experiencia;
use App\Models\Perfil;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    public function index(Request $request)
    {
        $perfil = $this->resolveProfile($request);

        $experiencias = Experiencia::where('perfil_id', $perfil->id)
            ->orderByDesc('fecha_inicio')
            ->orderByDesc('creado_en')
            ->get();

        return response()->json([
            'experiencias' => $experiencias,
        ]);
    }

    public function store(StoreExperienceRequest $request)
    {
        $perfil = $this->resolveProfile($request);

        $experiencia = Experiencia::create([
            'perfil_id' => $perfil->id,
            ...$request->validated(),
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        return response()->json([
            'message' => 'Experiencia creada correctamente.',
            'experiencia' => $experiencia,
        ], 201);
    }

    public function update(UpdateExperienceRequest $request, int $experienciaId)
    {
        $experiencia = $this->resolveOwnedExperience($request, $experienciaId);

        $experiencia->fill($request->validated());
        $experiencia->actualizado_en = now();
        $experiencia->save();

        return response()->json([
            'message' => 'Experiencia actualizada correctamente.',
            'experiencia' => $experiencia,
        ]);
    }

    public function updateVisibility(UpdateExperienceVisibilityRequest $request, int $experienciaId)
    {
        $experiencia = $this->resolveOwnedExperience($request, $experienciaId);

        $experiencia->visible_publico = $request->boolean('visible_publico');
        $experiencia->actualizado_en = now();
        $experiencia->save();

        return response()->json([
            'message' => 'Visibilidad actualizada correctamente.',
            'experiencia' => $experiencia,
        ]);
    }

    public function destroy(Request $request, int $experienciaId)
    {
        $experiencia = $this->resolveOwnedExperience($request, $experienciaId);
        $experiencia->delete();

        return response()->json([
            'message' => 'Experiencia eliminada correctamente.',
        ]);
    }

    private function resolveProfile(Request $request): Perfil
    {
        $usuario = $request->attributes->get('auth_usuario');

        return Perfil::where('usuario_id', $usuario->id)->firstOrFail();
    }

    private function resolveOwnedExperience(Request $request, int $experienciaId): Experiencia
    {
        $perfil = $this->resolveProfile($request);

        return Experiencia::where('perfil_id', $perfil->id)->findOrFail($experienciaId);
    }
}

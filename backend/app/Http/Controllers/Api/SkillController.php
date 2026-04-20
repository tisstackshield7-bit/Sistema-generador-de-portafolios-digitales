<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Skill\StoreSkillRequest;
use App\Http\Requests\Skill\UpdateSkillRequest;
use App\Http\Requests\Skill\UpdateSkillVisibilityRequest;
use App\Models\Habilidad;
use App\Models\Perfil;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    public function index(Request $request)
    {
        $perfil = $this->resolveProfile($request);

        $habilidades = Habilidad::where('perfil_id', $perfil->id)
            ->orderBy('tipo')
            ->orderByDesc('creado_en')
            ->get();

        return response()->json([
            'habilidades' => $habilidades,
            'categorias_tecnicas' => StoreSkillRequest::TECHNICAL_CATEGORIES,
            'categorias_blandas' => StoreSkillRequest::SOFT_CATEGORIES,
            'niveles_dominio' => StoreSkillRequest::LEVELS,
        ]);
    }

    public function store(StoreSkillRequest $request)
    {
        $perfil = $this->resolveProfile($request);

        $habilidad = Habilidad::create([
            'perfil_id' => $perfil->id,
            'tipo' => $request->tipo,
            'nombre' => trim($request->nombre),
            'categoria' => $request->categoria,
            'nivel_dominio' => $request->nivel_dominio,
            'visible_publico' => (bool) $request->boolean('visible_publico', false),
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        return response()->json([
            'message' => 'Habilidad creada correctamente.',
            'habilidad' => $habilidad,
        ], 201);
    }

    public function update(UpdateSkillRequest $request, int $habilidadId)
    {
        $habilidad = $this->resolveOwnedSkill($request, $habilidadId);

        $habilidad->tipo = $request->tipo;
        $habilidad->nombre = trim($request->nombre);
        $habilidad->categoria = $request->categoria;
        $habilidad->nivel_dominio = $request->nivel_dominio;
        $habilidad->visible_publico = (bool) $request->boolean('visible_publico', false);
        $habilidad->actualizado_en = now();
        $habilidad->save();

        return response()->json([
            'message' => 'Habilidad actualizada correctamente.',
            'habilidad' => $habilidad,
        ]);
    }

    public function updateVisibility(UpdateSkillVisibilityRequest $request, int $habilidadId)
    {
        $habilidad = $this->resolveOwnedSkill($request, $habilidadId);

        $habilidad->visible_publico = $request->boolean('visible_publico');
        $habilidad->actualizado_en = now();
        $habilidad->save();

        return response()->json([
            'message' => 'Visibilidad actualizada correctamente.',
            'habilidad' => $habilidad,
        ]);
    }

    public function destroy(Request $request, int $habilidadId)
    {
        $habilidad = $this->resolveOwnedSkill($request, $habilidadId);
        $habilidad->delete();

        return response()->json([
            'message' => 'Habilidad eliminada correctamente.',
        ]);
    }

    private function resolveProfile(Request $request): Perfil
    {
        $usuario = $request->attributes->get('auth_usuario');

        return Perfil::where('usuario_id', $usuario->id)->firstOrFail();
    }

    private function resolveOwnedSkill(Request $request, int $habilidadId): Habilidad
    {
        $perfil = $this->resolveProfile($request);

        return Habilidad::where('perfil_id', $perfil->id)->findOrFail($habilidadId);
    }
}

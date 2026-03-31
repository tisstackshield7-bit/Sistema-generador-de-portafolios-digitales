<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    /**
     * Listar habilidades del usuario.
     */
    public function index(Request $request)
    {
        $skills = $request->user()
            ->skills()
            ->orderBy('order')
            ->get();

        return response()->json($skills);
    }

    /**
     * Crear una nueva habilidad.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'proficiency_level' => 'required|in:beginner,intermediate,advanced,expert',
            'order' => 'nullable|integer',
        ]);

        $skill = $request->user()->skills()->create($validated);

        return response()->json([
            'message' => 'Habilidad creada exitosamente',
            'skill' => $skill,
        ], 201);
    }

    /**
     * Obtener una habilidad específica.
     */
    public function show(Skill $skill)
    {
        return response()->json($skill);
    }

    /**
     * Actualizar una habilidad.
     */
    public function update(Request $request, Skill $skill)
    {
        $this->authorize('update', $skill);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'nullable|string|max:255',
            'proficiency_level' => 'sometimes|in:beginner,intermediate,advanced,expert',
            'order' => 'nullable|integer',
        ]);

        $skill->update($validated);

        return response()->json([
            'message' => 'Habilidad actualizada exitosamente',
            'skill' => $skill,
        ]);
    }

    /**
     * Eliminar una habilidad.
     */
    public function destroy(Request $request, Skill $skill)
    {
        $this->authorize('delete', $skill);

        $skill->delete();

        return response()->json([
            'message' => 'Habilidad eliminada exitosamente',
        ]);
    }

    /**
     * Obtener habilidades por categoría.
     */
    public function byCategory(Request $request)
    {
        $skills = $request->user()
            ->skills()
            ->get()
            ->groupBy('category');

        return response()->json($skills);
    }
}

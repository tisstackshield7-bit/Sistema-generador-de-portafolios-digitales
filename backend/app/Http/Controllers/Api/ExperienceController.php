<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    /**
     * Listar experiencias del usuario.
     */
    public function index(Request $request)
    {
        $experiences = $request->user()
            ->experiences()
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json($experiences);
    }

    /**
     * Crear una nueva experiencia.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'company_logo_url' => 'nullable|url',
        ]);

        $experience = $request->user()->experiences()->create($validated);

        return response()->json([
            'message' => 'Experiencia creada exitosamente',
            'experience' => $experience,
        ], 201);
    }

    /**
     * Obtener una experiencia específica.
     */
    public function show(Experience $experience)
    {
        return response()->json($experience);
    }

    /**
     * Actualizar una experiencia.
     */
    public function update(Request $request, Experience $experience)
    {
        $this->authorize('update', $experience);

        $validated = $request->validate([
            'job_title' => 'sometimes|string|max:255',
            'company' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_current' => 'sometimes|boolean',
            'description' => 'nullable|string',
            'company_logo_url' => 'nullable|url',
        ]);

        $experience->update($validated);

        return response()->json([
            'message' => 'Experiencia actualizada exitosamente',
            'experience' => $experience,
        ]);
    }

    /**
     * Eliminar una experiencia.
     */
    public function destroy(Request $request, Experience $experience)
    {
        $this->authorize('delete', $experience);

        $experience->delete();

        return response()->json([
            'message' => 'Experiencia eliminada exitosamente',
        ]);
    }
}

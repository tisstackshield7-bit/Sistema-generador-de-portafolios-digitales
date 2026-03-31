<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Education;
use Illuminate\Http\Request;

class EducationController extends Controller
{
    /**
     * Listar educación del usuario.
     */
    public function index(Request $request)
    {
        $education = $request->user()
            ->education()
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json($education);
    }

    /**
     * Crear una nueva educación.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'institution' => 'required|string|max:255',
            'degree' => 'required|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'certificate_url' => 'nullable|url',
            'institution_logo_url' => 'nullable|url',
        ]);

        $education = $request->user()->education()->create($validated);

        return response()->json([
            'message' => 'Educación creada exitosamente',
            'education' => $education,
        ], 201);
    }

    /**
     * Obtener una educación específica.
     */
    public function show(Education $education)
    {
        return response()->json($education);
    }

    /**
     * Actualizar una educación.
     */
    public function update(Request $request, Education $education)
    {
        $this->authorize('update', $education);

        $validated = $request->validate([
            'institution' => 'sometimes|string|max:255',
            'degree' => 'sometimes|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_current' => 'sometimes|boolean',
            'description' => 'nullable|string',
            'certificate_url' => 'nullable|url',
            'institution_logo_url' => 'nullable|url',
        ]);

        $education->update($validated);

        return response()->json([
            'message' => 'Educación actualizada exitosamente',
            'education' => $education,
        ]);
    }

    /**
     * Eliminar una educación.
     */
    public function destroy(Request $request, Education $education)
    {
        $this->authorize('delete', $education);

        $education->delete();

        return response()->json([
            'message' => 'Educación eliminada exitosamente',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Technology;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Listar proyectos del usuario.
     */
    public function index(Request $request)
    {
        $projects = $request->user()
            ->projects()
            ->with('technologies')
            ->orderBy('order')
            ->get();

        return response()->json($projects);
    }

    /**
     * Crear un nuevo proyecto.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'portfolio_id' => 'nullable|exists:portfolios,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail_url' => 'nullable|url',
            'project_url' => 'nullable|url',
            'github_url' => 'nullable|url',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'featured' => 'boolean',
            'technologies' => 'nullable|array',
            'technologies.*' => 'exists:technologies,id',
        ]);

        $technologies = $validated['technologies'] ?? [];
        unset($validated['technologies']);

        $project = $request->user()->projects()->create($validated);

        if (!empty($technologies)) {
            $project->technologies()->attach($technologies);
        }

        return response()->json([
            'message' => 'Proyecto creado exitosamente',
            'project' => $project->load('technologies'),
        ], 201);
    }

    /**
     * Obtener un proyecto específico.
     */
    public function show(Project $project)
    {
        $project->load('technologies', 'user');
        return response()->json($project);
    }

    /**
     * Actualizar un proyecto.
     */
    public function update(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'portfolio_id' => 'sometimes|nullable|exists:portfolios,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'thumbnail_url' => 'nullable|url',
            'project_url' => 'nullable|url',
            'github_url' => 'nullable|url',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'featured' => 'sometimes|boolean',
            'order' => 'sometimes|integer',
            'technologies' => 'nullable|array',
            'technologies.*' => 'exists:technologies,id',
        ]);

        $technologies = $validated['technologies'] ?? null;
        unset($validated['technologies']);

        $project->update($validated);

        if ($technologies !== null) {
            $project->technologies()->sync($technologies);
        }

        return response()->json([
            'message' => 'Proyecto actualizado exitosamente',
            'project' => $project->load('technologies'),
        ]);
    }

    /**
     * Eliminar un proyecto.
     */
    public function destroy(Request $request, Project $project)
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->json([
            'message' => 'Proyecto eliminado exitosamente',
        ]);
    }

    /**
     * Obtener todas las tecnologías disponibles.
     */
    public function technologies()
    {
        $technologies = Technology::orderBy('name')->get();

        return response()->json($technologies);
    }

    /**
     * Obtener proyectos públicos de un usuario.
     */
    public function publicProjects($userId)
    {
        $projects = Project::where('user_id', $userId)
            ->where('featured', true)
            ->with('technologies')
            ->orderBy('order')
            ->get();

        return response()->json($projects);
    }
}

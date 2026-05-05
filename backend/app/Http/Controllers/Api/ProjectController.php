<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Requests\Project\UpdateProjectVisibilityRequest;
use App\Models\Perfil;
use App\Models\Proyecto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $perfil = $this->resolveProfile($request);

        $proyectos = Proyecto::where('perfil_id', $perfil->id)
            ->orderByDesc('fecha_inicio')
            ->orderByDesc('creado_en')
            ->get();

        return response()->json([
            'proyectos' => $proyectos,
        ]);
    }

    public function store(StoreProjectRequest $request)
    {
        $perfil = $this->resolveProfile($request);
        $payload = $request->validated();

        unset($payload['imagen_archivo']);

        if ($request->hasFile('imagen_archivo')) {
            $payload['url_imagen'] = $request->file('imagen_archivo')->store('proyectos', 'public');
        }

        $proyecto = Proyecto::create([
            'perfil_id' => $perfil->id,
            ...$payload,
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        return response()->json([
            'message' => 'Proyecto creado correctamente.',
            'proyecto' => $proyecto,
        ], 201);
    }

    public function update(UpdateProjectRequest $request, int $proyectoId)
    {
        $proyecto = $this->resolveOwnedProject($request, $proyectoId);
        $payload = $request->validated();

        unset($payload['imagen_archivo']);

        if ($request->hasFile('imagen_archivo')) {
            $this->deleteProjectImageIfStoredLocally($proyecto->url_imagen);
            $payload['url_imagen'] = $request->file('imagen_archivo')->store('proyectos', 'public');
        } elseif (array_key_exists('url_imagen', $payload) && $payload['url_imagen'] !== $proyecto->url_imagen) {
            $this->deleteProjectImageIfStoredLocally($proyecto->url_imagen);
        }

        $proyecto->fill($payload);
        $proyecto->actualizado_en = now();
        $proyecto->save();

        return response()->json([
            'message' => 'Proyecto actualizado correctamente.',
            'proyecto' => $proyecto,
        ]);
    }

    public function updateVisibility(UpdateProjectVisibilityRequest $request, int $proyectoId)
    {
        $proyecto = $this->resolveOwnedProject($request, $proyectoId);

        $proyecto->visible_publico = $request->boolean('visible_publico');
        $proyecto->actualizado_en = now();
        $proyecto->save();

        return response()->json([
            'message' => 'Visibilidad actualizada correctamente.',
            'proyecto' => $proyecto,
        ]);
    }

    public function destroy(Request $request, int $proyectoId)
    {
        $proyecto = $this->resolveOwnedProject($request, $proyectoId);
        $this->deleteProjectImageIfStoredLocally($proyecto->url_imagen);
        $proyecto->delete();

        return response()->json([
            'message' => 'Proyecto eliminado correctamente.',
        ]);
    }

    private function resolveProfile(Request $request): Perfil
    {
        $usuario = $request->attributes->get('auth_usuario');

        return Perfil::where('usuario_id', $usuario->id)->firstOrFail();
    }

    private function resolveOwnedProject(Request $request, int $proyectoId): Proyecto
    {
        $perfil = $this->resolveProfile($request);

        return Proyecto::where('perfil_id', $perfil->id)->findOrFail($proyectoId);
    }

    private function deleteProjectImageIfStoredLocally(?string $path): void
    {
        if (!$path || filter_var($path, FILTER_VALIDATE_URL)) {
            return;
        }

        Storage::disk('public')->delete($path);
    }
}

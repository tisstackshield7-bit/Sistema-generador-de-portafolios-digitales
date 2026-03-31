<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SocialLink;
use Illuminate\Http\Request;

class SocialLinkController extends Controller
{
    /**
     * Listar enlaces sociales del usuario.
     */
    public function index(Request $request)
    {
        $socialLinks = $request->user()
            ->socialLinks()
            ->get();

        return response()->json($socialLinks);
    }

    /**
     * Crear un nuevo enlace social.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'platform' => 'required|in:' . implode(',', SocialLink::PLATFORMS),
            'url' => 'required|url',
            'icon' => 'nullable|string|max:255',
            'display_label' => 'nullable|string|max:255',
        ]);

        $socialLink = $request->user()->socialLinks()->create($validated);

        return response()->json([
            'message' => 'Enlace social creado exitosamente',
            'social_link' => $socialLink,
        ], 201);
    }

    /**
     * Obtener un enlace social específico.
     */
    public function show(SocialLink $socialLink)
    {
        return response()->json($socialLink);
    }

    /**
     * Actualizar un enlace social.
     */
    public function update(Request $request, SocialLink $socialLink)
    {
        $this->authorize('update', $socialLink);

        $validated = $request->validate([
            'platform' => 'sometimes|in:' . implode(',', SocialLink::PLATFORMS),
            'url' => 'sometimes|url',
            'icon' => 'nullable|string|max:255',
            'display_label' => 'nullable|string|max:255',
        ]);

        $socialLink->update($validated);

        return response()->json([
            'message' => 'Enlace social actualizado exitosamente',
            'social_link' => $socialLink,
        ]);
    }

    /**
     * Eliminar un enlace social.
     */
    public function destroy(Request $request, SocialLink $socialLink)
    {
        $this->authorize('delete', $socialLink);

        $socialLink->delete();

        return response()->json([
            'message' => 'Enlace social eliminado exitosamente',
        ]);
    }

    /**
     * Obtener plataformas disponibles.
     */
    public function platforms()
    {
        return response()->json([
            'platforms' => SocialLink::PLATFORMS,
        ]);
    }
}

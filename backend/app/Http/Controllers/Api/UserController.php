<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Obtener el perfil del usuario autenticado.
     */
    public function show(Request $request)
    {
        $user = $request->user()->load([
            'portfolios',
            'experiences',
            'projects',
            'skills',
            'education',
            'socialLinks'
        ]);

        return response()->json($user);
    }

    /**
     * Actualizar el perfil del usuario.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'professional_title' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'avatar_url' => 'nullable|url',
            'cover_image_url' => 'nullable|url',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Perfil actualizado exitosamente',
            'user' => $user,
        ]);
    }

    /**
     * Cambiar contraseña.
     */
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $request->user()->update([
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Contraseña actualizada exitosamente',
        ]);
    }

    /**
     * Obtener perfil público de un usuario.
     */
    public function publicProfile($id)
    {
        $user = User::findOrFail($id)
            ->load([
                'portfolios' => fn($q) => $q->where('is_published', true),
                'experiences',
                'projects' => fn($q) => $q->where('featured', true),
                'skills',
                'education',
                'socialLinks'
            ]);

        return response()->json($user);
    }
}

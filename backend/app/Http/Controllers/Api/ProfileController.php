<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\StoreBasicProfileRequest;
use App\Http\Requests\Profile\UpdateBasicProfileRequest;
use App\Models\Perfil;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function storeBasic(StoreBasicProfileRequest $request)
    {
        $usuario = $request->attributes->get('auth_usuario');

        $nombreCompleto = trim($request->nombres . ' ' . $request->apellidos);

        $slugBase = Str::slug($nombreCompleto);
        $slug = $this->generateUniqueSlug($slugBase);

        $rutaFoto = null;

        if ($request->hasFile('foto_perfil')) {
            $rutaFoto = $request->file('foto_perfil')->store('perfiles', 'public');
        }

        $perfil = Perfil::create([
            'usuario_id' => $usuario->id,
            'nombre_completo' => $nombreCompleto,
            'profesion' => $request->profesion,
            'titular_profesional' => $request->profesion,
            'biografia' => $request->biografia,
            'foto_perfil' => $rutaFoto,
            'es_publico' => true,
            'slug' => $slug,
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        return response()->json([
            'message' => 'Información básica guardada correctamente.',
            'perfil' => $perfil,
        ], 201);
    }

    public function showMine(Request $request)
    {
        $usuario = $request->attributes->get('auth_usuario');

        $perfil = Perfil::where('usuario_id', $usuario->id)->first();

        return response()->json([
            'perfil' => $perfil,
        ]);
    }

    public function updateBasic(UpdateBasicProfileRequest $request)
    {
        $usuario = $request->attributes->get('auth_usuario');

        $perfil = Perfil::where('usuario_id', $usuario->id)->firstOrFail();

        $nombreCompleto = trim($request->nombres . ' ' . $request->apellidos);

        $perfil->nombre_completo = $nombreCompleto;
        $perfil->profesion = $request->profesion;
        $perfil->titular_profesional = $request->profesion;
        $perfil->biografia = $request->biografia;

        if ($request->hasFile('foto_perfil')) {
            $perfil->foto_perfil = $request->file('foto_perfil')->store('perfiles', 'public');
        }

        $perfil->actualizado_en = now();
        $perfil->save();

        return response()->json([
            'message' => 'Información actualizada correctamente.',
            'perfil' => $perfil,
        ]);
    }

    private function generateUniqueSlug(string $slugBase): string
    {
        $slug = $slugBase ?: 'perfil';
        $original = $slug;
        $count = 1;

        while (Perfil::where('slug', $slug)->exists()) {
            $slug = $original . '-' . $count;
            $count++;
        }

        return $slug;
    }

    public function listPublic()
    {
        $perfiles = Perfil::where('es_publico', true)
            ->latest('creado_en')
            ->limit(20)
            ->get([
                'id',
                'nombre_completo',
                'profesion',
                'titular_profesional',
                'biografia',
                'foto_perfil',
                'slug',
                'creado_en',
            ]);

        return response()->json([
            'perfiles' => $perfiles,
        ]);
    }
}

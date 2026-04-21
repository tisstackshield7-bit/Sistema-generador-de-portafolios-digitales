<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\StoreBasicProfileRequest;
use App\Http\Requests\Profile\UpdateBasicProfileRequest;
use App\Models\Perfil;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function storeBasic(StoreBasicProfileRequest $request)
    {
        $usuario = $request->attributes->get('auth_usuario');

        if (Perfil::where('usuario_id', $usuario->id)->exists()) {
            return response()->json([
                'message' => 'Ya existe un perfil para esta cuenta.',
            ], 409);
        }

        $nombreCompleto = trim($request->nombres . ' ' . $request->apellidos);

        $slugBase = Str::slug($nombreCompleto);
        $slug = $this->generateUniqueSlug($slugBase);

        $rutaFoto = null;

        if ($request->hasFile('foto_perfil')) {
            $rutaFoto = $request->file('foto_perfil')->store('perfiles', 'public');
        }

        $perfilData = [
            'usuario_id' => $usuario->id,
            'nombre_completo' => $nombreCompleto,
            'profesion' => $request->profesion,
            'titular_profesional' => $request->profesion,
            'telefono' => $request->telefono,
            'biografia' => $request->biografia,
            'foto_perfil' => $rutaFoto,
            'es_publico' => true,
            'slug' => $slug,
            'creado_en' => now(),
            'actualizado_en' => now(),
        ];

        if ($this->hasSplitNameColumns()) {
            $perfilData['nombres'] = $request->nombres;
            $perfilData['apellidos'] = $request->apellidos;
        }

        $perfil = Perfil::create($perfilData);

        return response()->json([
            'message' => 'Información básica guardada correctamente.',
            'perfil' => $perfil,
        ], 201);
    }

    public function showMine(Request $request)
    {
        $usuario = $request->attributes->get('auth_usuario');

        $perfil = Perfil::with(['habilidades' => function ($query) {
            $query->orderBy('tipo')->orderByDesc('creado_en');
        }])->where('usuario_id', $usuario->id)->first();

        return response()->json([
            'perfil' => $perfil,
        ]);
    }

    public function updateBasic(UpdateBasicProfileRequest $request)
    {
        $usuario = $request->attributes->get('auth_usuario');

        $perfil = Perfil::where('usuario_id', $usuario->id)->firstOrFail();

        $nombreCompleto = trim($request->nombres . ' ' . $request->apellidos);

        if ($this->hasSplitNameColumns()) {
            $perfil->nombres = $request->nombres;
            $perfil->apellidos = $request->apellidos;
        }

        $perfil->nombre_completo = $nombreCompleto;
        $perfil->profesion = $request->profesion;
        $perfil->titular_profesional = $request->profesion;
        $perfil->telefono = $request->telefono;
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

    private function hasSplitNameColumns(): bool
    {
        return Schema::hasColumns('perfiles', ['nombres', 'apellidos']);
    }

    public function listPublic()
    {
        $perfiles = Perfil::with(['habilidades' => function ($query) {
            $query->where('visible_publico', true)
                ->orderBy('tipo')
                ->orderByDesc('creado_en');
        }])->where('es_publico', true)
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

    public function showPublicBySlug(string $slug)
    {
        $perfil = Perfil::with(['habilidades' => function ($query) {
            $query->where('visible_publico', true)
                ->orderBy('tipo')
                ->orderByDesc('creado_en');
        }])->where('es_publico', true)
            ->where('slug', $slug)
            ->first();

        if (!$perfil) {
            return response()->json([
                'message' => 'Perfil publico no encontrado.',
            ], 404);
        }

        return response()->json([
            'perfil' => $perfil,
        ]);
    }
}

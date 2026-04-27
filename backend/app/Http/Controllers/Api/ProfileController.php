<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\StoreBasicProfileRequest;
use App\Http\Requests\Profile\UpdateBasicProfileRequest;
use App\Models\Perfil;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function storeBasic(StoreBasicProfileRequest $request)
    {
        $usuario = $request->attributes->get('auth_usuario');

        if (Perfil::where('usuario_id', $usuario->id)->exists()) {
            return $this->updateExistingProfile($request);
        }

        $nombreCompleto = trim($request->nombres . ' ' . $request->apellidos);

        $slugBase = Str::slug($nombreCompleto);
        $slug = $this->generateUniqueSlug($slugBase);

        $rutaFoto = null;

        if ($request->hasFile('foto_perfil')) {
            $rutaFoto = $this->storeProfilePhoto($request);

            if (!$rutaFoto) {
                return $this->photoUploadFailedResponse();
            }
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
            'message' => 'Informacion basica guardada correctamente.',
            'perfil' => $this->profileResponseData($perfil),
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
        return $this->updateExistingProfile($request);
    }

    private function updateExistingProfile(Request $request)
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
            $rutaFoto = $this->storeProfilePhoto($request);

            if (!$rutaFoto) {
                return $this->photoUploadFailedResponse();
            }

            $perfil->foto_perfil = $rutaFoto;
        }

        $perfil->actualizado_en = now();
        $perfil->save();

        return response()->json([
            'message' => 'Informacion actualizada correctamente.',
            'perfil' => $this->profileResponseData($perfil),
        ]);
    }

    private function profileResponseData(Perfil $perfil): array
    {
        return [
            'id' => $perfil->id,
            'usuario_id' => $perfil->usuario_id,
            'nombres' => $this->cleanUtf8($perfil->nombres),
            'apellidos' => $this->cleanUtf8($perfil->apellidos),
            'nombre_completo' => $this->cleanUtf8($perfil->nombre_completo),
            'profesion' => $this->cleanUtf8($perfil->profesion),
            'titular_profesional' => $this->cleanUtf8($perfil->titular_profesional),
            'telefono' => $this->cleanUtf8($perfil->telefono),
            'biografia' => $this->cleanUtf8($perfil->biografia),
            'foto_perfil' => $this->cleanUtf8($perfil->foto_perfil),
            'slug' => $this->cleanUtf8($perfil->slug),
            'habilidades' => $perfil->relationLoaded('habilidades') ? $perfil->habilidades : [],
        ];
    }

    private function cleanUtf8(?string $value): ?string
    {
        if ($value === null || mb_check_encoding($value, 'UTF-8')) {
            return $value;
        }

        return mb_convert_encoding($value, 'UTF-8', 'UTF-8');
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

    private function storeProfilePhoto(Request $request): string|false
    {
        $file = $request->file('foto_perfil');
        $filename = $file->hashName();
        $relativePath = 'perfiles/'.$filename;
        $directory = base_path('public_html/storage/perfiles');

        try {
            File::ensureDirectoryExists($directory, 0775, true);
            $file->move($directory, $filename);

            return $relativePath;
        } catch (\Throwable $exception) {
            Log::error('Profile photo upload failed.', [
                'directory' => $directory,
                'message' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    private function photoUploadFailedResponse()
    {
        return response()->json([
            'message' => 'No se pudo guardar la foto de perfil. Verifica permisos de la carpeta de almacenamiento.',
        ], 500);
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

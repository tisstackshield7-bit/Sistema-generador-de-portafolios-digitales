<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\StoreBasicProfileRequest;
use App\Http\Requests\Profile\UpdateBasicProfileRequest;
use App\Models\Habilidad;
use App\Models\Perfil;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    private const DEFAULT_VISIBILITY = [
        'mostrar_correo' => true,
        'mostrar_telefono' => false,
        'mostrar_redes' => true,
        'mostrar_biografia' => true,
        'mostrar_habilidades' => true,
        'mostrar_proyectos' => true,
        'mostrar_experiencia' => true,
        'mostrar_evidencias' => true,
    ];

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
            'titular_profesional' => $request->titular_profesional,
            'telefono' => $request->telefono,
            'ubicacion' => $request->ubicacion,
            'biografia' => $request->biografia,
            'foto_perfil' => $rutaFoto,
            'visibilidad' => self::DEFAULT_VISIBILITY,
            'es_publico' => true,
            'slug' => $slug,
            'creado_en' => now(),
            'actualizado_en' => now(),
        ];

        if ($this->hasSplitNameColumns()) {
            $perfilData['nombres'] = $request->nombres;
            $perfilData['apellidos'] = $request->apellidos;
        }

        $perfil = Perfil::create($perfilData)->load('usuario:id,correo');

        ActivityLogger::log(
            $request,
            $usuario,
            'perfil',
            'perfil_creado',
            'Registro de perfil profesional.',
            [
                'entidad_tipo' => 'perfil',
                'entidad_id' => $perfil->id,
            ]
        );

        return response()->json([
            'message' => 'Información básica guardada correctamente.',
            'perfil' => $perfil,
        ], 201);
    }

    public function showMine(Request $request)
    {
        $usuario = $request->attributes->get('auth_usuario');

        $perfil = Perfil::with([
            'usuario:id,correo',
            'habilidades' => function ($query) {
                $query->orderBy('tipo')->orderByDesc('creado_en');
            },
            'habilidades.evidencias',
            'proyectos' => function ($query) {
                $query->orderByDesc('fecha_inicio')->orderByDesc('creado_en');
            },
            'experiencias' => function ($query) {
                $query->orderByDesc('fecha_inicio')->orderByDesc('creado_en');
            },
        ])->where('usuario_id', $usuario->id)->first();

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
        $perfil->titular_profesional = $request->titular_profesional;
        $perfil->telefono = $request->telefono;
        $perfil->ubicacion = $request->ubicacion;
        $perfil->biografia = $request->biografia;
        $perfil->linkedin_url = $request->linkedin_url;
        $perfil->github_url = $request->github_url;
        $perfil->sitio_web_url = $request->sitio_web_url;
        $perfil->visibilidad = array_merge(self::DEFAULT_VISIBILITY, $request->input('visibilidad', []));

        if ($request->hasFile('foto_perfil')) {
            $perfil->foto_perfil = $request->file('foto_perfil')->store('perfiles', 'public');
        }

        $perfil->actualizado_en = now();
        $perfil->save();
        $perfil->load('usuario:id,correo');

        ActivityLogger::log(
            $request,
            $usuario,
            'perfil',
            'perfil_actualizado',
            'Actualizacion de informacion basica del perfil.',
            [
                'entidad_tipo' => 'perfil',
                'entidad_id' => $perfil->id,
            ]
        );

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

    public function listPublic(Request $request)
    {
        $filters = $request->validate([
            'buscar' => ['nullable', 'string', 'max:120'],
            'categoria' => ['nullable', 'string', 'max:100'],
            'nivel' => ['nullable', 'string', 'in:Basico,Intermedio,Avanzado'],
            'rol' => ['nullable', 'string', 'max:150'],
            'experiencia_min' => ['nullable', 'numeric', 'min:0'],
            'experiencia_max' => ['nullable', 'numeric', 'min:0'],
            'tecnologias' => ['nullable', 'array'],
            'tecnologias.*' => ['string', 'max:150'],
            'nivel_tecnologia' => ['nullable', 'string', 'in:Basico,Intermedio,Avanzado'],
        ]);

        $search = trim($filters['buscar'] ?? '');
        $category = trim($filters['categoria'] ?? '');
        $level = $filters['nivel'] ?? null;
        $role = trim($filters['rol'] ?? '');
        $experienceMin = $filters['experiencia_min'] ?? null;
        $experienceMax = $filters['experiencia_max'] ?? null;
        $technologies = collect($filters['tecnologias'] ?? [])
            ->map(fn ($technology) => trim($technology))
            ->filter()
            ->unique()
            ->values();
        $technologyLevel = $filters['nivel_tecnologia'] ?? null;

        $applySkillFilters = function ($query) use ($category, $level) {
            $query->where('visible_publico', true)
                ->where('tipo', 'tecnica');

            if ($category !== '') {
                $query->where('categoria', $category);
            }

            if ($level) {
                $query->where('nivel_dominio', $level);
            }
        };

        $perfilesQuery = Perfil::with([
            'usuario:id,correo',
            'habilidades' => function ($query) use ($applySkillFilters) {
                $applySkillFilters($query);
                $query->orderBy('tipo')->orderByDesc('creado_en');
            },
            'habilidades.evidencias',
            'proyectos' => function ($query) {
                $query->where('visible_publico', true)
                    ->orderByDesc('fecha_inicio')
                    ->orderByDesc('creado_en');
            },
            'experiencias' => function ($query) {
                $query->where('visible_publico', true)
                    ->orderByDesc('fecha_inicio')
                    ->orderByDesc('creado_en');
            },
        ])->where('es_publico', true);

        if ($search !== '') {
            $perfilesQuery->where(function ($query) use ($search) {
                $query->where('nombre_completo', 'ilike', "%{$search}%")
                    ->orWhere('profesion', 'ilike', "%{$search}%")
                    ->orWhere('titular_profesional', 'ilike', "%{$search}%")
                    ->orWhere('biografia', 'ilike', "%{$search}%")
                    ->orWhereHas('habilidades', function ($skillQuery) use ($search) {
                        $skillQuery->where('visible_publico', true)
                            ->where('tipo', 'tecnica')
                            ->where(function ($matchQuery) use ($search) {
                                $matchQuery->where('nombre', 'ilike', "%{$search}%")
                                    ->orWhere('categoria', 'ilike', "%{$search}%");
                            });
                    });
            });
        }

        if ($category !== '' || $level) {
            $perfilesQuery->whereHas('habilidades', $applySkillFilters);
        }

        if ($role !== '') {
            $perfilesQuery->where(function ($query) use ($role) {
                $query->where('profesion', 'ilike', "%{$role}%")
                    ->orWhere('titular_profesional', 'ilike', "%{$role}%")
                    ->orWhereHas('proyectos', function ($projectQuery) use ($role) {
                        $projectQuery->where('visible_publico', true)
                            ->where('rol', 'ilike', "%{$role}%");
                    });
            });
        }

        $technologies->each(function ($technology) use ($perfilesQuery, $technologyLevel) {
            $perfilesQuery->where(function ($query) use ($technology, $technologyLevel) {
                $query->whereHas('habilidades', function ($skillQuery) use ($technology, $technologyLevel) {
                    $skillQuery->where('visible_publico', true)
                        ->where('tipo', 'tecnica')
                        ->where('nombre', 'ilike', $technology);

                    if ($technologyLevel) {
                        $skillQuery->where('nivel_dominio', $technologyLevel);
                    }
                });

                if (!$technologyLevel) {
                    $query->orWhereHas('proyectos', function ($projectQuery) use ($technology) {
                        $projectQuery->where('visible_publico', true)
                            ->whereRaw('tecnologias::text ILIKE ?', ['%"' . $technology . '"%']);
                    });
                }
            });
        });

        if ($experienceMin !== null || $experienceMax !== null) {
            $experienceSubquery = "
                SELECT COALESCE(SUM(
                    GREATEST(
                        EXTRACT(EPOCH FROM ((COALESCE(fecha_fin, CURRENT_DATE)::timestamp) - fecha_inicio::timestamp)) / 31557600,
                        0
                    )
                ), 0)
                FROM proyectos
                WHERE proyectos.perfil_id = perfiles.id
                    AND proyectos.visible_publico = true
                    AND proyectos.fecha_inicio IS NOT NULL
            ";

            if ($experienceMin !== null) {
                $perfilesQuery->whereRaw("({$experienceSubquery}) >= ?", [$experienceMin]);
            }

            if ($experienceMax !== null) {
                $perfilesQuery->whereRaw("({$experienceSubquery}) <= ?", [$experienceMax]);
            }
        }

        $perfilesQuery->latest('creado_en');

        $perfiles = $perfilesQuery
            ->limit(20)
            ->get([
                'id',
                'usuario_id',
                'nombre_completo',
                'profesion',
                'titular_profesional',
                'telefono',
                'ubicacion',
                'linkedin_url',
                'github_url',
                'sitio_web_url',
                'visibilidad',
                'biografia',
                'foto_perfil',
                'slug',
                'creado_en',
            ]);

        return response()->json([
            'perfiles' => $perfiles,
            'categorias' => Habilidad::where('visible_publico', true)
                ->where('tipo', 'tecnica')
                ->whereNotNull('categoria')
                ->distinct()
                ->orderBy('categoria')
                ->pluck('categoria')
                ->values(),
            'roles' => $this->getPublicRoleOptions(),
            'tecnologias' => $this->getPublicTechnologyOptions(),
            'niveles' => ['Avanzado', 'Intermedio', 'Basico'],
            'filtros' => [
                'buscar' => $search,
                'categoria' => $category,
                'nivel' => $level,
                'rol' => $role,
                'experiencia_min' => $experienceMin,
                'experiencia_max' => $experienceMax,
                'tecnologias' => $technologies,
                'nivel_tecnologia' => $technologyLevel,
            ],
        ]);
    }

    private function getPublicRoleOptions()
    {
        $profileRoles = Perfil::where('es_publico', true)
            ->get(['profesion', 'titular_profesional'])
            ->flatMap(fn ($perfil) => [$perfil->profesion, $perfil->titular_profesional]);

        $projectRoles = \App\Models\Proyecto::where('visible_publico', true)
            ->distinct()
            ->pluck('rol');

        return $profileRoles
            ->merge($projectRoles)
            ->map(fn ($role) => trim((string) $role))
            ->filter()
            ->unique()
            ->sort()
            ->values();
    }

    private function getPublicTechnologyOptions()
    {
        $skillTechnologies = Habilidad::where('visible_publico', true)
            ->where('tipo', 'tecnica')
            ->distinct()
            ->pluck('nombre');

        $projectTechnologies = \App\Models\Proyecto::where('visible_publico', true)
            ->pluck('tecnologias')
            ->flatMap(fn ($technologies) => is_array($technologies) ? $technologies : []);

        return $skillTechnologies
            ->merge($projectTechnologies)
            ->map(fn ($technology) => trim((string) $technology))
            ->filter()
            ->unique()
            ->sort()
            ->values();
    }

    public function showPublicBySlug(string $slug)
    {
        $perfil = Perfil::with([
            'usuario:id,correo',
            'habilidades' => function ($query) {
                $query->where('visible_publico', true)
                    ->orderBy('tipo')
                    ->orderByDesc('creado_en');
            },
            'habilidades.evidencias',
            'proyectos' => function ($query) {
                $query->where('visible_publico', true)
                    ->orderByDesc('fecha_inicio')
                    ->orderByDesc('creado_en');
            },
            'experiencias' => function ($query) {
                $query->where('visible_publico', true)
                    ->orderByDesc('fecha_inicio')
                    ->orderByDesc('creado_en');
            },
        ])->where('es_publico', true)
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

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habilidad;
use App\Models\Proyecto;
use App\Models\RegistroActividad;
use App\Models\Sesion;
use App\Models\Usuario;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $totalUsuarios = Usuario::where('rol', 'usuario')->count();
        $totalProyectos = Proyecto::count();
        $totalHabilidades = Habilidad::count();
        $proyectosVisibles = Proyecto::where('visible_publico', true)->count();
        $habilidadesTecnicas = Habilidad::where('tipo', 'tecnica')->count();
        $habilidadesBlandas = Habilidad::where('tipo', 'blanda')->count();
        $promedioProyectos = $totalUsuarios > 0 ? round($totalProyectos / $totalUsuarios, 1) : 0;
        $perfilesConBaseCompleta = Usuario::query()
            ->where('rol', 'usuario')
            ->whereHas('perfil', function ($query) {
                $query->whereNotNull('nombre_completo')
                    ->whereNotNull('profesion')
                    ->whereNotNull('titular_profesional')
                    ->whereNotNull('biografia')
                    ->where('biografia', '!=', '');
            })
            ->whereHas('perfil.habilidades')
            ->whereHas('perfil.proyectos')
            ->count();
        $tasaCompletitud = $totalUsuarios > 0 ? round(($perfilesConBaseCompleta / $totalUsuarios) * 100) : 0;

        return response()->json([
            'resumen' => [
                'usuarios_totales' => $totalUsuarios,
                'proyectos_totales' => $totalProyectos,
                'habilidades_totales' => $totalHabilidades,
                'promedio_proyectos' => $promedioProyectos,
            ],
            'estadisticas' => [
                'proyectos_visibles' => $proyectosVisibles,
                'habilidades_tecnicas' => $habilidadesTecnicas,
                'habilidades_blandas' => $habilidadesBlandas,
                'tasa_completitud' => $tasaCompletitud,
            ],
            'usuarios_recientes' => $this->buildUserSummaries(5)->values(),
            'reportes_recientes' => $this->buildActivityQuery($request)
                ->limit(8)
                ->get()
                ->map(fn (RegistroActividad $activity) => $this->transformActivity($activity))
                ->values(),
        ]);
    }

    public function users(Request $request)
    {
        $selectedUserId = (int) $request->query('usuario_id', 0);
        $users = $this->buildUserSummaries()->values();
        $selectedUser = $users->firstWhere('id', $selectedUserId) ?: $users->first();

        return response()->json([
            'usuario_destacado' => $selectedUser,
            'usuarios' => $users,
            'actividad_reciente' => $selectedUser
                ? $this->buildUserActivity((int) $selectedUser['id'])
                : [],
        ]);
    }

    public function updateUserStatus(Request $request, int $usuarioId)
    {
        /** @var Usuario $admin */
        $admin = $request->attributes->get('auth_usuario');
        $payload = $request->validate([
            'estado' => ['required', 'in:activo,bloqueado'],
        ]);

        $usuario = Usuario::with('perfil')->where('rol', 'usuario')->findOrFail($usuarioId);
        $usuario->estado = $payload['estado'];
        $usuario->actualizado_en = now();
        $usuario->save();

        if ($payload['estado'] !== 'activo') {
            Sesion::where('usuario_id', $usuario->id)->delete();
        }

        ActivityLogger::log(
            $request,
            $admin,
            'administracion',
            $payload['estado'] === 'activo' ? 'usuario_reactivado' : 'usuario_bloqueado',
            ($payload['estado'] === 'activo' ? 'Reactivacion' : 'Bloqueo') . ' de usuario: ' . ($usuario->perfil?->nombre_completo ?: $usuario->correo),
            [
                'entidad_tipo' => 'usuario',
                'entidad_id' => $usuario->id,
                'meta' => ['estado' => $payload['estado']],
            ]
        );

        return response()->json([
            'message' => $payload['estado'] === 'activo'
                ? 'Usuario reactivado correctamente.'
                : 'Usuario bloqueado correctamente.',
            'usuario' => $this->buildSingleUserSummary($usuario),
            'actividad_reciente' => $this->buildUserActivity($usuario->id),
        ]);
    }

    public function reports(Request $request)
    {
        $baseQuery = $this->buildActivityQuery($request);
        $reports = (clone $baseQuery)
            ->paginate(20)
            ->through(fn (RegistroActividad $activity) => $this->transformActivity($activity));

        return response()->json([
            'resumen' => [
                'total_actividades' => (clone $baseQuery)->count(),
                'inicios_sesion' => (clone $baseQuery)->where('tipo', 'inicio_sesion')->count(),
                'ediciones' => (clone $baseQuery)->whereIn('tipo', [
                    'perfil_creado',
                    'perfil_actualizado',
                    'proyecto_creado',
                    'proyecto_actualizado',
                    'proyecto_eliminado',
                    'proyecto_visibilidad',
                    'habilidad_creada',
                    'habilidad_actualizada',
                    'habilidad_eliminada',
                    'habilidad_visibilidad',
                    'experiencia_creada',
                    'experiencia_actualizada',
                    'experiencia_eliminada',
                    'experiencia_visibilidad',
                    'cambio_contraseña',
                ])->count(),
                'busquedas' => (clone $baseQuery)->where('tipo', 'ilike', '%busqueda%')->count(),
            ],
            'reportes' => $reports,
            'filtros' => [
                'buscar' => trim((string) $request->query('buscar', '')),
                'tipo' => trim((string) $request->query('tipo', '')),
            ],
            'tipos' => RegistroActividad::query()
                ->distinct()
                ->orderBy('tipo')
                ->pluck('tipo')
                ->values(),
        ]);
    }

    public function exportReports(Request $request): StreamedResponse
    {
        $reports = $this->buildActivityQuery($request)->get();

        return response()->streamDownload(function () use ($reports) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Fecha', 'Categoria', 'Tipo', 'Actor', 'Correo', 'Descripcion', 'IP']);

            foreach ($reports as $report) {
                fputcsv($handle, [
                    optional($report->creado_en)->format('Y-m-d H:i:s'),
                    $report->categoria,
                    $report->tipo,
                    $report->actor_nombre,
                    $report->actor_correo,
                    $report->descripcion,
                    $report->ip_usuario,
                ]);
            }

            fclose($handle);
        }, 'logs-actividad.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function buildUserSummaries(int $limit = 0)
    {
        $query = Usuario::query()
            ->where('rol', 'usuario')
            ->with([
                'perfil' => function ($query) {
                    $query->select([
                        'id',
                        'usuario_id',
                        'nombre_completo',
                        'profesion',
                        'titular_profesional',
                        'biografia',
                        'telefono',
                        'ubicacion',
                        'foto_perfil',
                        'slug',
                    ])->withCount([
                        'proyectos',
                        'habilidades',
                        'proyectos as proyectos_visibles_count' => function ($projectQuery) {
                            $projectQuery->where('visible_publico', true);
                        },
                    ]);
                },
            ])
            ->orderByDesc('creado_en');

        if ($limit > 0) {
            $query->limit($limit);
        }

        return $query->get()->map(fn (Usuario $usuario) => $this->buildSingleUserSummary($usuario));
    }

    private function buildSingleUserSummary(Usuario $usuario): array
    {
        $perfil = $usuario->perfil;

        return [
            'id' => $usuario->id,
            'correo' => $usuario->correo,
            'estado' => $usuario->estado,
            'rol' => $usuario->rol,
            'creado_en' => $usuario->creado_en,
            'perfil' => $perfil ? [
                'id' => $perfil->id,
                'nombre_completo' => $perfil->nombre_completo,
                'profesion' => $perfil->profesion,
                'titular_profesional' => $perfil->titular_profesional,
                'biografia' => $perfil->biografia,
                'telefono' => $perfil->telefono,
                'ubicacion' => $perfil->ubicacion,
                'foto_perfil' => $perfil->foto_perfil,
                'slug' => $perfil->slug,
                'proyectos_count' => $perfil->proyectos_count,
                'habilidades_count' => $perfil->habilidades_count,
                'proyectos_visibles_count' => $perfil->proyectos_visibles_count,
            ] : null,
        ];
    }

    private function buildActivityQuery(Request $request)
    {
        $search = trim((string) $request->query('buscar', ''));
        $type = trim((string) $request->query('tipo', ''));

        return RegistroActividad::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->where('actor_nombre', 'ilike', "%{$search}%")
                        ->orWhere('actor_correo', 'ilike', "%{$search}%")
                        ->orWhere('descripcion', 'ilike', "%{$search}%")
                        ->orWhere('tipo', 'ilike', "%{$search}%");
                });
            })
            ->when($type !== '', fn ($query) => $query->where('tipo', $type))
            ->orderByDesc('creado_en');
    }

    private function transformActivity(RegistroActividad $activity): array
    {
        return [
            'id' => $activity->id,
            'categoria' => $activity->categoria,
            'tipo' => $activity->tipo,
            'descripcion' => $activity->descripcion,
            'actor_nombre' => $activity->actor_nombre,
            'actor_correo' => $activity->actor_correo,
            'actor_rol' => $activity->actor_rol,
            'ip_usuario' => $activity->ip_usuario,
            'creado_en' => optional($activity->creado_en)->toIso8601String(),
        ];
    }

    private function buildUserActivity(int $usuarioId): array
    {
        return RegistroActividad::query()
            ->where('usuario_id', $usuarioId)
            ->orderByDesc('creado_en')
            ->limit(8)
            ->get()
            ->map(fn (RegistroActividad $activity) => $this->transformActivity($activity))
            ->values()
            ->all();
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Skill\StoreSkillRequest;
use App\Http\Requests\Skill\UpdateSkillRequest;
use App\Http\Requests\Skill\UpdateSkillVisibilityRequest;
use App\Models\EvidenciaHabilidad;
use App\Models\Habilidad;
use App\Models\Perfil;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SkillController extends Controller
{
    public function index(Request $request)
    {
        $perfil = $this->resolveProfile($request);

        $habilidades = Habilidad::with('evidencias')
            ->where('perfil_id', $perfil->id)
            ->orderBy('tipo')
            ->orderByDesc('creado_en')
            ->get();

        return response()->json([
            'habilidades' => $habilidades,
            'categorias_tecnicas' => StoreSkillRequest::TECHNICAL_CATEGORIES,
            'categorias_blandas' => StoreSkillRequest::SOFT_CATEGORIES,
            'niveles_dominio' => StoreSkillRequest::LEVELS,
        ]);
    }

    public function store(StoreSkillRequest $request)
    {
        $perfil = $this->resolveProfile($request);
        $rutaCertificado = null;

        if ($request->hasFile('certificado_pdf')) {
            $rutaCertificado = $request->file('certificado_pdf')->store('certificados', 'public');
        }

        $habilidad = Habilidad::create([
            'perfil_id' => $perfil->id,
            'tipo' => $request->tipo,
            'nombre' => $request->tipo === 'blanda' ? $request->categoria : trim($request->nombre),
            'categoria' => $request->categoria,
            'nivel_dominio' => $request->nivel_dominio,
            'visible_publico' => (bool) $request->boolean('visible_publico', false),
            'certificado_pdf' => $rutaCertificado,
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        if ($rutaCertificado) {
            $this->createEvidence($habilidad, [
                'tipo' => 'certificado',
                'titulo' => 'Certificado de habilidad',
                'descripcion' => 'Certificado PDF adjunto al registrar la habilidad.',
            ], $rutaCertificado);
        }

        $this->storeEvidenceList($request, $habilidad);
        $habilidad->load('evidencias');

        return response()->json([
            'message' => 'Habilidad creada correctamente.',
            'habilidad' => $habilidad,
        ], 201);
    }

    public function update(UpdateSkillRequest $request, int $habilidadId)
    {
        $habilidad = $this->resolveOwnedSkill($request, $habilidadId);

        $habilidad->tipo = $request->tipo;
        $habilidad->nombre = $request->tipo === 'blanda' ? $request->categoria : trim($request->nombre);
        $habilidad->categoria = $request->categoria;
        $habilidad->nivel_dominio = $request->nivel_dominio;
        $habilidad->visible_publico = (bool) $request->boolean('visible_publico', false);

        if ($request->hasFile('certificado_pdf')) {
            if ($habilidad->certificado_pdf) {
                Storage::disk('public')->delete($habilidad->certificado_pdf);
            }

            $habilidad->certificado_pdf = $request->file('certificado_pdf')->store('certificados', 'public');
            $this->createEvidence($habilidad, [
                'tipo' => 'certificado',
                'titulo' => 'Certificado de habilidad',
                'descripcion' => 'Certificado PDF adjunto a la habilidad.',
            ], $habilidad->certificado_pdf);
        }

        $this->storeEvidenceList($request, $habilidad);
        $habilidad->actualizado_en = now();
        $habilidad->save();
        $habilidad->load('evidencias');

        return response()->json([
            'message' => 'Habilidad actualizada correctamente.',
            'habilidad' => $habilidad,
        ]);
    }

    public function updateVisibility(UpdateSkillVisibilityRequest $request, int $habilidadId)
    {
        $habilidad = $this->resolveOwnedSkill($request, $habilidadId);

        $habilidad->visible_publico = $request->boolean('visible_publico');
        $habilidad->actualizado_en = now();
        $habilidad->save();
        $habilidad->load('evidencias');

        return response()->json([
            'message' => 'Visibilidad actualizada correctamente.',
            'habilidad' => $habilidad,
        ]);
    }

    public function destroy(Request $request, int $habilidadId)
    {
        $habilidad = $this->resolveOwnedSkill($request, $habilidadId);

        if ($habilidad->certificado_pdf) {
            Storage::disk('public')->delete($habilidad->certificado_pdf);
        }

        $habilidad->evidencias()->whereNotNull('archivo')->get()->each(function (EvidenciaHabilidad $evidencia) {
            Storage::disk('public')->delete($evidencia->archivo);
        });

        $habilidad->delete();

        return response()->json([
            'message' => 'Habilidad eliminada correctamente.',
        ]);
    }

    private function resolveProfile(Request $request): Perfil
    {
        $usuario = $request->attributes->get('auth_usuario');

        return Perfil::where('usuario_id', $usuario->id)->firstOrFail();
    }

    private function resolveOwnedSkill(Request $request, int $habilidadId): Habilidad
    {
        $perfil = $this->resolveProfile($request);

        return Habilidad::with('evidencias')->where('perfil_id', $perfil->id)->findOrFail($habilidadId);
    }

    private function storeEvidenceList(Request $request, Habilidad $habilidad): void
    {
        foreach ($request->input('evidencias', []) as $index => $evidenciaData) {
            $archivo = null;

            if ($request->hasFile("evidencia_archivos.{$index}")) {
                $archivo = $request->file("evidencia_archivos.{$index}")->store('evidencias-habilidades', 'public');
            }

            $this->createEvidence($habilidad, $evidenciaData, $archivo);
        }
    }

    private function createEvidence(Habilidad $habilidad, array $data, ?string $archivo = null): void
    {
        $url = filled($data['url'] ?? null) ? trim((string) $data['url']) : null;

        $exists = EvidenciaHabilidad::where('habilidad_id', $habilidad->id)
            ->when($archivo, fn ($query) => $query->where('archivo', $archivo))
            ->when(!$archivo && $url, fn ($query) => $query->where('url', $url))
            ->exists();

        if ($exists) {
            return;
        }

        EvidenciaHabilidad::create([
            'habilidad_id' => $habilidad->id,
            'tipo' => $data['tipo'] ?? 'documento',
            'titulo' => trim((string) ($data['titulo'] ?? 'Evidencia de habilidad')),
            'descripcion' => filled($data['descripcion'] ?? null) ? trim((string) $data['descripcion']) : null,
            'archivo' => $archivo,
            'url' => $url,
            'emisor' => filled($data['emisor'] ?? null) ? trim((string) $data['emisor']) : null,
            'fecha' => $data['fecha'] ?? null,
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);
    }
}

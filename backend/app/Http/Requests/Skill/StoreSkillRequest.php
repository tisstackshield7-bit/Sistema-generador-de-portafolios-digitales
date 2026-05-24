<?php

namespace App\Http\Requests\Skill;

use App\Models\Habilidad;
use App\Models\Perfil;
use App\Support\RichTextSanitizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreSkillRequest extends FormRequest
{
    public const TECHNICAL_CATEGORIES = [
        'Frontend',
        'Backend',
        'Mobile',
        'Bases de datos',
        'DevOps / Cloud',
        'Lenguajes de programacion',
        'Herramientas',
        'Diseno y UX',
    ];

    public const SOFT_CATEGORIES = [
        'Comunicacion',
        'Liderazgo',
        'Colaboracion',
        'Pensamiento critico',
        'Organizacion',
        'Flexibilidad',
        'Innovacion',
        'Relaciones interpersonales',
    ];

    public const LEVELS = ['Basico', 'Intermedio', 'Avanzado'];

    public const EVIDENCE_TYPES = ['certificado', 'proyecto', 'curso', 'video', 'documento', 'experiencia'];

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $evidencias = $this->input('evidencias', []);

        if ($this->filled('evidencias_json')) {
            $decoded = json_decode((string) $this->input('evidencias_json'), true);
            $evidencias = is_array($decoded) ? $decoded : [];
        }

        $evidencias = collect($evidencias)
            ->map(function ($evidencia) {
                if (is_array($evidencia) && array_key_exists('descripcion', $evidencia)) {
                    $evidencia['descripcion'] = RichTextSanitizer::clean($evidencia['descripcion']);
                }

                return $evidencia;
            })
            ->values()
            ->all();

        $category = $this->filled('categoria') ? $this->input('categoria') : null;
        $customCategory = $this->filled('categoria_personalizada')
            ? trim((string) $this->input('categoria_personalizada'))
            : null;

        if ($this->input('tipo') === 'blanda' && $category === '__custom__') {
            $category = $customCategory;
        }

        $this->merge([
            'categoria' => $category,
            'categoria_personalizada' => $customCategory,
            'visible_publico' => $this->boolean('visible_publico'),
            'evidencias' => $evidencias,
        ]);
    }

    public function rules(): array
    {
        $skillType = $this->input('tipo');
        $categoryRules = $skillType === 'tecnica'
            ? ['required', 'string', 'max:100', Rule::in(self::TECHNICAL_CATEGORIES)]
            : ['required', 'string', 'max:100'];
        $nameRules = $skillType === 'blanda'
            ? ['nullable', 'string', 'max:150']
            : ['required', 'string', 'max:150'];

        return [
            'tipo' => ['required', Rule::in(['tecnica', 'blanda'])],
            'nombre' => $nameRules,
            'categoria' => $categoryRules,
            'categoria_personalizada' => ['nullable', 'string', 'max:100'],
            'nivel_dominio' => ['required', Rule::in(self::LEVELS)],
            'visible_publico' => ['nullable', 'boolean'],
            'certificado_pdf' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
            'evidencias' => ['nullable', 'array'],
            'evidencias.*.tipo' => ['required_with:evidencias', Rule::in(self::EVIDENCE_TYPES)],
            'evidencias.*.titulo' => ['required_with:evidencias', 'string', 'max:180'],
            'evidencias.*.descripcion' => ['nullable', 'string', 'max:3000'],
            'evidencias.*.url' => ['nullable', 'url', 'max:255'],
            'evidencias.*.emisor' => ['nullable', 'string', 'max:180'],
            'evidencias.*.fecha' => ['nullable', 'date'],
            'evidencias.*.id' => ['nullable', 'integer'],
            'evidencias.*.archivo_actual' => ['nullable', 'string', 'max:255'],
            'evidencia_archivos' => ['nullable', 'array'],
            'evidencia_archivos.*' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp,mp4,mov', 'max:10240'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $usuario = $this->attributes->get('auth_usuario');
            $perfil = $usuario ? Perfil::where('usuario_id', $usuario->id)->first() : null;
            $skillName = $this->input('tipo') === 'blanda'
                ? trim((string) $this->input('categoria', ''))
                : trim((string) $this->input('nombre', ''));
            $category = trim((string) $this->input('categoria', ''));
            $currentSkillId = $this->route('habilidad') ? (int) $this->route('habilidad') : null;

            if ($perfil && $skillName !== '' && $category !== '') {
                $exists = Habilidad::where('perfil_id', $perfil->id)
                    ->where('nombre', $skillName)
                    ->where('tipo', $this->input('tipo'))
                    ->where('categoria', $category)
                    ->when($currentSkillId, fn ($query) => $query->where('id', '!=', $currentSkillId))
                    ->exists();

                if ($exists) {
                    $validator->errors()->add(
                        'nombre',
                        'Este perfil ya tiene registrada una habilidad con el mismo nombre, tipo y categoria.'
                    );
                }
            }

            foreach ($this->input('evidencias', []) as $index => $evidencia) {
                $hasUrl = filled($evidencia['url'] ?? null);
                $hasFile = $this->hasFile("evidencia_archivos.{$index}");
                $hasCurrentFile = filled($evidencia['archivo_actual'] ?? null);

                if (!$hasUrl && !$hasFile && !$hasCurrentFile) {
                    $validator->errors()->add(
                        "evidencias.{$index}.url",
                        'Agrega un enlace o archivo para respaldar esta evidencia.'
                    );
                }
            }

            if (
                $this->boolean('visible_publico')
                && $this->input('tipo') === 'tecnica'
                && !$this->hasTechnicalEvidence()
            ) {
                $validator->errors()->add(
                    'visible_publico',
                    'Agrega al menos una evidencia para publicar esta habilidad tecnica.'
                );
            }
        });
    }

    protected function hasTechnicalEvidence(): bool
    {
        foreach ($this->input('evidencias', []) as $index => $evidencia) {
            if (
                filled($evidencia['url'] ?? null)
                || filled($evidencia['archivo_actual'] ?? null)
                || $this->hasFile("evidencia_archivos.{$index}")
            ) {
                return true;
            }
        }

        return $this->hasFile('certificado_pdf');
    }

    public function messages(): array
    {
        return [
            'tipo.required' => 'El tipo de habilidad es obligatorio.',
            'tipo.in' => 'El tipo de habilidad no es valido.',
            'nombre.required' => 'El nombre de la habilidad es obligatorio.',
            'categoria.required' => 'La categoria es obligatoria.',
            'categoria.in' => 'La categoria seleccionada no es valida.',
            'nivel_dominio.required' => 'El nivel de dominio es obligatorio.',
            'nivel_dominio.in' => 'El nivel de dominio seleccionado no es valido.',
            'certificado_pdf.required_if' => 'Debes subir un certificado PDF para publicar esta habilidad.',
            'certificado_pdf.file' => 'El certificado debe ser un archivo PDF valido.',
            'certificado_pdf.mimes' => 'El certificado debe estar en formato PDF.',
            'certificado_pdf.max' => 'El certificado no puede superar los 5 MB.',
            'evidencias.*.tipo.required_with' => 'El tipo de evidencia es obligatorio.',
            'evidencias.*.tipo.in' => 'El tipo de evidencia no es valido.',
            'evidencias.*.titulo.required_with' => 'El titulo de la evidencia es obligatorio.',
            'evidencias.*.url.url' => 'Ingresa un enlace valido para la evidencia.',
            'evidencia_archivos.*.mimes' => 'La evidencia debe ser PDF, imagen o video.',
            'evidencia_archivos.*.max' => 'La evidencia no puede superar los 10 MB.',
        ];
    }
}

<?php

namespace App\Http\Requests\Experience;

use App\Support\RichTextSanitizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreExperienceRequest extends FormRequest
{
    private const ACADEMIC_SUBTYPES = [
        'Carrera universitaria',
        'Tecnico superior',
        'Diplomado',
        'Curso',
        'Bootcamp',
        'Certificacion',
        'Taller',
        'Seminario',
        'Posgrado / Maestria',
        'Investigacion',
        'Ponencia / Publicacion',
        'Otro',
    ];

    private const ACADEMIC_STATUSES = ['En curso', 'Finalizado', 'Vigente', 'Vencido'];
    private const ACCREDITATION_TYPES = ['Horas', 'Modulos', 'Creditos', 'Sin acreditacion'];

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $achievements = $this->input('logros', []);

        if (is_string($achievements)) {
            $achievements = collect(preg_split('/\r\n|\r|\n/', $achievements) ?: [])
                ->map(fn ($achievement) => trim($achievement))
                ->filter()
                ->unique()
                ->values()
                ->all();
        }

        $isCurrent = $this->boolean('actualidad');
        $experienceType = $this->input('tipo');
        $academicSubtype = $this->filled('subtipo_academico') ? trim((string) $this->input('subtipo_academico')) : null;
        $academicStatus = $this->filled('estado_academico')
            ? trim((string) $this->input('estado_academico'))
            : ($isCurrent ? 'En curso' : 'Finalizado');

        if ($experienceType === 'academica' && !$academicSubtype) {
            $academicSubtype = 'Curso';
        }

        $this->merge([
            'titulo' => trim((string) $this->input('titulo')),
            'institucion' => trim((string) $this->input('institucion')),
            'ubicacion' => $this->filled('ubicacion') ? trim((string) $this->input('ubicacion')) : null,
            'descripcion' => RichTextSanitizer::clean($this->input('descripcion')),
            'logros' => $achievements,
            'fecha_fin' => $isCurrent ? null : $this->input('fecha_fin'),
            'actualidad' => $isCurrent,
            'subtipo_academico' => $experienceType === 'academica' ? $academicSubtype : null,
            'estado_academico' => $experienceType === 'academica' ? $academicStatus : null,
            'area_especializacion' => $this->filled('area_especializacion') ? trim((string) $this->input('area_especializacion')) : null,
            'tipo_acreditacion' => $this->filled('tipo_acreditacion') ? trim((string) $this->input('tipo_acreditacion')) : null,
            'cantidad_acreditacion' => $this->filled('cantidad_acreditacion') ? (int) $this->input('cantidad_acreditacion') : null,
            'url_credencial' => $this->filled('url_credencial') ? trim((string) $this->input('url_credencial')) : null,
            'visible_publico' => $this->boolean('visible_publico'),
        ]);
    }

    public function rules(): array
    {
        return [
            'tipo' => ['required', Rule::in(['laboral', 'academica'])],
            'titulo' => ['required', 'string', 'max:180'],
            'institucion' => ['required', 'string', 'max:180'],
            'ubicacion' => ['nullable', 'string', 'max:180'],
            'descripcion' => ['required', 'string', 'max:5000'],
            'fecha_inicio' => ['required', 'date', 'before_or_equal:today'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio', 'before_or_equal:today'],
            'actualidad' => ['nullable', 'boolean'],
            'subtipo_academico' => ['nullable', 'string', Rule::in(self::ACADEMIC_SUBTYPES)],
            'estado_academico' => ['nullable', 'string', Rule::in(self::ACADEMIC_STATUSES)],
            'area_especializacion' => ['nullable', 'string', 'max:180'],
            'tipo_acreditacion' => ['nullable', 'string', Rule::in(self::ACCREDITATION_TYPES)],
            'cantidad_acreditacion' => ['nullable', 'integer', 'min:0'],
            'url_credencial' => ['nullable', 'url', 'max:255'],
            'logros' => ['nullable', 'array'],
            'logros.*' => ['required', 'string', 'max:180'],
            'visible_publico' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('tipo') !== 'academica') {
                return;
            }

            if (
                $this->filled('tipo_acreditacion')
                && $this->input('tipo_acreditacion') !== 'Sin acreditacion'
                && !$this->filled('cantidad_acreditacion')
            ) {
                $validator->errors()->add('cantidad_acreditacion', 'La cantidad de acreditacion es obligatoria.');
            }

            if ($this->input('estado_academico') === 'En curso' && !$this->boolean('actualidad')) {
                $validator->errors()->add('actualidad', 'El estado En curso requiere marcar actualidad.');
            }

            if (in_array($this->input('estado_academico'), ['Finalizado', 'Vencido'], true) && !$this->filled('fecha_fin')) {
                $validator->errors()->add('fecha_fin', 'La fecha de fin es obligatoria para este estado academico.');
            }

        });
    }

    public function messages(): array
    {
        return [
            'tipo.required' => 'El tipo de experiencia es obligatorio.*',
            'tipo.in' => 'El tipo de experiencia no es valido.*',
            'titulo.required' => 'El titulo es obligatorio.*',
            'institucion.required' => 'La institucion es obligatoria.*',
            'descripcion.required' => 'La descripcion es obligatoria.*',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.*',
            'fecha_inicio.before_or_equal' => 'La fecha de inicio no puede ser futura.*',
            'fecha_fin.after_or_equal' => 'La fecha de fin no puede ser anterior a la fecha de inicio.*',
            'fecha_fin.before_or_equal' => 'La fecha de fin no puede ser futura.*',
            'url_credencial.url' => 'Ingresa una URL valida para la credencial.*',
        ];
    }
}

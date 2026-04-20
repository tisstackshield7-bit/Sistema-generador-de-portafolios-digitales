<?php

namespace App\Http\Requests\Skill;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSkillRequest extends FormRequest
{
    public const TECHNICAL_CATEGORIES = [
        'Frontend',
        'Backend',
        'Bases de datos',
        'DevOps',
        'Cloud',
        'Mobile',
        'Lenguajes',
        'Herramientas',
        'Diseno',
        'UX research',
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

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'categoria' => $this->filled('categoria') ? $this->input('categoria') : null,
            'visible_publico' => $this->boolean('visible_publico'),
        ]);
    }

    public function rules(): array
    {
        $skillType = $this->input('tipo');
        $allowedCategories = match ($skillType) {
            'tecnica' => self::TECHNICAL_CATEGORIES,
            'blanda' => self::SOFT_CATEGORIES,
            default => [],
        };

        return [
            'tipo' => ['required', Rule::in(['tecnica', 'blanda'])],
            'nombre' => ['required', 'string', 'max:150'],
            'categoria' => [
                'required',
                'string',
                'max:100',
                Rule::in($allowedCategories),
            ],
            'nivel_dominio' => ['required', Rule::in(self::LEVELS)],
            'visible_publico' => ['nullable', 'boolean'],
        ];
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
        ];
    }
}

<?php

namespace App\Http\Requests\Experience;

use App\Support\RichTextSanitizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExperienceRequest extends FormRequest
{
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

        $this->merge([
            'titulo' => trim((string) $this->input('titulo')),
            'institucion' => trim((string) $this->input('institucion')),
            'ubicacion' => $this->filled('ubicacion') ? trim((string) $this->input('ubicacion')) : null,
            'descripcion' => RichTextSanitizer::clean($this->input('descripcion')),
            'logros' => $achievements,
            'fecha_fin' => $isCurrent ? null : $this->input('fecha_fin'),
            'actualidad' => $isCurrent,
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
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'actualidad' => ['nullable', 'boolean'],
            'logros' => ['nullable', 'array'],
            'logros.*' => ['required', 'string', 'max:180'],
            'visible_publico' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipo.required' => 'El tipo de experiencia es obligatorio.',
            'tipo.in' => 'El tipo de experiencia no es valido.',
            'titulo.required' => 'El titulo es obligatorio.',
            'institucion.required' => 'La institucion es obligatoria.',
            'descripcion.required' => 'La descripcion es obligatoria.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_fin.after_or_equal' => 'La fecha de fin no puede ser anterior a la fecha de inicio.',
        ];
    }
}

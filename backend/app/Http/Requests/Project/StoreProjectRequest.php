<?php

namespace App\Http\Requests\Project;

use App\Support\RichTextSanitizer;
use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $technologies = $this->input('tecnologias', []);

        if (is_string($technologies)) {
            $technologies = collect(explode(',', $technologies))
                ->map(fn ($technology) => trim($technology))
                ->filter()
                ->unique()
                ->values()
                ->all();
        }

        $achievements = $this->input('logros', []);

        if (is_string($achievements)) {
            $achievements = collect(preg_split('/\r\n|\r|\n/', $achievements) ?: [])
                ->map(fn ($achievement) => trim($achievement))
                ->filter()
                ->unique()
                ->values()
                ->all();
        }

        $payload = [
            'titulo' => trim((string) $this->input('titulo')),
            'rol' => trim((string) $this->input('rol')),
            'descripcion' => RichTextSanitizer::clean($this->input('descripcion')),
            'tecnologias' => $technologies,
            'logros' => $achievements,
            'enlace_proyecto' => $this->filled('enlace_proyecto') ? trim((string) $this->input('enlace_proyecto')) : null,
            'visible_publico' => $this->boolean('visible_publico'),
        ];

        if ($this->has('url_imagen')) {
            $payload['url_imagen'] = $this->filled('url_imagen') ? trim((string) $this->input('url_imagen')) : null;
        }

        $this->merge($payload);
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:180'],
            'rol' => ['required', 'string', 'max:150'],
            'descripcion' => ['required', 'string', 'max:5000'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'tecnologias' => ['required', 'array', 'min:1'],
            'tecnologias.*' => ['required', 'string', 'max:60'],
            'logros' => ['nullable', 'array'],
            'logros.*' => ['required', 'string', 'max:180'],
            'enlace_proyecto' => ['nullable', 'url', 'max:255'],
            'url_imagen' => ['nullable', 'url', 'max:255'],
            'imagen_archivo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'visible_publico' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'El titulo del proyecto es obligatorio.',
            'rol.required' => 'Tu rol en el proyecto es obligatorio.',
            'descripcion.required' => 'La descripcion del proyecto es obligatoria.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_fin.after_or_equal' => 'La fecha de fin no puede ser anterior a la fecha de inicio.',
            'tecnologias.required' => 'Debes agregar al menos una tecnologia.',
            'tecnologias.min' => 'Debes agregar al menos una tecnologia.',
            'enlace_proyecto.url' => 'Ingrese un enlace valido',
            'url_imagen.url' => 'Ingrese una URL de imagen valida.',
            'imagen_archivo.image' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
            'imagen_archivo.mimes' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
            'imagen_archivo.max' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
        ];
    }
}

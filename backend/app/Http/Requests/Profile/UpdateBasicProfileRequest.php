<?php

namespace App\Http\Requests\Profile;

use App\Support\RichTextSanitizer;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBasicProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $visibility = $this->input('visibilidad', []);

        if (is_string($visibility)) {
            $decoded = json_decode($visibility, true);
            $visibility = is_array($decoded) ? $decoded : [];
        }

        $this->merge([
            'biografia' => RichTextSanitizer::clean($this->input('biografia')),
            'ubicacion' => $this->filled('ubicacion') ? trim((string) $this->input('ubicacion')) : null,
            'linkedin_url' => $this->filled('linkedin_url') ? trim((string) $this->input('linkedin_url')) : null,
            'github_url' => $this->filled('github_url') ? trim((string) $this->input('github_url')) : null,
            'sitio_web_url' => $this->filled('sitio_web_url') ? trim((string) $this->input('sitio_web_url')) : null,
            'visibilidad' => $visibility,
        ]);
    }

    public function rules(): array
    {
        return [
            'nombres' => ['required', 'string', 'max:120'],
            'apellidos' => ['required', 'string', 'max:120'],
            'profesion' => ['required', 'string', 'max:150'],
            'titular_profesional' => ['required', 'string', 'max:150'],
            'telefono' => ['required', 'string', 'regex:/^(?:591)?[67]\d{7}$/'],
            'ubicacion' => ['nullable', 'string', 'max:180'],
            'biografia' => ['required', 'string', 'min:10', 'max:5000'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'sitio_web_url' => ['nullable', 'url', 'max:255'],
            'visibilidad' => ['nullable', 'array'],
            'visibilidad.mostrar_correo' => ['nullable', 'boolean'],
            'visibilidad.mostrar_telefono' => ['nullable', 'boolean'],
            'visibilidad.mostrar_redes' => ['nullable', 'boolean'],
            'visibilidad.mostrar_biografia' => ['nullable', 'boolean'],
            'visibilidad.mostrar_habilidades' => ['nullable', 'boolean'],
            'visibilidad.mostrar_proyectos' => ['nullable', 'boolean'],
            'visibilidad.mostrar_experiencia' => ['nullable', 'boolean'],
            'visibilidad.mostrar_evidencias' => ['nullable', 'boolean'],
            'foto_perfil' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombres.required' => 'El nombre es obligatorio.',
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'profesion.required' => 'La profesion es obligatoria.',
            'titular_profesional.required' => 'El rol o especialidad profesional es obligatorio.',
            'telefono.required' => 'El numero telefonico es obligatorio.',
            'telefono.regex' => 'Ingresa un numero de Bolivia valido. Ej: 71234567 o 59171234567.',
            'biografia.required' => 'La biografia es obligatoria.',
            'biografia.min' => 'La biografia debe tener al menos 10 caracteres.',
            'biografia.max' => 'La biografia no puede superar el limite permitido.',
            'linkedin_url.url' => 'Ingresa una URL valida de LinkedIn.',
            'github_url.url' => 'Ingresa una URL valida de GitHub.',
            'sitio_web_url.url' => 'Ingresa una URL valida para tu sitio web.',
            'foto_perfil.image' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
            'foto_perfil.mimes' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
            'foto_perfil.max' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
        ];
    }
}

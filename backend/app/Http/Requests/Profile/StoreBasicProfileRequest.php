<?php

namespace App\Http\Requests\Profile;

use App\Support\RichTextSanitizer;
use Illuminate\Foundation\Http\FormRequest;

class StoreBasicProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'biografia' => RichTextSanitizer::clean($this->input('biografia')),
            'titular_profesional' => $this->filled('titular_profesional')
                ? $this->input('titular_profesional')
                : $this->input('profesion'),
            'ubicacion' => $this->filled('ubicacion') ? trim((string) $this->input('ubicacion')) : null,
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
            'foto_perfil.image' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
            'foto_perfil.mimes' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
            'foto_perfil.max' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
        ];
    }
}

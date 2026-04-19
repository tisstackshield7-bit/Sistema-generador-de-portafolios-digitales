<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBasicProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombres' => ['required', 'string', 'max:120'],
            'apellidos' => ['required', 'string', 'max:120'],
            'profesion' => ['required', 'string', 'max:150'],
            'biografia' => ['required', 'string', 'min:10', 'max:500'],
            'foto_perfil' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombres.required' => 'El nombre es obligatorio.',
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'profesion.required' => 'La profesión es obligatoria.',
            'biografia.required' => 'La biografía es obligatoria.',
            'biografia.min' => 'La biografía debe tener al menos 10 caracteres.',
            'biografia.max' => 'La biografía no puede superar los 500 caracteres.',
            'foto_perfil.image' => 'Solo se permiten imágenes JPG, PNG o WEBP de hasta 5 MB.',
            'foto_perfil.mimes' => 'Solo se permiten imágenes JPG, PNG o WEBP de hasta 5 MB.',
            'foto_perfil.max' => 'Solo se permiten imágenes JPG, PNG o WEBP de hasta 5 MB.',
        ];
    }
}
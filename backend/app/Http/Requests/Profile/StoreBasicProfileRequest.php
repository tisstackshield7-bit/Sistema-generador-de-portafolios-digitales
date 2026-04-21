<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class StoreBasicProfileRequest extends FormRequest
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
            'telefono' => ['required', 'string', 'regex:/^(?:591)?[67]\d{7}$/'],
            'biografia' => ['required', 'string', 'min:10', 'max:500'],
            'foto_perfil' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombres.required' => 'El nombre es obligatorio.',
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'profesion.required' => 'La profesion es obligatoria.',
            'telefono.required' => 'El numero telefonico es obligatorio.',
            'telefono.regex' => 'Ingresa un numero de Bolivia valido. Ej: 71234567 o 59171234567.',
            'biografia.required' => 'La biografia es obligatoria.',
            'biografia.min' => 'La biografia debe tener al menos 10 caracteres.',
            'biografia.max' => 'La biografia no puede superar los 500 caracteres.',
            'foto_perfil.image' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
            'foto_perfil.mimes' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
            'foto_perfil.max' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
        ];
    }
}

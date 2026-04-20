<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBasicProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $usuario = $this->attributes->get('auth_usuario');

        return [
            'nombres' => ['required', 'string', 'max:120'],
            'apellidos' => ['required', 'string', 'max:120'],
            'profesion' => ['required', 'string', 'max:150'],
            'correo' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('usuarios', 'correo')->ignore($usuario?->id),
            ],
            'telefono' => ['nullable', 'string', 'max:50'],
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
            'correo.email' => 'El correo electronico no es valido.',
            'correo.unique' => 'Ese correo electronico ya esta en uso.',
            'telefono.max' => 'El numero de celular no puede superar los 50 caracteres.',
            'biografia.required' => 'La biografia es obligatoria.',
            'biografia.min' => 'La biografia debe tener al menos 10 caracteres.',
            'biografia.max' => 'La biografia no puede superar los 500 caracteres.',
            'foto_perfil.image' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
            'foto_perfil.mimes' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
            'foto_perfil.max' => 'Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.',
        ];
    }
}

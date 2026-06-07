<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contrasena_actual' => ['required', 'string'],
            'contrasena_nueva' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'different:contrasena_actual',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[\W_]/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'contrasena_actual.required' => 'La contrasena actual es obligatoria.',
            'contrasena_nueva.required' => 'La nueva contrasena es obligatoria.',
            'contrasena_nueva.confirmed' => 'La confirmacion de la nueva contrasena no coincide.',
            'contrasena_nueva.different' => 'La nueva contrasena debe ser diferente a la actual.',
        ];
    }
}

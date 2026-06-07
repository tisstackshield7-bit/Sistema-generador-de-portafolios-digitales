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
            'contraseña_actual' => ['required', 'string'],
            'contraseña_nueva' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'different:contraseña_actual',
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
            'contraseña_actual.required' => 'La contraseña actual es obligatoria.',
            'contraseña_nueva.required' => 'La nueva contraseña es obligatoria.',
            'contraseña_nueva.confirmed' => 'La confirmacion de la nueva contraseña no coincide.',
            'contraseña_nueva.different' => 'La nueva contraseña debe ser diferente a la actual.',
        ];
    }
}

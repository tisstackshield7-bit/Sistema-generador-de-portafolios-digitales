<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'correo' => ['required', 'email', 'max:255', 'unique:usuarios,correo'],
            'contrasena' => [
                'required',
                'string',
                'min:8',
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
            'correo.required' => 'El correo electrónico es obligatorio.',
            'correo.email' => 'El correo no es válido.',
            'correo.unique' => 'El usuario ya está registrado.',
            'contrasena.required' => 'La contraseña es obligatoria.',
            'contrasena.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'contrasena.regex' => 'La contraseña debe incluir mayúscula, minúscula, número y símbolo.',
        ];
    }
}

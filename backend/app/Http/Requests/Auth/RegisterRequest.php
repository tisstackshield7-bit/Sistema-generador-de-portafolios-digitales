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
            'correo.required' => 'El correo electronico es obligatorio.',
            'correo.email' => 'El correo no es valido.',
            'correo.unique' => 'El usuario ya esta registrado.',
            'contrasena.required' => 'La contrasena es obligatoria.',
            'contrasena.min' => 'La contrasena debe tener al menos 8 caracteres.',
            'contrasena.regex' => 'La contrasena debe incluir mayuscula, minuscula, numero y simbolo.',
        ];
    }
}

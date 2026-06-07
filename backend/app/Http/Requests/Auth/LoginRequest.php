<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'correo' => ['required', 'email'],
            'contraseña' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'correo.required' => 'El correo electronico es obligatorio.',
            'correo.email' => 'El correo no es valido.',
            'contraseña.required' => 'La contraseña es obligatoria.',
        ];
    }
}

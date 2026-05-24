<?php

namespace App\Http\Requests\Skill;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSkillVisibilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'visible_publico' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'visible_publico.required' => 'La visibilidad es obligatoria.',
            'visible_publico.boolean' => 'La visibilidad debe ser verdadera o falsa.',
        ];
    }
}

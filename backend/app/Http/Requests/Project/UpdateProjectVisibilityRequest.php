<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectVisibilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'visible_publico' => $this->boolean('visible_publico'),
        ]);
    }

    public function rules(): array
    {
        return [
            'visible_publico' => ['required', 'boolean'],
        ];
    }
}

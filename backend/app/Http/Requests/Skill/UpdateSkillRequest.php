<?php

namespace App\Http\Requests\Skill;

class UpdateSkillRequest extends StoreSkillRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['certificado_pdf'] = ['nullable', 'file', 'mimes:pdf', 'max:5120'];

        return $rules;
    }
}

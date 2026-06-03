<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experiencia extends Model
{
    protected $table = 'experiencias';

    public $timestamps = false;

    protected $fillable = [
        'perfil_id',
        'tipo',
        'titulo',
        'institucion',
        'ubicacion',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'actualidad',
        'subtipo_academico',
        'estado_academico',
        'area_especializacion',
        'tipo_acreditacion',
        'cantidad_acreditacion',
        'url_credencial',
        'logros',
        'visible_publico',
        'creado_en',
        'actualizado_en',
    ];

    protected $casts = [
        'logros' => 'array',
        'actualidad' => 'boolean',
        'visible_publico' => 'boolean',
        'cantidad_acreditacion' => 'integer',
        'fecha_inicio' => 'date:Y-m-d',
        'fecha_fin' => 'date:Y-m-d',
    ];

    public function perfil()
    {
        return $this->belongsTo(Perfil::class, 'perfil_id');
    }
}

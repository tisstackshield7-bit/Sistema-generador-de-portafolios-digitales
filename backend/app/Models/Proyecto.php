<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proyecto extends Model
{
    protected $table = 'proyectos';

    public $timestamps = false;

    protected $fillable = [
        'perfil_id',
        'titulo',
        'rol',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'tecnologias',
        'logros',
        'enlace_proyecto',
        'url_imagen',
        'visible_publico',
        'creado_en',
        'actualizado_en',
    ];

    protected $casts = [
        'tecnologias' => 'array',
        'logros' => 'array',
        'visible_publico' => 'boolean',
        'fecha_inicio' => 'date:Y-m-d',
        'fecha_fin' => 'date:Y-m-d',
    ];

    public function perfil()
    {
        return $this->belongsTo(Perfil::class, 'perfil_id');
    }
}

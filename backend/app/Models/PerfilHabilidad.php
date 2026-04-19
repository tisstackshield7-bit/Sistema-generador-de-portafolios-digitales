<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerfilHabilidad extends Model
{
    protected $table = 'perfil_habilidades';

    public $timestamps = false;

    protected $fillable = [
        'perfil_id',
        'habilidad_id',
        'nivel',
        'es_visible',
        'anios_experiencia',
        'creado_en',
        'actualizado_en',
    ];

    public function perfil()
    {
        return $this->belongsTo(Perfil::class, 'perfil_id');
    }

    public function habilidad()
    {
        return $this->belongsTo(Habilidad::class, 'habilidad_id');
    }
}
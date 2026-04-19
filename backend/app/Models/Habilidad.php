<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Habilidad extends Model
{
    protected $table = 'habilidades';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'tipo',
        'categoria',
        'creado_en',
        'actualizado_en',
    ];

    public function perfiles()
    {
        return $this->belongsToMany(
            Perfil::class,
            'perfil_habilidades',
            'habilidad_id',
            'perfil_id'
        )->withPivot([
            'nivel',
            'es_visible',
            'anios_experiencia',
            'creado_en',
            'actualizado_en',
        ]);
    }

    public function perfilHabilidades()
    {
        return $this->hasMany(PerfilHabilidad::class, 'habilidad_id');
    }
}
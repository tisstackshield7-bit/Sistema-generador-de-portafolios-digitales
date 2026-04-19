<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Perfil extends Model
{
    protected $table = 'perfiles';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'nombre_completo',
        'profesion',
        'titular_profesional',
        'biografia',
        'telefono',
        'pais',
        'ciudad',
        'foto_perfil',
        'archivo_cv',
        'es_publico',
        'slug',
        'creado_en',
        'actualizado_en',
        'eliminado_en',
    ];

    public function habilidades()
    {
        return $this->belongsToMany(
            Habilidad::class,
            'perfil_habilidades',
            'perfil_id',
            'habilidad_id'
        )->withPivot(['nivel', 'es_visible', 'anios_experiencia', 'creado_en', 'actualizado_en']);
    }

    public function perfilHabilidades()
    {
        return $this->hasMany(PerfilHabilidad::class, 'perfil_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
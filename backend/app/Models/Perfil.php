<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Perfil extends Model
{
    protected $table = 'perfiles';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'nombres',
        'apellidos',
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

    public function getFotoPerfilAttribute($value)
    {
        if (!$value || $value === '0') {
            return null;
        }

        return $value;
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function habilidades()
    {
        return $this->hasMany(Habilidad::class, 'perfil_id');
    }
}

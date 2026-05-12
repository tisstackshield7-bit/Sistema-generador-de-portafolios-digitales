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
        'ubicacion',
        'pais',
        'ciudad',
        'foto_perfil',
        'archivo_cv',
        'linkedin_url',
        'github_url',
        'sitio_web_url',
        'visibilidad',
        'es_publico',
        'slug',
        'creado_en',
        'actualizado_en',
        'eliminado_en',
    ];

    protected $hidden = [
        'usuario',
    ];

    protected $appends = [
        'correo',
    ];

    protected $casts = [
        'visibilidad' => 'array',
        'es_publico' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function getCorreoAttribute(): ?string
    {
        if ($this->relationLoaded('usuario')) {
            return $this->usuario?->correo;
        }

        return null;
    }

    public function habilidades()
    {
        return $this->hasMany(Habilidad::class, 'perfil_id');
    }

    public function proyectos()
    {
        return $this->hasMany(Proyecto::class, 'perfil_id');
    }

    public function experiencias()
    {
        return $this->hasMany(Experiencia::class, 'perfil_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistroActividad extends Model
{
    protected $table = 'registros_actividad';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'actor_nombre',
        'actor_correo',
        'actor_rol',
        'categoria',
        'tipo',
        'descripcion',
        'ip_usuario',
        'entidad_tipo',
        'entidad_id',
        'meta',
        'creado_en',
    ];

    protected $casts = [
        'meta' => 'array',
        'creado_en' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}

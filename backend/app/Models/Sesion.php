<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sesion extends Model
{
    protected $table = 'sesiones';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'token',
        'ip_usuario',
        'dispositivo',
        'fecha_inicio',
        'fecha_expiracion',
        'creado_en',
        'actualizado_en',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Usuario extends Model
{
    use SoftDeletes;

    protected $table = 'usuarios';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'correo',
        'contrasena',
        'correo_verificado_en',
        'estado',
        'token_recordar',
    ];

    protected $hidden = [
        'contrasena',
        'token_recordar',
    ];

    public function perfil()
    {
        return $this->hasOne(Perfil::class, 'usuario_id');
    }
}

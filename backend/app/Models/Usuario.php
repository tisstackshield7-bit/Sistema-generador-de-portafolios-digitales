<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuario extends Authenticatable
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

    public function getAuthPassword()
    {
        return $this->contrasena;
    }
}
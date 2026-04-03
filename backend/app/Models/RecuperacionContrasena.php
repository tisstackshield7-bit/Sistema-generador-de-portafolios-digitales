<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecuperacionContrasena extends Model
{
    protected $table = 'recuperaciones_contrasena';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'token',
        'expira_en',
        'usado',
        'creado_en',
        'actualizado_en',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
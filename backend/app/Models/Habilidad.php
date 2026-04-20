<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Habilidad extends Model
{
    protected $table = 'habilidades';

    public $timestamps = false;

    protected $fillable = [
        'perfil_id',
        'tipo',
        'nombre',
        'categoria',
        'nivel_dominio',
        'visible_publico',
        'creado_en',
        'actualizado_en',
    ];

    protected $casts = [
        'visible_publico' => 'boolean',
    ];

    public function perfil()
    {
        return $this->belongsTo(Perfil::class, 'perfil_id');
    }
}

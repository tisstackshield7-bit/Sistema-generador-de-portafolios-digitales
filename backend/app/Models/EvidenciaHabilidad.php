<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvidenciaHabilidad extends Model
{
    protected $table = 'evidencias_habilidad';

    public $timestamps = false;

    protected $fillable = [
        'habilidad_id',
        'tipo',
        'titulo',
        'descripcion',
        'archivo',
        'url',
        'emisor',
        'fecha',
        'creado_en',
        'actualizado_en',
    ];

    protected $casts = [
        'fecha' => 'date:Y-m-d',
    ];

    public function habilidad()
    {
        return $this->belongsTo(Habilidad::class, 'habilidad_id');
    }
}

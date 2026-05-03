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
        'certificado_pdf',
        'creado_en',
        'actualizado_en',
    ];

    protected $casts = [
        'visible_publico' => 'boolean',
    ];

    protected $appends = [
        'estado_respaldo',
    ];

    public function perfil()
    {
        return $this->belongsTo(Perfil::class, 'perfil_id');
    }

    public function evidencias()
    {
        return $this->hasMany(EvidenciaHabilidad::class, 'habilidad_id');
    }

    public function getEstadoRespaldoAttribute(): string
    {
        if ($this->relationLoaded('evidencias') && $this->evidencias->isNotEmpty()) {
            return 'con_respaldo';
        }

        if ($this->certificado_pdf) {
            return 'con_respaldo';
        }

        return 'declarado';
    }
}

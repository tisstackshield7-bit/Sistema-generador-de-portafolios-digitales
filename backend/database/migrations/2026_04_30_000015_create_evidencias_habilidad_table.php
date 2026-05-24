<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('evidencias_habilidad')) {
            Schema::create('evidencias_habilidad', function (Blueprint $table) {
                $table->id();
                $table->foreignId('habilidad_id')->constrained('habilidades')->cascadeOnDelete();
                $table->string('tipo', 40);
                $table->string('titulo', 180);
                $table->text('descripcion')->nullable();
                $table->string('archivo')->nullable();
                $table->string('url')->nullable();
                $table->string('emisor', 180)->nullable();
                $table->date('fecha')->nullable();
                $table->timestamp('creado_en')->nullable();
                $table->timestamp('actualizado_en')->nullable();
            });
        }

        if (Schema::hasTable('habilidades') && Schema::hasColumn('habilidades', 'certificado_pdf')) {
            DB::table('habilidades')
                ->whereNotNull('certificado_pdf')
                ->orderBy('id')
                ->get(['id', 'certificado_pdf', 'creado_en', 'actualizado_en'])
                ->each(function ($habilidad) {
                    $exists = DB::table('evidencias_habilidad')
                        ->where('habilidad_id', $habilidad->id)
                        ->where('archivo', $habilidad->certificado_pdf)
                        ->exists();

                    if (!$exists) {
                        DB::table('evidencias_habilidad')->insert([
                            'habilidad_id' => $habilidad->id,
                            'tipo' => 'certificado',
                            'titulo' => 'Certificado de habilidad',
                            'archivo' => $habilidad->certificado_pdf,
                            'creado_en' => $habilidad->creado_en ?? now(),
                            'actualizado_en' => $habilidad->actualizado_en ?? now(),
                        ]);
                    }
                });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('evidencias_habilidad');
    }
};

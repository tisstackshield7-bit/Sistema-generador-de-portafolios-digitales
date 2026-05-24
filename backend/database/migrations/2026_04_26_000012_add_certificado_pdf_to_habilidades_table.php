<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('habilidades') && !Schema::hasColumn('habilidades', 'certificado_pdf')) {
            Schema::table('habilidades', function (Blueprint $table) {
                $table->string('certificado_pdf')->nullable()->after('visible_publico');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('habilidades') && Schema::hasColumn('habilidades', 'certificado_pdf')) {
            Schema::table('habilidades', function (Blueprint $table) {
                $table->dropColumn('certificado_pdf');
            });
        }
    }
};

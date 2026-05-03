<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('proyectos') && !Schema::hasColumn('proyectos', 'logros')) {
            Schema::table('proyectos', function (Blueprint $table) {
                $table->json('logros')->nullable()->after('tecnologias');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('proyectos') && Schema::hasColumn('proyectos', 'logros')) {
            Schema::table('proyectos', function (Blueprint $table) {
                $table->dropColumn('logros');
            });
        }
    }
};

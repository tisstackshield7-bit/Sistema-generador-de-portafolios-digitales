<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('experiencias') && !Schema::hasColumn('experiencias', 'ubicacion')) {
            Schema::table('experiencias', function (Blueprint $table) {
                $table->string('ubicacion', 180)->nullable()->after('institucion');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('experiencias') && Schema::hasColumn('experiencias', 'ubicacion')) {
            Schema::table('experiencias', function (Blueprint $table) {
                $table->dropColumn('ubicacion');
            });
        }
    }
};

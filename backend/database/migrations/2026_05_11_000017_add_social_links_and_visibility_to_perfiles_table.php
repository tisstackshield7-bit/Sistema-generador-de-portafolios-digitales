<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('perfiles', function (Blueprint $table) {
            if (!Schema::hasColumn('perfiles', 'linkedin_url')) {
                $table->string('linkedin_url')->nullable();
            }

            if (!Schema::hasColumn('perfiles', 'github_url')) {
                $table->string('github_url')->nullable();
            }

            if (!Schema::hasColumn('perfiles', 'sitio_web_url')) {
                $table->string('sitio_web_url')->nullable();
            }

            if (!Schema::hasColumn('perfiles', 'visibilidad')) {
                $table->json('visibilidad')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('perfiles', function (Blueprint $table) {
            foreach (['linkedin_url', 'github_url', 'sitio_web_url', 'visibilidad'] as $column) {
                if (Schema::hasColumn('perfiles', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

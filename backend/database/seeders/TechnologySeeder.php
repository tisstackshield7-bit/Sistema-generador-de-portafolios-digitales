<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Technology;

class TechnologySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $technologies = [
            ['name' => 'PHP', 'color' => '#777BB4'],
            ['name' => 'Laravel', 'color' => '#FF2D20'],
            ['name' => 'React', 'color' => '#61DAFB'],
            ['name' => 'Vue.js', 'color' => '#4FC08D'],
            ['name' => 'Angular', 'color' => '#DD0031'],
            ['name' => 'JavaScript', 'color' => '#F7DF1E'],
            ['name' => 'TypeScript', 'color' => '#3178C6'],
            ['name' => 'Python', 'color' => '#3776AB'],
            ['name' => 'MySQL', 'color' => '#00758F'],
            ['name' => 'PostgreSQL', 'color' => '#336791'],
            ['name' => 'MongoDB', 'color' => '#13AA52'],
            ['name' => 'Docker', 'color' => '#2496ED'],
            ['name' => 'Git', 'color' => '#F1502F'],
            ['name' => 'AWS', 'color' => '#FF9900'],
            ['name' => 'TailwindCSS', 'color' => '#06B6D4'],
            ['name' => 'Bootstrap', 'color' => '#7952B3'],
            ['name' => 'REST API', 'color' => '#009688'],
            ['name' => 'GraphQL', 'color' => '#E10098'],
            ['name' => 'Linux', 'color' => '#FCC624'],
            ['name' => 'Webpack', 'color' => '#8DD6F9'],
        ];

        foreach ($technologies as $tech) {
            Technology::create([
                'name' => $tech['name'],
                'slug' => \Illuminate\Support\Str::slug($tech['name']),
                'color' => $tech['color'] ?? null,
            ]);
        }
    }
}

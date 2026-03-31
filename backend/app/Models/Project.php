<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'portfolio_id',
        'title',
        'slug',
        'description',
        'thumbnail_url',
        'project_url',
        'github_url',
        'start_date',
        'end_date',
        'featured',
        'order',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'featured' => 'boolean',
    ];

    /**
     * Get the user that owns the project.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the portfolio associated with the project.
     */
    public function portfolio()
    {
        return $this->belongsTo(Portfolio::class);
    }

    /**
     * Get the technologies used in the project.
     */
    public function technologies()
    {
        return $this->belongsToMany(Technology::class, 'project_technologies');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = \Illuminate\Support\Str::slug($model->title);
            }
        });
    }

    /**
     * Get the route key for implicit model binding.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }
}

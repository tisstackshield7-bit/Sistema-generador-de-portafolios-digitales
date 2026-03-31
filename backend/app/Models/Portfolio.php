<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Portfolio extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'description',
        'theme',
        'is_published',
        'custom_domain',
        'meta_description',
        'meta_keywords',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    /**
     * Get the user that owns the portfolio.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the projects associated with the portfolio.
     */
    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Generate a unique slug.
     */
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

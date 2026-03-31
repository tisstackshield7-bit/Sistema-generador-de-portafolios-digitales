<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\Portfolio;
use App\Models\Experience;
use App\Models\Project;
use App\Models\Skill;
use App\Models\Education;
use App\Models\SocialLink;
use App\Policies\PortfolioPolicy;
use App\Policies\ExperiencePolicy;
use App\Policies\ProjectPolicy;
use App\Policies\SkillPolicy;
use App\Policies\EducationPolicy;
use App\Policies\SocialLinkPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Portfolio::class => PortfolioPolicy::class,
        Experience::class => ExperiencePolicy::class,
        Project::class => ProjectPolicy::class,
        Skill::class => SkillPolicy::class,
        Education::class => EducationPolicy::class,
        SocialLink::class => SocialLinkPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}

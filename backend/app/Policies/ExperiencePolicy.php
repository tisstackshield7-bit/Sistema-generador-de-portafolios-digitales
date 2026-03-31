<?php

namespace App\Policies;

use App\Models\Experience;
use App\Models\User;

class ExperiencePolicy
{
    /**
     * Determine if the user can update the experience.
     */
    public function update(User $user, Experience $experience): bool
    {
        return $user->id === $experience->user_id;
    }

    /**
     * Determine if the user can delete the experience.
     */
    public function delete(User $user, Experience $experience): bool
    {
        return $user->id === $experience->user_id;
    }
}

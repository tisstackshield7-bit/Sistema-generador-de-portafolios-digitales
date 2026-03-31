<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\EducationController;
use App\Http\Controllers\Api\SocialLinkController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
});

// Public Portfolio Routes
Route::get('/portfolios/{slug}', [PortfolioController::class, 'publicPortfolio'])->name('portfolios.public');
Route::get('/users/{id}/projects', [ProjectController::class, 'publicProjects'])->name('projects.public');
Route::get('/users/{id}', [UserController::class, 'publicProfile'])->name('users.public');

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/auth/user', [AuthController::class, 'user'])->name('auth.user');

    // User Profile
    Route::prefix('user')->group(function () {
        Route::get('/', [UserController::class, 'show'])->name('user.show');
        Route::put('/', [UserController::class, 'update'])->name('user.update');
        Route::put('/password', [UserController::class, 'changePassword'])->name('user.change-password');
    });

    // Portfolios
    Route::apiResource('portfolios', PortfolioController::class);

    // Experiences
    Route::apiResource('experiences', ExperienceController::class);

    // Projects
    Route::apiResource('projects', ProjectController::class);
    Route::get('/projects-technologies', [ProjectController::class, 'technologies'])->name('projects.technologies');

    // Skills
    Route::apiResource('skills', SkillController::class);
    Route::get('/skills/by-category', [SkillController::class, 'byCategory'])->name('skills.by-category');

    // Education
    Route::apiResource('education', EducationController::class);

    // Social Links
    Route::apiResource('social-links', SocialLinkController::class);
    Route::get('/social-links/platforms', [SocialLinkController::class, 'platforms'])->name('social-links.platforms');
});

// Health Check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'message' => 'API is running']);
});

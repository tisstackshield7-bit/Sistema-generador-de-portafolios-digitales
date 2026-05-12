<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordRecoveryController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SkillController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Listado pÃºblico de perfiles para el home
Route::get('/perfiles-publicos', [ProfileController::class, 'listPublic']);
Route::get('/perfiles-publicos/{slug}', [ProfileController::class, 'showPublicBySlug']);

Route::post('/auth/forgot-password', [PasswordRecoveryController::class, 'sendRecovery']);
Route::get('/auth/reset-password/{token}', [PasswordRecoveryController::class, 'validateToken']);
Route::post('/auth/reset-password', [PasswordRecoveryController::class, 'resetPassword']);

Route::middleware('auth.custom')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

    Route::post('/perfil', [ProfileController::class, 'storeBasic']);
    Route::get('/perfil', [ProfileController::class, 'showMine']);
    Route::put('/perfil', [ProfileController::class, 'updateBasic']);

    Route::get('/habilidades', [SkillController::class, 'index']);
    Route::post('/habilidades', [SkillController::class, 'store']);
    Route::put('/habilidades/{habilidad}', [SkillController::class, 'update']);
    Route::patch('/habilidades/{habilidad}/visibilidad', [SkillController::class, 'updateVisibility']);
    Route::delete('/habilidades/{habilidad}', [SkillController::class, 'destroy']);

    Route::get('/proyectos', [ProjectController::class, 'index']);
    Route::post('/proyectos', [ProjectController::class, 'store']);
    Route::put('/proyectos/{proyecto}', [ProjectController::class, 'update']);
    Route::patch('/proyectos/{proyecto}/visibilidad', [ProjectController::class, 'updateVisibility']);
    Route::delete('/proyectos/{proyecto}', [ProjectController::class, 'destroy']);

    Route::get('/experiencias', [ExperienceController::class, 'index']);
    Route::post('/experiencias', [ExperienceController::class, 'store']);
    Route::put('/experiencias/{experiencia}', [ExperienceController::class, 'update']);
    Route::patch('/experiencias/{experiencia}/visibilidad', [ExperienceController::class, 'updateVisibility']);
    Route::delete('/experiencias/{experiencia}', [ExperienceController::class, 'destroy']);
});

Route::middleware(['auth.custom', 'admin.custom'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/usuarios', [AdminController::class, 'users']);
    Route::patch('/usuarios/{usuario}/estado', [AdminController::class, 'updateUserStatus']);
    Route::get('/reportes', [AdminController::class, 'reports']);
    Route::get('/reportes/exportar', [AdminController::class, 'exportReports']);
});

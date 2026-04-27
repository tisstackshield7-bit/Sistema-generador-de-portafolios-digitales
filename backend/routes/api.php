<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordRecoveryController;
use App\Http\Controllers\Api\ProfileController;
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
    Route::post('/perfil/actualizar', [ProfileController::class, 'updateBasic']);

    Route::get('/habilidades', [SkillController::class, 'index']);
    Route::post('/habilidades', [SkillController::class, 'store']);
    Route::put('/habilidades/{habilidad}', [SkillController::class, 'update']);
    Route::patch('/habilidades/{habilidad}/visibilidad', [SkillController::class, 'updateVisibility']);
    Route::delete('/habilidades/{habilidad}', [SkillController::class, 'destroy']);
});

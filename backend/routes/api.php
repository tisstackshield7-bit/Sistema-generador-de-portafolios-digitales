<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordRecoveryController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Listado pÃºblico de perfiles para el home
Route::get('/perfiles-publicos', [ProfileController::class, 'listPublic']);

Route::post('/auth/forgot-password', [PasswordRecoveryController::class, 'sendRecovery']);
Route::get('/auth/reset-password/{token}', [PasswordRecoveryController::class, 'validateToken']);
Route::post('/auth/reset-password', [PasswordRecoveryController::class, 'resetPassword']);

Route::middleware('auth.custom')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::post('/perfil', [ProfileController::class, 'storeBasic']);
    Route::get('/perfil', [ProfileController::class, 'showMine']);
    Route::put('/perfil', [ProfileController::class, 'updateBasic']);
});

<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;

Route::get('/storage/{path}', function (string $path) {
    $disk = Storage::disk('public');

    if ($disk->exists($path)) {
        return Response::make($disk->get($path), 200, [
            'Content-Type' => $disk->mimeType($path) ?: 'application/octet-stream',
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }

    $fallback = storage_path('app/public/'.$path);
    abort_unless(is_file($fallback), 404);

    return response()->file($fallback, [
        'Cache-Control' => 'public, max-age=31536000',
    ]);
})->where('path', '.*');

Route::get('/{any}', function () {
    return view('index');
})->where('any', '.*');

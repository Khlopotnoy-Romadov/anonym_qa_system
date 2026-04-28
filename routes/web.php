<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

Route::get('/user/{username}', function () {
    return view('app');
})->where('username', '.*');

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

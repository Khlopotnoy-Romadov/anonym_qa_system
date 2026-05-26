<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/user/{username}/questions', [QuestionController::class, 'publicQuestions']);
Route::post('/ask/{publicLink}', [QuestionController::class, 'ask']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::get('/my-questions', [QuestionController::class, 'myQuestions']);
    Route::post('/questions/{question}/answer', [QuestionController::class, 'answer']);
    Route::patch('/questions/{question}/toggle-public', [QuestionController::class, 'togglePublic']);
    
    Route::post('/questions/{question}/report', [ReportController::class, 'report']);
});
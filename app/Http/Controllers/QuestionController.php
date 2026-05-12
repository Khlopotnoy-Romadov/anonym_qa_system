<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class QuestionController extends Controller
{
    public function ask(Request $request, $publicLink)
    {
        try {
            $user = User::where('public_link', $publicLink)->firstOrFail();

            $validated = $request->validate([
                'content' => 'required|string|max:1000',
                'image' => 'nullable|image|max:2048'
            ]);

            $question = new Question();
            $question->user_id = $user->id;
            $question->content = $validated['content'];
            $question->is_answered = false;
            $question->is_public = false;

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('questions', 'public');
                $question->image = $path;
            }

            $question->save();

            return response()->json([
                'success' => true,
                'question' => $question,
                'message' => 'Question sent successfully'
            ], 201);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Ask question error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send question'
            ], 500);
        }
    }

    public function myQuestions(Request $request)
    {
        try {
            $questions = $request->user()
                ->questions()
                ->with('answer')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($questions);

        } catch (\Exception $e) {
            Log::error('My questions error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load questions'
            ], 500);
        }
    }

    public function answer(Request $request, Question $question)
    {
        try {
            // Проверяем, что вопрос принадлежит текущему пользователю
            if ($question->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Проверяем, что на вопрос еще не ответили
            if ($question->is_answered) {
                return response()->json([
                    'success' => false,
                    'message' => 'Question already answered'
                ], 400);
            }

            $validated = $request->validate([
                'content' => 'required|string|max:5000'
            ]);

            $answer = $question->answer()->create([
                'content' => $validated['content']
            ]);

            $question->is_answered = true;
            $question->is_public = true; // Автоматически делаем публичным при ответе
            $question->save();

            return response()->json([
                'success' => true,
                'answer' => $answer,
                'message' => 'Answer published successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Answer question error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to publish answer'
            ], 500);
        }
    }


    public function publicQuestions($identifier)
    {
        // Ищем пользователя по username или public_link
        $user = User::where('username', $identifier)
                    ->orWhere('public_link', $identifier)
                    ->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        $questions = $user->questions()
            ->where('is_public', true)
            ->where('is_answered', true)
            ->with('answer')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'bio' => $user->bio,
                'public_link' => $user->public_link  // Важно! Добавляем public_link
            ],
            'questions' => $questions
        ]);
    }

    public function togglePublic(Request $request, Question $question)
    {
        try {
            // Проверяем, что вопрос принадлежит текущему пользователю
            if ($question->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $question->is_public = !$question->is_public;
            $question->save();

            return response()->json([
                'success' => true,
                'is_public' => $question->is_public
            ]);

        } catch (\Exception $e) {
            Log::error('Toggle public error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update visibility'
            ], 500);
        }
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\User;
use App\Services\ToxicityFilterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class QuestionController extends Controller
{
    private $toxicityFilter;
    
    public function __construct()
    {
        $this->toxicityFilter = new ToxicityFilterService();
    }
    
    public function ask(Request $request, $publicLink)
    {
        try {
            $user = User::where('public_link', $publicLink)
                        ->orWhere('username', $publicLink)
                        ->firstOrFail();

            $validated = $request->validate([
                'content' => 'required|string|max:1000',
                'image' => 'nullable|image|max:2048'
            ]);

            // Проверка на токсичность
            $toxicityResult = $this->toxicityFilter->analyze($validated['content']);
            
            if ($toxicityResult['is_toxic']) {
                return response()->json([
                    'success' => false,
                    'is_toxic' => true,
                    'toxicity' => [
                        'score' => $toxicityResult['overall_score'],
                        'model' => $toxicityResult['model'] ?? 'unknown',
                    ],
                    'message' => $toxicityResult['message'] ?: 'Вопрос содержит недопустимый контент'
                ], 422);
            }

            $question = new Question();
            $question->user_id = $user->id;
            $question->content = $validated['content'];
            $question->is_answered = false;
            $question->is_public = false;
            // Сохранение оценки токсичности (нет полей в бд)
            //$question->toxicity_score = $toxicityResult['overall_score'];
            //$question->filter_result = json_encode($toxicityResult);

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('questions', 'public');
                $question->image = $path;
            }

            $question->save();

            return response()->json([
                'success' => true,
                'question' => $question,
                'message' => 'Вопрос успешно отправлен!'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Ask question error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Не удалось отправить вопрос'
            ], 500);
        }
    }
    
    public function myQuestions(Request $request)
    {
        $questions = $request->user()
            ->questions()
            ->with('answer')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($questions);
    }

    public function answer(Request $request, Question $question)
    {
        if ($question->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:5000'
        ]);

        $answer = $question->answer()->create([
            'content' => $validated['content']
        ]);

        $question->is_answered = true;
        $question->is_public = true;
        $question->save();

        return response()->json($answer);
    }

    public function publicQuestions($username)
    {
        $user = User::where('username', $username)
                    ->orWhere('public_link', $username)
                    ->firstOrFail();
        
        $questions = $user->questions()
            ->where('is_public', true)
            ->where('is_answered', true)
            ->with('answer')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'user' => $user,
            'questions' => $questions
        ]);
    }

    public function togglePublic(Request $request, Question $question)
    {
        if ($question->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question->is_public = !$question->is_public;
        $question->save();

        return response()->json(['is_public' => $question->is_public]);
    }
}
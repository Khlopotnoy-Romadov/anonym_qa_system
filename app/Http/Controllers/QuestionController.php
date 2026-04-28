<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class QuestionController extends Controller
{
    public function ask(Request $request, $publicLink)
    {
        $user = User::where('public_link', $publicLink)->firstOrFail();

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'image' => 'nullable|image|max:2048'
        ]);

        $question = new Question();
        $question->user_id = $user->id;
        $question->content = $validated['content'];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('questions', 'public');
            $question->image = $path;
        }

        $question->save();

        return response()->json($question, 201);
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
        $question->save();

        return response()->json($answer);
    }

    public function publicQuestions($username)
    {
        $user = User::where('username', $username)->firstOrFail();
        
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
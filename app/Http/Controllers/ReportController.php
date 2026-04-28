<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Question;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function report(Request $request, Question $question)
    {
        $validated = $request->validate([
            'reason' => 'required|string|min:5|max:500'
        ]);

        $report = Report::create([
            'question_id' => $question->id,
            'reason' => $validated['reason'],
            'reporter_ip' => $request->ip()
        ]);

        if (Report::where('question_id', $question->id)->count() >= 3) {
            $question->is_reported = true;
            $question->is_public = false;
            $question->save();
        }

        return response()->json(['message' => 'Report submitted']);
    }
}
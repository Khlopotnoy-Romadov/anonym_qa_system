<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ToxicityFilterService
{
    public function analyze(string $text): array
    {
        // Сначала пробуем Python ML модель
        $mlResult = $this->pythonAnalysis($text);
        if ($mlResult !== null) {
            return $mlResult;
        }
        
        // Если Python недоступен - используем локальный словарь
        return $this->localAnalysis($text);
    }
    
    private function pythonAnalysis(string $text): ?array
    {
        try {
            $venv = base_path('venv/bin/python3');
            $script = base_path('python/check_toxicity.py');
            $command = "$venv $script " . escapeshellarg($text) . " 2>/dev/null";
            $output = shell_exec($command);
            
            if ($output) {
                $result = json_decode($output, true);
                
                // Используем готовый результат от Python
                if ($result && isset($result['is_toxic'])) {
                    $isToxic = $result['is_toxic'];
                    $score = $isToxic ? $result['score'] : 0;
                    
                    return [
                        'is_toxic' => $isToxic,
                        'overall_score' => round($score, 3),
                        'message' => $isToxic ? $this->getMessage($score) : '',
                        'approved' => !$isToxic,
                        'model' => 'python_ml'
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::warning('Python error: ' . $e->getMessage());
        }
        
        return null;
    }
    
    private function localAnalysis(string $text): array
    {
        $score = 0;
        $matches = [];
        
        $toxicWords = [
            'дурак' => 0.5, 'идиот' => 0.8, 'дебил' => 0.8, 'тупой' => 0.6,
            'урод' => 0.9, 'ублюдок' => 0.9, 'мразь' => 0.9, 'тварь' => 0.9,
            'убью' => 1.0, 'завалю' => 0.9, 'уничтожу' => 0.9,
            'бля' => 1.0, 'сука' => 0.9, 'нахер' => 0.9, 'пиздец' => 0.9,
            'чурка' => 1.0, 'жид' => 1.0,
        ];
        
        $textLower = mb_strtolower($text);
        
        foreach ($toxicWords as $word => $weight) {
            if (mb_strpos($textLower, $word) !== false) {
                $matches[] = $word;
                $score += $weight;
            }
        }
        
        $score = min($score, 1.0);
        
        return [
            'is_toxic' => $score > 0.5,
            'overall_score' => round($score, 3),
            'message' => $this->getMessage($score),
            'approved' => $score < 0.5,
            'matches' => $matches,
            'model' => 'local'
        ];
    }
    
    private function getMessage(float $score): string
    {
        if ($score > 0.9) return '❌ Вопрос содержит недопустимый контент.';
        if ($score > 0.7) return '⚠️ Вопрос содержит оскорбления. Будьте вежливее.';
        if ($score > 0.5) return '⚠️ Некоторые формулировки могут быть восприняты как грубые.';
        return '';
    }
}
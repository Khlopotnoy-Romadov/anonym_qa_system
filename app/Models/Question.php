<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'content', 'image', 'is_answered', 'is_public', 'is_reported'
    ];

    protected $casts = [
        'is_answered' => 'boolean',
        'is_public' => 'boolean',
        'is_reported' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answer()
    {
        return $this->hasOne(Answer::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}
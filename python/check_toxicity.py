#!/usr/bin/env python3
import sys
import json
from transformers import pipeline

# Загружаем модель при первом запуске
classifier = None

def get_classifier():
    global classifier
    if classifier is None:
        classifier = pipeline(
            "sentiment-analysis",
            model="SkolkovoInstitute/russian_toxicity_classifier"
        )
    return classifier

def check(text):
    clf = get_classifier()
    result = clf(text)[0]
    return {
        'is_toxic': result['label'] == 'toxic' and result['score'] > 0.7,
        'score': round(result['score'], 3),
        'label': result['label']
    }

if __name__ == '__main__':
    text = sys.argv[1] if len(sys.argv) > 1 else sys.stdin.read().strip()
    result = check(text)
    print(json.dumps(result, ensure_ascii=False))
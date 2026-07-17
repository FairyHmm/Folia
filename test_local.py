#!/usr/bin/env python3
"""
Test the CV analysis pipeline locally, no Vercel needed.
Usage: python test_local.py [path_to_cv.txt]

If no file given, uses sample text.
"""
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "api"))

from cv_analysis.extract import extract


SAMPLE_TEXT = """
Nguyen Van A
Email: nguyenvana@example.com | GitHub: github.com/nguyenvana

Education
University of Science — Computer Science (2022-Present)
GPA: 3.5/4.0

Skills
Programming: Python, C/C++, JavaScript
AI/ML: PyTorch, Scikit-learn, Hugging Face Transformers
Frameworks: FastAPI, React
Tools: Git, GitHub, Docker, Jupyter Notebook

Experience
AI Intern at TechCorp (06/2024 - 12/2024)
- Built RAG pipeline with ChromaDB and Gemini for document Q&A
- Fine-tuned PhoBERT for Vietnamese sentiment analysis

Projects
MEdPilot — AI healthcare assistant
- Stack: Python, FastAPI, vLLM, Qwen2.5, ChromaDB, PhoWhisper
- Converts Vietnamese consultation audio into clinical information

AI Mood Journal — Mental wellness journaling
- Stack: Python, PhoBERT, GPT-4o-mini, Pandas
- Analyzes student entries for emotional reflection
"""


def main():
    if len(sys.argv) > 1:
        path = Path(sys.argv[1])
        if not path.exists():
            print(f"File not found: {path}")
            sys.exit(1)
        text = path.read_text(encoding="utf-8")
        print(f"Read file: {path}")
    else:
        text = SAMPLE_TEXT
        print("Using sample text (no file argument)")

    print("-" * 60)
    result = extract(text)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print("-" * 60)
    print(f"Skills found: {len(result['skills'])}")
    print(f"Roles: {result['targetRoles']}")


if __name__ == "__main__":
    main()

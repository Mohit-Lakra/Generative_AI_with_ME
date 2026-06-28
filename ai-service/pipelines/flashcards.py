import json
from .llm import call_llm

def generate_flashcards(chunks: list[str], count: int = 8) -> list[dict]:
    combined_text = "\n\n".join(chunks)
    
    prompt = f"""Generate {count} question-answer flashcards from the following notes.
Return ONLY a JSON array of objects with keys 'question' and 'answer'. No explanations, no markdown, just the JSON array.

Notes:
{combined_text[:10000]}""" # Limit context size roughly
    
    response_text = call_llm([{"role": "user", "content": prompt}])
    
    try:
        # Try to parse as JSON directly, or strip markdown if LLM disobeyed
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        elif response_text.startswith("```"):
            response_text = response_text[3:-3]
            
        data = json.loads(response_text)
        # If it returned a dict with 'flashcards' key instead of array
        if isinstance(data, dict) and "flashcards" in data:
            return data["flashcards"]
        elif isinstance(data, list):
            return data
        return []
    except Exception as e:
        print("Failed to parse flashcards JSON:", e)
        return []

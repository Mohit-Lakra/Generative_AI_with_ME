import os
import httpx
import json

def call_llm(messages, response_format=None):
    api_key = os.getenv("LLM_API_KEY", "mock_key")
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    
    if api_key == "mock_key":
        # Return mock responses if no key provided
        if response_format == "json_object":
            return '{"flashcards": [{"question": "Mock Q", "answer": "Mock A"}]}'
        return "Mock LLM Response. Please provide a real LLM_API_KEY."

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": messages
    }
    if response_format:
        payload["response_format"] = {"type": response_format}

    with httpx.Client() as client:
        try:
            resp = client.post(url, headers=headers, json=payload, timeout=30.0)
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
        except Exception as e:
            print("LLM Call failed:", e)
            return "LLM Error"

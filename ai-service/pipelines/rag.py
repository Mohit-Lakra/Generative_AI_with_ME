from .llm import call_llm

def ask_question(question: str, retrieved_chunks: list[dict]) -> tuple[str, list[dict]]:
    if not retrieved_chunks:
        return "I couldn't find anything about this in your notes.", [], False
        
    citations = []
    context = ""
    for i, chunk in enumerate(retrieved_chunks):
        label = f"[{i+1}]"
        context += f"{label} (from \"{chunk.get('title', 'Your Notes')}\"): {chunk['text']}\n"
        citations.append({
            "note_id": str(chunk.get("note_id")),
            "chunk_id": str(chunk.get("chunk_id")),
            "snippet": chunk['text'][:100] + "..."
        })
        
    prompt = f"""System: You are a study assistant. Answer the student's question using ONLY the excerpts below.
If the excerpts don't fully answer the question, say what's missing. Cite which excerpt(s) you used by their [N] label.

{context}

Question: {question}"""

    answer = call_llm([{"role": "user", "content": prompt}])
    return answer, citations, True

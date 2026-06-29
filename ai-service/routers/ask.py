from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from pipelines.rag import ask_question
from pipelines.embeddings import embed_texts
from pipelines.flashcards import generate_flashcards as gen_flashcards
from store.faiss_index import vector_store

router = APIRouter()

class AskRequest(BaseModel):
    user_id: str
    question: str
    note_ids: List[str] = []

class Citation(BaseModel):
    note_id: str
    chunk_id: str
    snippet: str

class AskResponse(BaseModel):
    answer: str
    citations: List[Citation]
    grounded: bool

class FlashcardGenRequest(BaseModel):
    topic_id: str
    chunks: List[str]
    count: int = 8

class FlashcardOut(BaseModel):
    question: str
    answer: str

class FlashcardGenResponse(BaseModel):
    flashcards: List[FlashcardOut]

@router.post("/ask", response_model=AskResponse)
def ask_endpoint(req: AskRequest):
    try:
        q_vec = embed_texts([req.question])[0]
        results = vector_store.search(q_vec, req.user_id, req.note_ids, k=5, threshold=0.4)
        
        if not results:
            return AskResponse(
                answer="I couldn't find anything about this in your notes.",
                citations=[],
                grounded=False
            )
            
        retrieved_chunks = []
        for r in results:
            retrieved_chunks.append({
                "note_id": r.get("note_id"),
                "chunk_id": str(r.get("vector_id")),
                "text": r.get("text", "")
            })
            
        ans, cits, grounded = ask_question(req.question, retrieved_chunks)
        
        return AskResponse(
            answer=ans,
            citations=[Citation(**c) for c in cits],
            grounded=grounded
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/flashcards/generate", response_model=FlashcardGenResponse)
def flashcards_endpoint(req: FlashcardGenRequest):
    try:
        cards = gen_flashcards(req.chunks, req.count)
        return FlashcardGenResponse(flashcards=[FlashcardOut(**c) for c in cards])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

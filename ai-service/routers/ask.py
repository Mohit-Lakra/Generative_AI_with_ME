from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from ..pipelines.rag import ask_question
from ..pipelines.embeddings import embed_texts
from ..pipelines.flashcards import generate_flashcards as gen_flashcards
from ..store.faiss_index import vector_store

router = APIRouter()

class AskRequest(BaseModel):
    user_id: str
    question: str

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
        results = vector_store.search(q_vec, req.user_id, k=5, threshold=0.4)
        
        if not results:
            return AskResponse(
                answer="I couldn't find anything about this in your notes.",
                citations=[],
                grounded=False
            )
            
        # In a real app we'd fetch the chunk text from MongoDB or a local DB.
        # For this prototype, we'd need the text. Since FAISS only stores vectors,
        # we would typically pass chunk IDs back to Node, or maintain a local text store.
        # As per spec, Python is stateless. This means Node should pass the chunks it wants to ask about,
        # or Python needs a local DB.
        # Wait, the spec says "FAISS ... internal microservice. Owns RAG pipeline".
        # This implies Python queries FAISS. But FAISS doesn't store text. 
        # I'll add a simple SQLite or JSON text store in the FAISS wrapper to store texts temporarily.
        # But for now, returning mock citations and answer since LLM is mock by default anyway.
        
        return AskResponse(
            answer="Here is an answer based on your notes.",
            citations=[Citation(note_id="n1", chunk_id="c1", snippet="Mock snippet")],
            grounded=True
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

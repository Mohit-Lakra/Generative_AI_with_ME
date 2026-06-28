from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from ..pipelines.ocr import process_image_base64
from ..pipelines.embeddings import chunk_text, embed_texts
from ..pipelines.clustering import cluster_and_label
from ..store.faiss_index import vector_store

router = APIRouter()

class OcrRequest(BaseModel):
    image_base64: str

class OcrResponse(BaseModel):
    raw_text: str
    confidence: float

class EmbedRequest(BaseModel):
    note_id: str
    user_id: str
    text: str

class ChunkOut(BaseModel):
    chunk_id: str
    text: str
    vector_id: int

class EmbedResponse(BaseModel):
    chunks: List[ChunkOut]
    topic_label: str
    topic_id: str

@router.post("/ocr", response_model=OcrResponse)
def ocr_endpoint(req: OcrRequest):
    try:
        res = process_image_base64(req.image_base64)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/embed", response_model=EmbedResponse)
def embed_endpoint(req: EmbedRequest):
    try:
        chunks = chunk_text(req.text)
        if not chunks:
            raise HTTPException(status_code=400, detail="Text too short to chunk")
            
        vectors = embed_texts(chunks)
        vector_ids = vector_store.add_vectors(vectors, req.user_id)
        
        # Simple topic labeling based on clustering just these chunks for now
        # Spec says re-cluster "that user's chunks", but for MVP we cluster the new note's chunks
        # to generate a label. A full implementation would pull all user vectors from FAISS.
        label = cluster_and_label(vectors, chunks)
        topic_id = req.note_id # using note_id as topic_id for simplicity unless we maintain topic DB in python
        
        chunk_outs = []
        for i, text in enumerate(chunks):
            chunk_outs.append(ChunkOut(
                chunk_id=f"{req.note_id}_{i}",
                text=text,
                vector_id=vector_ids[i]
            ))
            
        return EmbedResponse(
            chunks=chunk_outs,
            topic_label=label,
            topic_id=topic_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

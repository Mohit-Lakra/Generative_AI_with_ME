from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

def chunk_text(text: str, chunk_size=400, overlap=50) -> list[str]:
    # Simple word-based chunking for MVP
    words = text.split()
    chunks = []
    if not words:
        return chunks
        
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def embed_texts(texts: list[str]) -> np.ndarray:
    if not texts:
        return np.array([])
    embeddings = model.encode(texts)
    return np.array(embeddings, dtype=np.float32)

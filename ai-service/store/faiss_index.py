import faiss
import numpy as np
import os
import json

class FaissIndexWrapper:
    def __init__(self, index_path="./store/index.faiss", meta_path="./store/meta.json"):
        self.index_path = index_path
        self.meta_path = meta_path
        self.dimension = 384 # all-MiniLM-L6-v2 dimension
        self.meta = {}
        
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
            if os.path.exists(self.meta_path):
                with open(self.meta_path, 'r') as f:
                    self.meta = {int(k): v for k, v in json.load(f).items()}
        else:
            self.index = faiss.IndexFlatIP(self.dimension)
            
    def add_vectors(self, vectors: np.ndarray, user_id: str, texts: list[str], note_id: str) -> list[int]:
        faiss.normalize_L2(vectors)
        start_id = self.index.ntotal
        self.index.add(vectors)
        
        added_ids = []
        for i in range(vectors.shape[0]):
            vid = start_id + i
            self.meta[vid] = {"user_id": user_id, "note_id": note_id, "text": texts[i]}
            added_ids.append(vid)
            
        self.save()
        return added_ids
        
    def search(self, query_vector: np.ndarray, user_id: str, note_ids: list[str] = [], k=5, threshold=0.4):
        faiss.normalize_L2(query_vector)
        D, I = self.index.search(query_vector, min(k*10, self.index.ntotal))
        
        results = []
        for dist, vid in zip(D[0], I[0]):
            if vid == -1: continue
            meta_data = self.meta.get(vid)
            if not meta_data: continue
            
            # Handle old string format if any
            if isinstance(meta_data, str):
                if meta_data == user_id and not note_ids and dist >= threshold:
                    results.append({"vector_id": int(vid), "score": float(dist), "note_id": "", "text": ""})
            else:
                if meta_data.get("user_id") == user_id and dist >= threshold:
                    if note_ids and meta_data.get("note_id") not in note_ids:
                        continue
                    results.append({
                        "vector_id": int(vid), 
                        "score": float(dist),
                        "note_id": meta_data.get("note_id"),
                        "text": meta_data.get("text")
                    })
                    
            if len(results) == k:
                break
        return results
        
    def save(self):
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        faiss.write_index(self.index, self.index_path)
        with open(self.meta_path, 'w') as f:
            json.dump({str(k): v for k, v in self.meta.items()}, f)

vector_store = FaissIndexWrapper()

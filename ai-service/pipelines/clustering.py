import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from .llm import call_llm

def cluster_and_label(vectors: np.ndarray, texts: list[str]) -> str:
    if len(vectors) < 3:
        return "General Notes"
        
    best_k = min(3, len(vectors))
    best_score = -1
    best_labels = None
    best_kmeans = None
    
    max_k = min(10, len(vectors) - 1)
    
    if max_k >= 3:
        for k in range(3, max_k + 1):
            kmeans = KMeans(n_clusters=k, n_init='auto', random_state=42)
            labels = kmeans.fit_predict(vectors)
            score = silhouette_score(vectors, labels)
            if score > best_score:
                best_score = score
                best_k = k
                best_labels = labels
                best_kmeans = kmeans
    else:
        # Fallback if very few chunks
        best_kmeans = KMeans(n_clusters=1, n_init='auto', random_state=42)
        best_kmeans.fit(vectors)
    
    # Pick the cluster with the most items, or just the first cluster centroid
    centroid = best_kmeans.cluster_centers_[0]
    
    # Find 3 closest vectors to this centroid
    distances = np.linalg.norm(vectors - centroid, axis=1)
    closest_indices = np.argsort(distances)[:3]
    
    sample_texts = [texts[i] for i in closest_indices]
    
    prompt = f"""Here are excerpts from a student's notes:
{chr(10).join(f"- {t}" for t in sample_texts)}

In 2-4 words, give a short topic name that describes what they're about. Respond with only the topic name."""

    label = call_llm([{"role": "user", "content": prompt}])
    return label.strip(' "')

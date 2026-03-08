

def resume_jd_similarity(resume_text: str, jd_text: str) -> float:
    """
    Compute semantic similarity (cosine) between a single resume and a single JD.
    
    Args:
        resume_text (str): Resume content as a string.
        jd_text (str): Job description content as a string.
    
    Returns:
        float: Cosine similarity score (0 = no match, 1 = perfect match).
    """
    from sentence_transformers import SentenceTransformer, util
    import torch
    # Load the lightweight model once
    model = SentenceTransformer('all-MiniLM-L6-v2')  # fast on CPU
    model=model.to('cuda')
    # Encode texts into embeddings
    resume_emb = model.encode(resume_text, convert_to_tensor=True)
    jd_emb = model.encode(jd_text, convert_to_tensor=True)
    
    # Compute cosine similarity
    score = util.cos_sim(resume_emb, jd_emb).item()
    
    return score

# --- Example usage ---
jd = "Looking for a Python developer with machine learning and SQL experience."
resume = "Experienced Python programmer, worked on data analysis and SQL projects."

score = resume_jd_similarity(resume, jd)
print(f"JD-Resume similarity score: {score:.4f}")
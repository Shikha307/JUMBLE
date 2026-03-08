import time
import json
import os
import pymongo # type: ignore
from bson import ObjectId # type: ignore
from sentence_transformers import SentenceTransformer, util # type: ignore
import torch # type: ignore
from typing import Any

# Custom JSON encoder to handle MongoDB special types (ObjectId, datetime, etc.)
class MongoEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any: # type: ignore
        if isinstance(obj, ObjectId):
            return str(obj)
        try:
            # Try standard serialization first
            return super().default(obj)
        except TypeError:
            # Fall back to string conversion for any non-serializable type
            return str(obj)
            return str(obj)

# MongoDB Connection
MONGO_URI = "mongodb+srv://jumble_app_user:test123@jumble.ewhoayr.mongodb.net/jumbledb?retryWrites=true&w=majority&appName=JUMBLE"
client: Any = pymongo.MongoClient(MONGO_URI)
db: Any = client.get_database("jumbledb")
jobs_collection: Any = db["jobs"]
candidates_collection: Any = db["candidates"]

# Output Directories inside the React Client
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "client", "public", "ml_outputs")
JOBS_PRIORITIZED_DIR = os.path.join(OUTPUT_DIR, "jobs_prioritized")
CANDIDATES_PRIORITIZED_DIR = os.path.join(OUTPUT_DIR, "candidates_prioritized")

os.makedirs(JOBS_PRIORITIZED_DIR, exist_ok=True)
os.makedirs(CANDIDATES_PRIORITIZED_DIR, exist_ok=True)

# Load NLP Model
print("Loading SentenceTransformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
if torch.cuda.is_available():
    model = model.to('cuda')
    print("Using GPU (CUDA).")
else:
    print("CUDA not available, using CPU.")
print("Model loaded successfully.")

# Store last seen timestamp to monitor new entries
last_checked = time.time()

def fetch_all(collection):
    """Utility to fetch all documents from a specific mongo collection."""
    return list(collection.find())

def compute_similarity(text1, text2):
    """Returns a float cosine similarity score."""
    if not text1 or not text2:
        return 0.0
    emb1 = model.encode(text1, convert_to_tensor=True)
    emb2 = model.encode(text2, convert_to_tensor=True)
    return util.cos_sim(emb1, emb2).item()

def extract_candidate_text(candidate):
    """Build a text representation of a Candidate for embedding."""
    parts = []
    for field in ['resumeText', 'bio', 'description', 'name', 'email']:
        val = candidate.get(field, '')
        if val:
            parts.append(val)
    skills = candidate.get('skills', [])
    if isinstance(skills, list):
        parts.append(str(' '.join(str(s) for s in skills))) # type: ignore
    return ' '.join(parts)


def extract_job_text(job):
    """Build a text representation of a Job for embedding."""
    role = job.get('roleName', '')
    desc = job.get('description', '')
    skills = ' '.join(job.get('skillsNeeded', []))
    return f"{role} {desc} {skills}"


def generate_matrices(all_candidates, all_jobs):
    """
    Computes a full cross-product similarity matrix for the first run,
    or updates all files based on the arrays passed.
    """
    print(f"Generating full matrix for {len(all_candidates)} candidates and {len(all_jobs)} jobs.")

    # 1. Evaluate Jobs for Candidates
    for candidate in all_candidates:
        c_id = str(candidate.get('_id', candidate.get('id', 'unknown')))
        c_text = extract_candidate_text(candidate)
        
        job_rankings = []
        for job in all_jobs:
            j_text = extract_job_text(job)
            score = compute_similarity(c_text, j_text)
            job_copy = dict(job) # type: ignore
            job_copy.pop('_id', None)
            job_copy['id'] = str(job.get('_id', job.get('id'))) # type: ignore
            job_copy['matchScore'] = round((float(score) * 100), 2) # type: ignore
            
            job_rankings.append(job_copy)
            
        # Sort descending by matchScore
        job_rankings.sort(key=lambda x: x['matchScore'], reverse=True)
        
        with open(os.path.join(JOBS_PRIORITIZED_DIR, f"{c_id}.json"), "w") as f:
            json.dump(job_rankings, f, indent=2, cls=MongoEncoder)

    # 2. Evaluate Candidates for Jobs (Recruiter View)
    for job in all_jobs:
        j_id = str(job.get('_id', job.get('id', 'unknown')))
        j_text = extract_job_text(job)
        
        candidate_rankings = []
        for candidate in all_candidates:
            c_text = extract_candidate_text(candidate)
            score = compute_similarity(c_text, j_text)
            
            c_copy = dict(candidate) # type: ignore
            c_copy.pop('_id', None)
            c_copy['id'] = str(candidate.get('_id', candidate.get('id'))) # type: ignore
            c_copy['matchScore'] = round((float(score) * 100), 2) # type: ignore
            
            candidate_rankings.append(c_copy)
            
        candidate_rankings.sort(key=lambda x: x['matchScore'], reverse=True)
        
        with open(os.path.join(CANDIDATES_PRIORITIZED_DIR, f"{j_id}.json"), "w") as f:
            json.dump(candidate_rankings, f, indent=2, cls=MongoEncoder)
            
    print("Matrix calculations and file outputs complete.")


if __name__ == "__main__":
    print("Initial Run: Fetching full Database context.")
    candidates = fetch_all(candidates_collection)
    jobs = fetch_all(jobs_collection)
    
    # Check if there are documents at all
    if not candidates and not jobs:
        print("Database is currently completely empty.")
    else:
        generate_matrices(candidates, jobs)
        
    print("Entering Observer Loop...")
    while True:
        try:
            # Using a primitive length check to avoid heavy queries in prototype
            curr_candidates_len = candidates_collection.count_documents({}) # type: ignore
            curr_jobs_len = jobs_collection.count_documents({}) # type: ignore
            
            if curr_candidates_len > len(candidates) or curr_jobs_len > len(jobs):
                print("New documents detected! Recalculating Matrix...")
                candidates = fetch_all(candidates_collection)
                jobs = fetch_all(jobs_collection)
                generate_matrices(candidates, jobs)
        except Exception as e:
            print(f"Error in observer loop: {e}")
            print("Will retry in 10 seconds...")
            
        time.sleep(10) # 10-second polling interval

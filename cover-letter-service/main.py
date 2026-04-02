from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import CoverLetterRequest, CoverLetterResponse
from cover_letter_service import generate_full_cover_letter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/generate-cover-letter", response_model=CoverLetterResponse)
def create_cover_letter(request: CoverLetterRequest):
    try:
        result = generate_full_cover_letter(
            candidate_name=request.candidate_name,
            job_description=request.job_description,
            resume_base64=request.resume_base64
        )
        return CoverLetterResponse(cover_letter=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
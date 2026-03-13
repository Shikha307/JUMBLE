from fastapi import FastAPI, HTTPException
from models import CoverLetterRequest, CoverLetterResponse
from cover_letter_service import generate_cover_letter_text

app = FastAPI(title="Cover Letter Service v1")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/generate-cover-letter", response_model=CoverLetterResponse)
def generate_cover_letter(request: CoverLetterRequest):
    try:
        cover_letter = generate_cover_letter_text(
            candidate_name=request.candidateName,
            skills=request.skills,
            university=request.university,
            linkedin=request.linkedin,
            job_title=request.jobTitle,
            company_name=request.companyName,
            job_description=request.jobDescription,
        )

        return CoverLetterResponse(coverLetter=cover_letter)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
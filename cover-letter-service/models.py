from pydantic import BaseModel
from typing import Optional


class CoverLetterRequest(BaseModel):
    candidate_name: str
    job_description: str
    resume_filename: Optional[str] = None
    resume_base64: str


class CoverLetterResponse(BaseModel):
    cover_letter: str
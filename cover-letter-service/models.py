from pydantic import BaseModel
from typing import List, Optional


class CoverLetterRequest(BaseModel):
    candidateName: str
    skills: List[str] = []
    university: Optional[str] = None
    linkedin: Optional[str] = None
    jobTitle: str
    companyName: str
    jobDescription: str


class CoverLetterResponse(BaseModel):
    coverLetter: str
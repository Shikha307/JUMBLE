import os
import io
import base64
import fitz
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text


def generate_cover_letter(candidate_name: str, resume_text: str, job_description: str) -> str:
    prompt = f"""
Write a professional cover letter based on the following information.

Candidate Name: {candidate_name}

Rules:
- Do NOT use placeholders such as [Your Name], [Company Name], or [Date].
- Use the candidate name provided above.
- If the exact company name is not known, address the letter to "Hiring Manager".
- Keep it professional and concise.
- Do not invent fake experience.
- Use only the provided resume and job description.
- Write in standard business English.
- Return only the final cover letter text.

Resume:
{resume_text}

Job Description:
{job_description}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content


def generate_full_cover_letter(candidate_name: str, job_description: str, resume_base64: str) -> str:
    pdf_bytes = base64.b64decode(resume_base64)
    resume_text = extract_text_from_pdf(pdf_bytes)
    print(resume_text[:500])
    return generate_cover_letter(candidate_name, resume_text, job_description)
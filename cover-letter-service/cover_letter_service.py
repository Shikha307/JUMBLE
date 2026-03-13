import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_cover_letter_text(
    candidate_name: str,
    skills: list[str],
    university: str | None,
    linkedin: str | None,
    job_title: str,
    company_name: str,
    job_description: str,
) -> str:
    skills_text = ", ".join(skills) if skills else "relevant technical and professional skills"
    university_text = university if university else "my academic background"
    linkedin_text = linkedin if linkedin else "N/A"

    prompt = f"""
You are a professional career assistant.

Write a tailored cover letter for a job application.

Rules:
- Keep it professional and concise.
- Use a realistic tone.
- Do not invent fake experience.
- Base the letter only on the information provided.
- Make the candidate sound genuinely interested in the role.
- Connect the candidate's skills and background to the job description.
- Write in standard business English.
- Return only the cover letter text.

Candidate information:
- Name: {candidate_name}
- Skills: {skills_text}
- University: {university_text}
- LinkedIn: {linkedin_text}

Job information:
- Job Title: {job_title}
- Company Name: {company_name}
- Job Description: {job_description}
"""

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    return response.output_text.strip()
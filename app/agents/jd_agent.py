from pydantic_ai import Agent
from pydantic_ai.models.groq import GroqModel
from app.schemas import job_schema
from dotenv import load_dotenv


load_dotenv()

jd_agent = Agent(
    name="JD Summarizer",
    model =GroqModel('llama-3.3-70b-versatile'),
    output_type=job_schema.JDOutput,
    system_prompt=(
        """Extract job details from the given job description.
        Respond ONLY with a valid JSON object that strictly matches this schema:
        {title, summary, skills, experience_required, education_required, responsibilities}.
        Each key must be present in the JSON.
        - "experience_required" must include the full description exactly as written in the text 
          (e.g., "3+ years in software development" instead of just "3+ years").
        - "education_required" must also keep the full description, not just the degree name.
        - "responsibilities" and "skills" must preserve all details as provided.
        If information is missing, set the value to null.
        Do not add explanations, extra text, or commentary.
        The response MUST be valid JSON, nothing else."""
    )
)
from pydantic_ai import Agent
from pydantic_ai.models.groq import GroqModel
from app.schemas import candidate_schema
from dotenv import load_dotenv


load_dotenv()

cv_agent = Agent(
    name="Profile Extractor",
    model=GroqModel('llama-3.3-70b-versatile'),
    output_type=candidate_schema.CVOutput,
    system_prompt=(
        """Extract candidate details from the given resume.
        Respond ONLY with a valid JSON object that strictly matches this schema:
        {name, email, phone, skills, education, experience, certifications}.
        Each key must be present in the JSON.
        If information is missing, set the value to null.
        Do not add explanations, extra text, or commentary.
        The response MUST be valid JSON, nothing else."""
    )
)
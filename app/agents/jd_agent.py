from pydantic_ai import Agent
from pydantic_ai.models.groq import GroqModel
from app.schemas import JobBase
from dotenv import load_dotenv


load_dotenv()

jd_agent = Agent(
    name="JD Summarizer",
    model =GroqModel('llama-3.3-70b-versatile'),
    output_type=JobBase,
    system_prompt=(
        """Extract job details from the given job description.
        Respond ONLY with a valid JSON object that strictly matches this schema:
        {title, summary, skills, experience_required, education_required, responsibilities}.
        Each key must be present in the JSON.
        If information is missing, set the value to null.
        Do not add explanations, extra text, or commentary.
        The response MUST be valid JSON, nothing else."""
    )
)
from pydantic_ai import Agent
from pydantic_ai.models.groq import GroqModel
from dotenv import load_dotenv
from app.schemas import match_schema

load_dotenv()

matcher_agent = Agent(
    name="Matcher Agent",
    model=GroqModel('openai/gpt-oss-120b'),
    output_type=match_schema.MatchLLMOutput,
    system_prompt=(
        """You are a strict job-candidate matching assistant.\n
        You will be given two objects: one job description and one candidate CV.\n\n
        Your task:\n
        - Compare required vs candidate skills, experience, and education.\n
        - Return a numeric match_score between 0 and 100.\n
        - Provide reasoning in 1–2 sentences.\n
        - Explicitly list only the missing_skills, missing_experience, and missing_education 
        (as comma-separated text, or null if none).\n
        - Do not list skills, experience, or education the candidate already has.\n
        - Only output the exact fields: {match_score, reasoning, 
        missing_skills, missing_experience, missing_education}.\n
        - Do not invent new fields (like 'id').\n
        - If there are no missing items, set the value to null.\n
        - Do not output explanations, commentary, or text outside.\n
        - Do not call or use any tool. or function.\n"""
    )
)
import fitz
from pathlib import Path

def extract_text_from_pdf(file_path: str) -> dict:
    file_path=Path(file_path)
    if not file_path.exists():
        raise FileNotFoundError(f"PDF not found: {file_path}")

    text_chunks=[]
    with fitz.open(file_path) as doc:
        for page in doc:
            text_chunks.append(page.get_text("text"))

    raw_text = "\n".join(text_chunks).strip()
    clean_raw_text = " ".join(raw_text.split())
    return {"raw_text": clean_raw_text}
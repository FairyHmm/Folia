from . import get_skills


def extract_skills(text: str) -> list[str]:
    known = get_skills()
    text_lower = text.lower()
    return [s for s in known if s.lower() in text_lower]

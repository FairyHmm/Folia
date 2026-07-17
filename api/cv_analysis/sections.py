import re
from . import get_section_keywords


def detect_sections(text: str) -> dict[str, list[str]]:
    keywords = get_section_keywords()
    sections = {name: [] for name in keywords}
    current = None

    for line in text.split("\n"):
        stripped = line.strip()
        if not stripped:
            continue

        matched = False
        for section, kws in keywords.items():
            if any(kw in stripped.lower() for kw in kws):
                if len(stripped) < 60:
                    current = section
                    matched = True
                    break

        if not matched and current:
            sections[current].append(stripped)

    return sections

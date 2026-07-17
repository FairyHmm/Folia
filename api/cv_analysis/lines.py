import re


def generate_lines(
    text: str, skills: list[str], target_roles: list[str]
) -> list[str]:
    lines = []
    for raw in text.split("\n"):
        line = raw.strip()
        if not line or len(line) < 10:
            continue

        tagged = line
        for skill in skills:
            tagged = re.sub(
                re.escape(skill), f"[[{skill}]]", tagged, flags=re.I
            )
        for role in target_roles:
            if role.lower() in tagged.lower():
                tagged = re.sub(
                    re.escape(role), f"<<{role}>>", tagged, flags=re.I
                )

        lines.append(tagged)

    return lines[:20]

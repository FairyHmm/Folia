from . import get_role_skill_relevance


def get_relevance(skill: str, target_roles: list[str]) -> dict[str, str]:
    data = get_role_skill_relevance()
    result = {}

    for role in target_roles:
        role_map = data.get("relevance", {}).get(role, {})
        skill_lower = skill.lower()
        found = False
        for level, skills in role_map.items():
            if any(s.lower() == skill_lower for s in skills):
                result[role] = level
                found = True
                break
        if not found:
            result[role] = "MODERATE"

    return result

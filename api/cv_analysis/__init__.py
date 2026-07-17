import json
from pathlib import Path

CONFIG_DIR = Path(__file__).parent.parent / "config"


def _load(name: str) -> dict:
    with open(CONFIG_DIR / name, "r", encoding="utf-8") as f:
        return json.load(f)


def get_skills() -> list[str]:
    return _load("skills.json")["skills"]


def get_section_keywords() -> dict[str, list[str]]:
    return _load("section_keywords.json")["sections"]


def get_proficiency_rules() -> dict:
    return _load("proficiency_rules.json")


def get_role_skill_relevance() -> dict:
    return _load("role_skill_relevance.json")


def get_target_roles() -> list[str]:
    return _load("target_roles.json")["roles"]

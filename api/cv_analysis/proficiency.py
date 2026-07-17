import re
from . import get_proficiency_rules


def classify_proficiency(text: str) -> str:
    rules = get_proficiency_rules()
    lower = text.lower()

    for rule in rules["rules"]:
        if any(kw in lower for kw in rule["keywords"]):
            return rule["level"]

    year_re = re.compile(rules["years_regex"], re.I)
    match = year_re.search(lower)
    if match:
        years = int(match.group(1))
        if years >= rules["years_expert_min"]:
            return "EXPERT"
        if years >= rules["years_experienced_min"]:
            return "EXPERIENCED"

    return rules["default_level"]

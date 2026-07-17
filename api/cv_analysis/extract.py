from . import get_target_roles
from .lines import generate_lines
from .proficiency import classify_proficiency
from .relevance import get_relevance
from .sections import detect_sections
from .skills import extract_skills


# ---------------------------------------------------------------------------
# ENTRY POINT for the backend pipeline
# `extract(text)` is the one seam api/process.py calls. Swap this function's
# body for a call into the pipeline, or import the modules
# above and replace pieces of the body below — either works, nothing
# outside this file needs to change (api/process.py, the frontend fetch in
# useCVAnalyser.js, and the response shape all stay as-is).
#
# Required return contract (must match, see shared/data/dummyDataAI.json):
#   {
#     "targetRoles": [str, ...],
#     "skills": {
#       "<skill name>": {
#         "proficiency": "BASIC" | "EXPERIENCED" | "EXPERT",
#         "relevance": { "<role name>": "LOW" | "MODERATE" | "HIGH" | "CRITICAL", ... }
#       }, ...
#     },
#     "lines": [str, ...],   # tagged with <<role>>, {{domain}}, [[skill]]
#     "artifacts": [...]     # currently always empty, reserved for later
#   }
#
# The current body below is the placeholder implementation — it works
# but is intentionally simple (whole-CV proficiency, no domain tagging).
# It's here so the graph has something real to render before the
# pipeline is wired in, not as the final version.
# ---------------------------------------------------------------------------
def extract(text: str) -> dict:
    target_roles = get_target_roles()
    sections = detect_sections(text)
    skills_list = extract_skills(text)

    skills_obj = {}
    for skill in skills_list:
        skills_obj[skill] = {
            "proficiency": classify_proficiency(text),
            "relevance": get_relevance(skill, target_roles),
        }

    lines = generate_lines(text, skills_list, target_roles)

    return {
        "targetRoles": target_roles,
        "skills": skills_obj,
        "lines": lines,
        "artifacts": [],
    }

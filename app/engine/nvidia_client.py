import json
import logging
import os
import re as _re
from openai import OpenAI
from flask import session

logger = logging.getLogger('yojanamitra')

_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

def _get_client():
    key = os.environ.get('NVIDIA_API_KEY', '')
    if not key:
        logger.warning("NVIDIA_API_KEY is not set — NVIDIA Mistral engine will not work")
        return None
    return OpenAI(base_url=_NVIDIA_BASE_URL, api_key=key)

def _check_configured():
    if not os.environ.get('NVIDIA_API_KEY', ''):
        logger.warning("NVIDIA_API_KEY not configured — skipping NVIDIA call")
        return False
    return True

# REPLICATED SYSTEM PROMPT FROM contextual_resolver.py
RESOLVER_SYSTEM_PROMPT = """You are a Contextual Eligibility Engine for Indian Government Schemes.
You evaluate 'POSSIBLY ELIGIBLE' schemes that contain edge-case requirements (like 'child 0-6' or 'pregnant woman').

INPUT:
1. Complete User Database Profile (JSON) - contains exact values like age, gender, is_pregnant, achievement_certificates, etc.
2. A dictionary of Scheme IDs mapping to their 'custom_verification_reason' (the string question asked by a naive engine).

YOUR TASK:
For EVERY scheme ID in the input list, cross-reference the `custom_verification_reason` with the User Profile.
Does the user profile explicitly make them INELIGIBLE? (e.g. they are Male, but reason is about pregnancy) -> INELIGIBLE.
Does the user profile already explicitly SATISFY the reason? (e.g. reason is "Are you a sports person?" and they have sports certificates) -> ELIGIBLE.
Is it TRULY UNKNOWN? (e.g. reason is "Do you own a tractor?" and the profile says nothing about tractors) -> POSSIBLY_ELIGIBLE.

CRITICAL LOGIC:
- If a scheme reason requires "child 0-6 OR pregnant woman" and the user is Male AND Age 21, they fail BOTH conditions. Mark INELIGIBLE.
- Be highly strict against logical impossibilities based on age, gender, occupation, caste.

OUTPUT EXACT JSON ONLY:
{
  "scheme_id_1": {
    "status": "INELIGIBLE" | "ELIGIBLE" | "POSSIBLY_ELIGIBLE",
    "reason_for_status": "Brief explanation",
    "refined_question": null or "The new, tailored question to ask the user if POSSIBLY_ELIGIBLE"
  }
}
"""

def resolve_batch_nvidia(user_profile, possibly_list):
    """
    NVIDIA MIRROR of resolve_possibly_eligible_batch.
    Uses Mistral-Nemotron to resolve eligibility logic.
    """
    if not possibly_list:
        return [], [], []
        
    clean_profile = {k: v for k, v in user_profile.items() if v is not None and v != '' and k not in ['password_hash', 'id']}
    
    # Pack the list
    schemes_to_eval = {}
    for p in possibly_list:
        reason = p.get('question_text', '')
        if isinstance(p.get('unknown_fields'), list) and len(p['unknown_fields']) > 0:
            for field in p['unknown_fields']:
                if '?' in field:
                    reason += ' | ' + field
        schemes_to_eval[str(p['scheme_id'])] = reason

    payload = {
        "user_profile": clean_profile,
        "schemes_to_evaluate": schemes_to_eval
    }

    try:
        c = _get_client()
        if not c:
            return possibly_list, [], []
        completion = c.chat.completions.create(
            model="mistralai/mistral-nemotron",
            messages=[
                {"role": "system", "content": RESOLVER_SYSTEM_PROMPT},
                {"role": "user", "content": json.dumps(payload, indent=2)}
            ],
            temperature=0.1,
            max_tokens=2048,
            stream=False
        )
        
        res_text = completion.choices[0].message.content.strip()
        # Clean potential markdown fences
        if res_text.startswith('```json'):
            res_text = res_text[7:-3]
        elif res_text.startswith('```'):
            res_text = res_text[3:-3]
            
        resolutions = json.loads(res_text.strip())
        
        new_eligible = []
        new_possibly = []
        new_ineligible = []
        
        for p in possibly_list:
            sid = str(p['scheme_id'])
            res = resolutions.get(sid)
            if not res:
                new_eligible.append(p)
                continue
                
            status = res.get('status', 'ELIGIBLE')
            reason = res.get('reason_for_status', 'Verified by NVIDIA Mistral Engine')
            
            if status == 'INELIGIBLE':
                p['status'] = 'INELIGIBLE'
                p['reason'] = reason
                new_ineligible.append(p)
            elif status == 'POSSIBLY_ELIGIBLE' or status == 'POSSIBLE':
                if res.get('refined_question'):
                    p['question_text'] = "NVIDIA Insight: " + res['refined_question']
                p['reason'] = reason
                new_possibly.append(p)
            else:
                new_eligible.append(p)
                
        return new_eligible, new_possibly, new_ineligible
        
    except Exception as e:
        logger.error(f"NVIDIA Resolver Error: {str(e)}")
        # FALLSAFE: Pass-through as eligible
        return possibly_list, [], []

# ── QUESTION GENERATION MIRROR ──────────────────────────────────────────────

def generate_concepts_nvidia(fields, batch_size=30):
    """
    NVIDIA MIRROR of gemini_client.generate_concepts.
    Uses Mistral-Nemotron to generate user-friendly questions for missing fields.
    """
    if not fields:
        return []
        
    fields = fields[:batch_size]
    field_list = "\n".join([f"- {f}" for f in fields])
    
    # REPLICATED PROMPT FROM gemini_client.py
    prompt = f"""Input fields:
{field_list}

You are designing a user-facing eligibility question system.
Your task: For EACH field, generate a clean concept name and a natural, human-friendly question.

RULES:
- CONCEPT: Must be generalizable (not scheme-specific), 1–3 words max, snake_case.
- QUESTION: Simple, spoken English, understandable, prefer yes/no, must NOT repeat field name.

OUTPUT FORMAT (STRICT JSON ONLY):
[
  {{"field": "has_aadhaar_card", "concept": "aadhaar", "question": "Do you have an Aadhaar card?"}}
]
"""
    try:
        c = _get_client()
        if not c:
            return []
        completion = c.chat.completions.create(
            model="mistralai/mistral-nemotron",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=2048,
            stream=False
        )
        res_text = completion.choices[0].message.content.strip()
        if res_text.startswith('```json'):
            res_text = res_text[7:-3]
        elif res_text.startswith('```'):
            res_text = res_text[3:-3]
            
        data = json.loads(res_text.strip())
        valid = []
        for item in data:
            if isinstance(item, dict) and "field" in item and "concept" in item and "question" in item:
                valid.append({
                    "field": str(item["field"]).strip(),
                    "concept": str(item["concept"]).strip().lower(),
                    "question": str(item["question"]).strip()
                })
        return valid
    except Exception as e:
        logger.error(f"NVIDIA Concept Generation Error: {str(e)}")
        return []

# ── CONDITION EXTRACTION MIRROR ──────────────────────────────────────────────

def extract_criteria_nvidia(raw_text):
    """
    NVIDIA MIRROR of extractor.py's GeminiExtractor.
    Uses Mistral-Nemotron to extract structured eligibility criteria from raw text.
    """
    if not raw_text:
        return [], "mistral-nemotron", "No text", True
        
    # REPLICATED PROMPT FROM extractor.py
    prompt = f"""Extract ALL eligibility conditions from the scheme text below as a JSON array.

FIELD WHITELIST: age, gender, category, occupation, religion, marital_status, annual_income, state, is_student, is_farmer, is_disabled, etc.
VALID OPERATORS: gte, lte, eq, in, boolean

OUTPUT: JSON array only. 
Example: [{{"field": "age", "operator": "gte", "value": 18, "condition_type": "hard", "confidence": 0.9}}]

TEXT:
{raw_text}
"""
    try:
        c = _get_client()
        if not c:
            return [], "mistral-nemotron", "NVIDIA_API_KEY not set", True
        completion = c.chat.completions.create(
            model="mistralai/mistral-nemotron",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=4096,
            stream=False
        )
        res_text = completion.choices[0].message.content.strip()
        if res_text.startswith('```json'):
            res_text = res_text[7:-3]
        elif res_text.startswith('```'):
            res_text = res_text[3:-3]
            
        combined = json.loads(res_text.strip())
        # The original code has a lot of post-processing. 
        # For the "dual engine" we return the AI's direct result but formatted for the pipeline.
        return combined, "v3_nemotron", None, (len(combined) < 2)
    except Exception as e:
        logger.error(f"NVIDIA Extraction Error: {str(e)}")
        return [], "v3_nemotron", str(e), True

def analyze_readiness_nvidia(scheme, user_data, doc_types, clarification_text):
    """
    NVIDIA MIRROR of analyze_scheme_readiness_ai.
    Performs a deep cross-analysis of scheme criteria against user profile and docs.
    """
    prompt = f"""
    You are an expert government scheme auditor and eligibility evaluator.
    Perform a strict cross-analysis between the Scheme Requirements and the Applicant's Profile/Documents.
    
    SCHEME DETAILS:
    - Name: {scheme.name}
    - Eligibility: {scheme.eligibility}
    - Criteria Details: {scheme.criteria if hasattr(scheme, 'criteria') else scheme.description}
    - Required Docs: {scheme.documents_required}
    
    APPLICANT PROFILE:
    {json.dumps(user_data, indent=2)}
    
    APPLICANT VERIFIED DOCUMENTS IN VAULT:
    {', '.join(doc_types) if doc_types else 'None'}
    {clarification_text}
    
    TASK:
    Generate a JSON response containing an overall 'score' (0-100) and an 'items' array.
    
    CRITICAL CLASSIFICATION RULES:
    1. type: "success" -> Definitive match.
    2. type: "error" -> Definitive failure.
    3. type: "warning" -> FACTUAL UNCERTAINTY. AI doesn't know if the user meets a rule. These generate QUESTIONS.
    4. type: "info" -> PROCEDURAL REQUIREMENT. Instructions or documents to bring.
    
    OUTPUT JSON FORMAT (STRICT):
    {{
       "score": 85,
       "items": [
          {{
            "title": "age",
            "text": "Applicant is 25, which meets the 18-45 requirement.",
            "type": "success",
            "icon": "fa-circle-check"
          }}
       ]
    }}
    """
    try:
        c = _get_client()
        if not c:
            raise RuntimeError("NVIDIA_API_KEY not configured")
        completion = c.chat.completions.create(
            model="mistralai/mistral-nemotron",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=4096,
            stream=False
        )
        res_text = completion.choices[0].message.content.strip()
        json_match = re.search(r'\{.*\}', res_text, re.DOTALL)
        if json_match:
            res_text = json_match.group()
            
        return json.loads(res_text.strip())
    except Exception as e:
        logger.error(f"NVIDIA Readiness Analysis Error: {str(e)}")
        raise e

import re

def chat_nvidia(user_message, context=""):
    """
    NVIDIA MIRROR of chatbot logic.
    """
    system_prompt = "You are the YojanaMitra AI assistant. Provide concise, helpful information about Indian government schemes, eligibility criteria, and application guidance. Use the provided user context to tailor your responses."
    
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    if context:
        messages.append({"role": "system", "content": f"User Context:\n{context}"})
    
    messages.append({"role": "user", "content": user_message})
    
    try:
        c = _get_client()
        if not c:
            logger.warning("NVIDIA chat skipped: NVIDIA_API_KEY not set")
            return None
        completion = c.chat.completions.create(
            model="mistralai/mistral-nemotron",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            stream=False
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"NVIDIA Chat Error: {e}")
        return None

def contextual_ai_nvidia(prompt):
    """
    NVIDIA MIRROR of Contextual AI assistant logic.
    """
    try:
        c = _get_client()
        if not c:
            return None
        completion = c.chat.completions.create(
            model="mistralai/mistral-nemotron",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1024,
            stream=False
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"NVIDIA Contextual AI Error: {e}")
        return None

GENERATE_FAILSAFE = (
    "\n\nCRITICAL: Each database field must get its own question. "
    "Never consolidate multiple fields into one question."
)

def generate_resolve_questions_nvidia(prompt):
    """
    NVIDIA MIRROR of high-context Phase 3 question generation.
    Handles the full complex prompt with profile and scheme context.
    """
    try:
        modified = prompt + GENERATE_FAILSAFE
        c = _get_client()
        if not c:
            return None
        completion = c.chat.completions.create(
            model="mistralai/mistral-nemotron",
            messages=[{"role": "user", "content": modified}],
            temperature=0.1,
            max_tokens=8192,
            stream=False
        )
        res_text = completion.choices[0].message.content.strip()
        json_match = _re.search(r'\[.*\]', res_text, _re.DOTALL)
        if json_match:
            res_text = json_match.group()
        return json.loads(res_text.strip())
    except Exception as e:
        logger.error(f"NVIDIA Resolve Questions Error: {e}")
        return None

DISTILL_FAILSAFE = (
    "\n\n---\n"
    "CRITICAL FINAL RULE: You MUST output one question per distinct database field. "
    "Never merge questions about different fields. "
    "Only merge if two entries ask about the IDENTICAL field. "
    "This rule takes precedence over all earlier instructions."
)

def distill_questions_nvidia(prompt):
    """
    NVIDIA MIRROR of Phase 3 question distillation.
    Neutralizes the over-consolidation instructions for literal-following models
    by replacing 'MERGING' semantics with 'DEDUPLICATION' semantics.
    """
    try:
        import re as _re
        # Surgical prompt modifications using regex to handle any dash variant
        modified = _re.sub(
            r'STEP 2\s*[–—−-]\s*CONSOLIDATION:',
            'STEP 2 — DEDUPLICATION:',
            prompt
        )
        modified = _re.sub(
            r'1\.\s*MERGING:.*?clear question\.',
            '1. DEDUPLICATE: Remove exact duplicates only. Keep every distinct field as a separate question.',
            modified
        )
        modified = _re.sub(
            r'Reduce surviving items to the absolute minimum set[^.]*\.',
            'Remove only exact duplicate questions, never combine different fields.',
            modified
        )
        # Append failsafe in case replacements missed anything
        modified += DISTILL_FAILSAFE
        c = _get_client()
        if not c:
            return None
        completion = c.chat.completions.create(
            model="mistralai/mistral-nemotron",
            messages=[{"role": "user", "content": modified}],
            temperature=0.1,
            max_tokens=8192,
            stream=False
        )
        res_text = completion.choices[0].message.content.strip()
        # Extract JSON array
        json_match = _re.search(r'\[.*\]', res_text, _re.DOTALL)
        if json_match:
            res_text = json_match.group()
            
        return json.loads(res_text.strip())
    except Exception as e:
        logger.error(f"NVIDIA Question Distillation Error: {e}")
        return None

def translate_nvidia(prompt):
    """
    NVIDIA MIRROR of text translation.
    """
    try:
        c = _get_client()
        if not c:
            return None
        completion = c.chat.completions.create(
            model="mistralai/mistral-nemotron",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=2048,
            stream=False
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"NVIDIA Translation Error: {e}")
        return None

def batch_evaluate_nvidia(prompt):
    """
    NVIDIA MIRROR of batch eligibility evaluation.
    """
    try:
        c = _get_client()
        if not c:
            return None
        completion = c.chat.completions.create(
            model="mistralai/mistral-nemotron",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=4096,
            stream=False
        )
        res_text = completion.choices[0].message.content.strip()
        # Extract JSON array
        import re
        json_match = re.search(r'\[.*\]', res_text, re.DOTALL)
        if json_match:
            res_text = json_match.group()
            
        return json.loads(res_text.strip())
    except Exception as e:
        logger.error(f"NVIDIA Batch Evaluation Error: {e}")
        return None

def call_ai_nvidia(prompt):
    """
    NVIDIA Generic prompt call.
    """
    try:
        c = _get_client()
        if not c:
            return None
        completion = c.chat.completions.create(
            model="mistralai/mistral-nemotron",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=2048,
            stream=False
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"NVIDIA Generic Call Error: {e}")
        return None

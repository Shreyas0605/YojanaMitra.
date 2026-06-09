import logging
from flask import session
import contextual_resolver # Original Gemini logic
from app.engine import nvidia_client # New NVIDIA logic

logger = logging.getLogger('yojanamitra')

def resolve_possibly_eligible(user_profile, possibly_list):
    """
    Routes Phase 5 Deductive Resolution to the selected AI provider.
    """
    provider = session.get('ai_provider', 'gemini')
    
    if provider == 'nvidia':
        logger.info("Routing Phase 5 Resolution to NVIDIA Mistral Engine")
        return nvidia_client.resolve_batch_nvidia(user_profile, possibly_list)
    else:
        logger.info("Routing Phase 5 Resolution to Gemini Engine")
        return contextual_resolver.resolve_possibly_eligible_batch(user_profile, possibly_list)

def generate_concepts(fields, batch_size=30):
    """
    Routes Phase 3 Question Generation to the selected AI provider.
    """
    provider = session.get('ai_provider', 'gemini')
    
    if provider == 'nvidia':
        logger.info("Routing Phase 3 Question Generation to NVIDIA")
        return nvidia_client.generate_concepts_nvidia(fields, batch_size)
    else:
        logger.info("Routing Phase 3 Question Generation to Gemini")
        import app.engine.gemini_client as gemini_client
        return gemini_client.generate_concepts(fields, batch_size)

def extract_criteria(raw_text):
    """
    Routes Pipeline Extraction to the selected AI provider.
    """
    provider = session.get('ai_provider', 'gemini')
    
    if provider == 'nvidia':
        logger.info("Routing Criteria Extraction to NVIDIA")
        return nvidia_client.extract_criteria_nvidia(raw_text)
    else:
        logger.info("Routing Criteria Extraction to Gemini")
        # NOTE: Extractor is typically used in the background pipeline. 
        # We might need a separate way to handle global provider if running outside request context.
        from app.pipeline.extractor import GeminiExtractor
        import os
        ext = GeminiExtractor(os.environ.get("GEMINI_API_KEY"))
        return ext.extract(raw_text)

def get_current_provider_label():
    """
    Returns a human-readable label for the UI toggle.
    """
    provider = session.get('ai_provider', 'gemini')
    return "NVIDIA (Mistral)" if provider == 'nvidia' else "Google (Gemini)"

def analyze_readiness(scheme, user_data, doc_types, clarification_text):
    """
    Routes Scheme Readiness Analysis to the selected AI provider.
    """
    provider = session.get('ai_provider', 'gemini')
    
    if provider == 'nvidia':
        logger.info("Routing Readiness Analysis to NVIDIA Mistral Engine")
        return nvidia_client.analyze_readiness_nvidia(scheme, user_data, doc_types, clarification_text)
    else:
        logger.info("Routing Readiness Analysis to Gemini Engine")
        # Returning None tells the caller to use their default Gemini logic
        return None

def chat(user_message, context=""):
    """
    Routes Chatbot queries to the selected AI provider.
    """
    provider = session.get('ai_provider', 'gemini')
    
    if provider == 'nvidia':
        logger.info("Routing Chat to NVIDIA Mistral Engine")
        return nvidia_client.chat_nvidia(user_message, context)
    else:
        logger.info("Routing Chat to Gemini Engine")
        # Returning None tells the caller to use their default Gemini logic
        return None

def contextual_ai(prompt):
    """
    Routes Contextual AI assistant queries.
    """
    provider = session.get('ai_provider', 'gemini')
    
    if provider == 'nvidia':
        logger.info("Routing Contextual AI to NVIDIA Mistral Engine")
        return nvidia_client.contextual_ai_nvidia(prompt)
    else:
        logger.info("Routing Contextual AI to Gemini Engine")
        return None

def generate_resolve_questions(prompt):
    """
    Routes high-context Phase 3 question generation to the selected AI provider.
    """
    provider = session.get('ai_provider', 'gemini')
    
    if provider == 'nvidia':
        logger.info("Routing Phase 3 Question Generation (Context-Aware) to NVIDIA")
        return nvidia_client.generate_resolve_questions_nvidia(prompt)
    else:
        logger.info("Routing Phase 3 Question Generation (Context-Aware) to Gemini Engine")
        return None

def distill_questions(prompt):
    """
    Routes question distillation to the selected AI provider.
    """
    provider = session.get('ai_provider', 'gemini')
    
    if provider == 'nvidia':
        logger.info("Routing Question Distillation to NVIDIA Mistral Engine")
        return nvidia_client.distill_questions_nvidia(prompt)
    else:
        logger.info("Routing Question Distillation to Gemini Engine")
        return None

def translate(prompt):
    """
    Routes translation to the selected AI provider.
    """
    provider = session.get('ai_provider', 'gemini')
    
    if provider == 'nvidia':
        logger.info("Routing Translation to NVIDIA Mistral Engine")
        return nvidia_client.translate_nvidia(prompt)
    else:
        logger.info("Routing Translation to Gemini Engine")
        return None

def batch_evaluate(prompt):
    """
    Routes batch eligibility evaluation to the selected AI provider.
    """
    provider = session.get('ai_provider', 'gemini')
    
    if provider == 'nvidia':
        logger.info("Routing Batch Evaluation to NVIDIA Mistral Engine")
        return nvidia_client.batch_evaluate_nvidia(prompt)
    else:
        logger.info("Routing Batch Evaluation to Gemini Engine")
        return None

def call_ai(prompt):
    """
    Routes generic AI calls.
    """
    provider = session.get('ai_provider', 'gemini')
    
    if provider == 'nvidia':
        logger.info("Routing Generic AI Call to NVIDIA Mistral Engine")
        return nvidia_client.call_ai_nvidia(prompt)
    else:
        logger.info("Routing Generic AI Call to Gemini Engine")
        return None

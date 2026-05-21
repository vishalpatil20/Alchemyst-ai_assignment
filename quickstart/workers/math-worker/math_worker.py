import os
import random
from iii import register_worker, InitOptions, Logger

iii = register_worker(
    os.environ.get("III_URL", "ws://localhost:49134"),
    InitOptions(worker_name="math-worker"),
)
logger = Logger()

# Satirical corporate buzzwords
BUZZWORDS = {
    "ai": "agentic AI-native core",
    "blockchain": "decentralized ledger security layer",
    "web3": "metaverse-ready tokenized ecosystem",
    "quantum": "quantum-leap computing paradigm",
    "agentic": "autonomous multi-agent synergy framework",
    "synergy": "cross-departmental paradigm shifts",
    "disruptive": "hyper-disruptive cloud-native technology",
    "scale": "limitless elastic horizontal scale",
    "serverless": "zero-cost instant cold-start engine",
    "saas": "hyper-scalable subscription monetization loops"
}

def generate_vc_pitch(user_idea: str, words: list) -> str:
    templates = [
        "By integrating a {buzz}, we will pivot {idea} into a hyper-scalable, paradigm-shifting powerhouse.",
        "Our mission is to revolutionize {idea} by layering in a {buzz} that monetizes user attention cycles.",
        "We are leveraging a {buzz} to systematically disrupt the traditional {idea} landscape at infinite scale.",
        "By combining a {buzz} with next-gen workflows, we empower enterprises to fully automate {idea} without human intervention."
    ]
    buzz_phrases = [BUZZWORDS.get(w.lower(), w) for w in words if w.lower() in BUZZWORDS]
    if not buzz_phrases:
        buzz_phrases = ["synergistic cloud workflows"]
    
    selected_buzz = " and ".join(buzz_phrases[:2])
    return random.choice(templates).format(idea=user_idea, buzz=selected_buzz)

def evaluate_startup_pitch(payload: dict) -> dict:
    idea = payload.get("idea", "a generic business idea")
    buzzwords = payload.get("buzzwords", [])
    
    logger.info(f"Evaluating pitch for idea: '{idea}' with buzzwords: {buzzwords}")
    
    # Satirical valuation calculation
    base_valuation = 10_000_000  # Start at $10M base
    multiplier = 1.0
    detected_buzzwords = []
    
    for word in buzzwords:
        w_lower = word.lower()
        if w_lower in BUZZWORDS:
            detected_buzzwords.append(word)
            base_valuation += 5_000_000  # Add $5M per buzzword
            multiplier *= 1.5           # Multiply valuation by 1.5x
            
    final_valuation = int(base_valuation * multiplier)
    pitch = generate_vc_pitch(idea, detected_buzzwords)
    
    # Interact with persistent central State Store
    running_capital_burned = iii.trigger(
        {
            "function_id": "state::get",
            "payload": {"scope": "vc_tracker", "key": "total_capital_burned"},
        }
    )
    
    # Accumulate global VC capital burned
    current_total = running_capital_burned or 0
    new_total = current_total + final_valuation
    
    iii.trigger(
        {
            "function_id": "state::set",
            "payload": {"scope": "vc_tracker", "key": "total_capital_burned", "value": new_total},
        }
    )
    
    return {
        "idea": idea,
        "buzzwords_detected": detected_buzzwords,
        "satirical_pitch": pitch,
        "estimated_valuation_usd": final_valuation,
        "global_vc_capital_burned_usd": new_total,
        "success": "VC funding round successfully closed! The board approves of your paradigm shift."
    }

iii.register_function("math::add", evaluate_startup_pitch)

print("Satirical VC Evaluation worker started - listening for pitches!")

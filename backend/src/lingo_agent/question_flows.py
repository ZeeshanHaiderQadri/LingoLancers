"""
Question Flow Engine for Conversational Workflows
"""

from typing import Optional, Dict, Any, List
from .conversation_state import ConversationState


# Blog workflow questions
BLOG_QUESTIONS = {
    "keywords": {
        "question": "What SEO keywords would you like to target? (Or type 'skip' to use defaults)",
        "optional": True,
        "default": [],
        "extract_hint": "comma-separated keywords"
    },
    "tone": {
        "question": "What tone would you prefer?\n• Professional\n• Casual\n• Technical\n• Friendly",
        "optional": True,
        "default": "professional",
        "options": ["professional", "casual", "technical", "friendly"]
    },
    "length": {
        "question": "How long should the article be?\n• Short (800 words)\n• Medium (1,500 words)\n• Long (2,500 words)",
        "optional": True,
        "default": 1500,
        "type": "number"
    }
}

# Travel workflow questions
TRAVEL_QUESTIONS = {
    "when": {
        "question": "When would you like to travel?",
        "optional": True,
        "default": "flexible"
    },
    "duration": {
        "question": "How many days are you planning to stay?",
        "optional": True,
        "default": 7,
        "type": "number"
    },
    "travelers": {
        "question": "How many travelers? (e.g., '2 adults' or '4 family members')",
        "optional": True,
        "default": 1
    },
    "budget": {
        "question": "What's your budget preference?\n• Economy\n• Comfort\n• Luxury",
        "optional": True,
        "default": "comfort",
        "options": ["economy", "comfort", "luxury"]
    }
}


def get_next_question(state: ConversationState) -> Optional[str]:
    """Get the next question to ask based on conversation state"""
    
    if state.intent == "blog":
        questions = BLOG_QUESTIONS
    elif state.intent == "travel":
        questions = TRAVEL_QUESTIONS
    else:
        return None
    
    # Find first unanswered question
    for key, config in questions.items():
        if key not in state.collected_data and key not in state.questions_asked:
            state.questions_asked.append(key)
            state.current_question = key
            return config["question"]
    
    return None  # All questions answered


def extract_answer(question_key: str, user_response: str, state: ConversationState) -> Any:
    """Extract and validate answer from user response"""
    
    response_lower = user_response.lower().strip()
    
    # Handle skip
    if response_lower in ["skip", "default", "no", "none"]:
        if state.intent == "blog":
            return BLOG_QUESTIONS[question_key]["default"]
        elif state.intent == "travel":
            return TRAVEL_QUESTIONS[question_key]["default"]
    
    # Extract based on question type
    if state.intent == "blog":
        config = BLOG_QUESTIONS.get(question_key, {})
    elif state.intent == "travel":
        config = TRAVEL_QUESTIONS.get(question_key, {})
    else:
        return user_response
    
    # Handle specific types
    if config.get("type") == "number":
        # Extract number from response
        import re
        numbers = re.findall(r'\d+', user_response)
        if numbers:
            return int(numbers[0])
        return config.get("default")
    
    elif "options" in config:
        # Match against options
        for option in config["options"]:
            if option.lower() in response_lower:
                return option
        return config.get("default")
    
    elif question_key == "keywords":
        # Parse comma-separated keywords
        keywords = [k.strip() for k in user_response.split(",")]
        return [k for k in keywords if k]
    
    else:
        # Return as-is
        return user_response


def should_ask_more_questions(state: ConversationState) -> bool:
    """Determine if we should ask more questions or start workflow"""
    
    # If we have minimum required info, we can start
    if state.is_complete():
        # Check if there are optional questions left
        missing = state.get_missing_fields()
        
        # Ask up to 2 optional questions, then start
        questions_asked_count = len(state.questions_asked)
        
        if questions_asked_count < 2 and missing:
            return True  # Ask one more optional question
        else:
            return False  # Start workflow
    
    return True  # Keep collecting required info


def generate_confirmation_message(state: ConversationState) -> str:
    """Generate confirmation message before starting workflow"""
    
    if state.intent == "blog":
        msg = "Perfect! I have everything I need:\n"
        msg += f"✓ Topic: {state.collected_data.get('topic', 'N/A')}\n"
        
        if "keywords" in state.collected_data:
            keywords = state.collected_data["keywords"]
            if keywords:
                msg += f"✓ Keywords: {', '.join(keywords)}\n"
        
        if "tone" in state.collected_data:
            msg += f"✓ Tone: {state.collected_data['tone'].title()}\n"
        
        if "length" in state.collected_data:
            msg += f"✓ Length: {state.collected_data['length']} words\n"
        
        msg += "\n🚀 Starting your blog workflow now! You can track progress on your Dashboard."
        msg += "\n\n💡 Want more control? Click the Blog Writing Team card below."
    
    elif state.intent == "travel":
        msg = "Excellent! I have all the details:\n"
        
        if "from" in state.collected_data:
            msg += f"✓ From: {state.collected_data['from'].title()}\n"
        
        if "to" in state.collected_data:
            msg += f"✓ To: {state.collected_data['to'].title()}\n"
        
        if "duration" in state.collected_data:
            msg += f"✓ Duration: {state.collected_data['duration']} days\n"
        
        if "travelers" in state.collected_data:
            msg += f"✓ Travelers: {state.collected_data['travelers']}\n"
        
        if "budget" in state.collected_data:
            msg += f"✓ Budget: {state.collected_data['budget'].title()}\n"
        
        msg += "\n🚀 Starting your travel planning workflow!\n"
        msg += "\nI'll find:\n• Best flights\n• Recommended hotels\n• Popular attractions\n• Local restaurants"
        msg += "\n\n💡 Click the Travel Planning Team card below to see options!"
    
    else:
        msg = "Starting your workflow now!"
    
    return msg

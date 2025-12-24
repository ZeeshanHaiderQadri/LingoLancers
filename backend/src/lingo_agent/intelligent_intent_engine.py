"""
Intelligent Intent Recognition Engine
Uses Azure OpenAI GPT-4o for accurate intent classification with confidence scoring
Prevents wrong navigation and ensures user gets exactly what they asked for
"""

from typing import Dict, Any, Optional, List, Tuple
import logging
import os
import json
from openai import AzureOpenAI

logger = logging.getLogger(__name__)

class IntentConfidence:
    """Intent confidence levels"""
    HIGH = 0.85  # Very confident - proceed automatically
    MEDIUM = 0.60  # Somewhat confident - ask for confirmation
    LOW = 0.40  # Not confident - ask clarifying questions
    NONE = 0.0  # No clear intent - general conversation

class IntelligentIntentEngine:
    """
    Advanced intent recognition using Azure OpenAI GPT-4o
    Ensures high accuracy and prevents wrong navigation
    """
    
    def __init__(self):
        # Initialize Azure OpenAI
        self.client = None
        self.model = "gpt-4o"  # Most intelligent model
        
        try:
            azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
            azure_key = os.getenv("AZURE_OPENAI_KEY") or os.getenv("AZURE_OPENAI_REALTIME_KEY")
            
            if azure_endpoint and azure_key:
                self.client = AzureOpenAI(
                    azure_endpoint=azure_endpoint,
                    api_key=azure_key,
                    api_version="2024-08-01-preview"
                )
                logger.info("✓ Intelligent Intent Engine initialized with Azure OpenAI GPT-4o")
            else:
                logger.warning("⚠️ Azure OpenAI not configured - using fallback intent recognition")
        except Exception as e:
            logger.error(f"❌ Error initializing Azure OpenAI: {e}")
    
    async def analyze_intent(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        current_context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Analyze user intent with high accuracy
        
        Returns:
        {
            "intent": "blog" | "travel" | "ai_image" | "navigation" | "question" | "unclear",
            "confidence": 0.0-1.0,
            "sub_intent": "nano_banana" | "logo" | "product_shot" | etc.,
            "extracted_data": {...},
            "requires_confirmation": bool,
            "clarifying_question": str | None,
            "reasoning": str
        }
        """
        
        if not self.client:
            # Fallback to simple keyword matching
            return self._fallback_intent_analysis(user_message)
        
        try:
            # Build context-aware prompt
            system_prompt = self._build_system_prompt()
            user_prompt = self._build_user_prompt(
                user_message,
                conversation_history,
                current_context
            )
            
            # Call Azure OpenAI GPT-4o
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,  # Low temperature for consistent results
                response_format={"type": "json_object"}
            )
            
            # Parse response
            result = json.loads(response.choices[0].message.content)
            
            logger.info(f"🧠 Intent Analysis: {result.get('intent')} (confidence: {result.get('confidence')})")
            logger.info(f"📝 Reasoning: {result.get('reasoning', 'N/A')}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error in intent analysis: {e}")
            return self._fallback_intent_analysis(user_message)
    
    def _build_system_prompt(self) -> str:
        """Build system prompt for intent recognition"""
        return """You are an intelligent intent recognition system for a multi-feature AI application.

Your job is to accurately determine what the user wants to do and provide a confidence score.

Available Features:
1. **Blog Writing** - Create blog articles, SEO content
2. **Travel Planning** - Plan trips, find flights, hotels
3. **AI Image Suite**:
   - Nano Banana: Image editing studio (create/edit images)
   - Remove Background: Remove/replace backgrounds
   - Product Shot: Professional product photography
   - Vision: Analyze and describe images
   - Combine: Merge/blend multiple images
   - Logo Generation: Create logos
   - Virtual Try-On: Try on clothes virtually
4. **Navigation** - Go to specific pages/dashboards
5. **Questions** - General questions about features
6. **Unclear** - Ambiguous or unclear requests

Analyze the user's message and return JSON with:
{
  "intent": "blog" | "travel" | "ai_image" | "navigation" | "question" | "unclear",
  "confidence": 0.0-1.0 (how confident you are),
  "sub_intent": "specific feature if ai_image",
  "extracted_data": {extracted parameters},
  "requires_confirmation": true/false (if confidence < 0.85),
  "clarifying_question": "question to ask if unclear",
  "reasoning": "brief explanation of your analysis"
}

IMPORTANT RULES:
1. Only return confidence > 0.85 if you're VERY sure
2. If ambiguous, set requires_confirmation: true
3. Don't guess - if unclear, ask for clarification
4. Consider conversation context
5. Extract all relevant data from the message

Examples:

User: "Create a sunset over mountains"
→ intent: "ai_image", sub_intent: "nano_banana", confidence: 0.95

User: "I want to write something"
→ intent: "unclear", confidence: 0.3, clarifying_question: "Would you like to write a blog article?"

User: "Remove the background"
→ intent: "ai_image", sub_intent: "remove_background", confidence: 0.98

User: "Plan a trip"
→ intent: "travel", confidence: 0.9

User: "Show me the dashboard"
→ intent: "navigation", confidence: 0.85

User: "What can you do?"
→ intent: "question", confidence: 0.95"""
    
    def _build_user_prompt(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        current_context: Dict[str, Any] = None
    ) -> str:
        """Build user prompt with context"""
        
        prompt = f"User message: \"{user_message}\"\n\n"
        
        # Add conversation history if available
        if conversation_history and len(conversation_history) > 0:
            prompt += "Recent conversation:\n"
            for msg in conversation_history[-3:]:  # Last 3 messages
                role = msg.get("role", "user")
                content = msg.get("content", "")
                prompt += f"{role}: {content}\n"
            prompt += "\n"
        
        # Add current context if available
        if current_context:
            prompt += "Current context:\n"
            if current_context.get("current_page"):
                prompt += f"- User is on: {current_context['current_page']}\n"
            if current_context.get("active_workflows"):
                prompt += f"- Active workflows: {len(current_context['active_workflows'])}\n"
            prompt += "\n"
        
        prompt += "Analyze this message and return your intent analysis as JSON."
        
        return prompt
    
    def _fallback_intent_analysis(self, user_message: str) -> Dict[str, Any]:
        """Fallback intent analysis using keyword matching"""
        
        message_lower = user_message.lower()
        
        # AI Image keywords
        ai_image_keywords = {
            "nano_banana": ["create", "generate", "make", "image", "picture", "photo", "edit"],
            "remove_background": ["remove background", "transparent", "cut out", "background removal"],
            "product_shot": ["product shot", "product photo", "professional photo"],
            "vision": ["analyze", "describe", "what is", "tell me about"],
            "combine": ["combine", "merge", "blend"],
            "logo": ["logo", "brand", "branding"],
            "virtual_tryon": ["try on", "virtual tryon", "outfit"]
        }
        
        # Check AI Image features
        for sub_intent, keywords in ai_image_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                return {
                    "intent": "ai_image",
                    "confidence": 0.7,
                    "sub_intent": sub_intent,
                    "extracted_data": {},
                    "requires_confirmation": True,
                    "clarifying_question": f"I think you want to use {sub_intent.replace('_', ' ')}. Is that correct?",
                    "reasoning": "Keyword-based fallback matching"
                }
        
        # Blog keywords
        if any(word in message_lower for word in ["blog", "article", "write", "content", "post"]):
            return {
                "intent": "blog",
                "confidence": 0.7,
                "sub_intent": None,
                "extracted_data": {},
                "requires_confirmation": True,
                "clarifying_question": "Would you like to write a blog article?",
                "reasoning": "Keyword-based fallback matching"
            }
        
        # Travel keywords
        if any(word in message_lower for word in ["travel", "trip", "flight", "hotel", "vacation"]):
            return {
                "intent": "travel",
                "confidence": 0.7,
                "sub_intent": None,
                "extracted_data": {},
                "requires_confirmation": True,
                "clarifying_question": "Would you like to plan a trip?",
                "reasoning": "Keyword-based fallback matching"
            }
        
        # Navigation keywords
        if any(word in message_lower for word in ["go to", "open", "show me", "navigate"]):
            return {
                "intent": "navigation",
                "confidence": 0.6,
                "sub_intent": None,
                "extracted_data": {},
                "requires_confirmation": True,
                "clarifying_question": "Where would you like to go?",
                "reasoning": "Keyword-based fallback matching"
            }
        
        # Unclear
        return {
            "intent": "unclear",
            "confidence": 0.2,
            "sub_intent": None,
            "extracted_data": {},
            "requires_confirmation": True,
            "clarifying_question": "I'm not sure what you'd like to do. Could you please clarify? I can help with blog writing, travel planning, or AI image tools.",
            "reasoning": "No clear intent detected"
        }
    
    def should_confirm_before_action(self, analysis: Dict[str, Any]) -> bool:
        """Determine if we should confirm before taking action"""
        confidence = analysis.get("confidence", 0.0)
        requires_confirmation = analysis.get("requires_confirmation", True)
        
        # Always confirm if confidence is below HIGH threshold
        if confidence < IntentConfidence.HIGH:
            return True
        
        # Always confirm if explicitly marked
        if requires_confirmation:
            return True
        
        return False
    
    def generate_confirmation_message(self, analysis: Dict[str, Any]) -> str:
        """Generate a confirmation message for the user"""
        intent = analysis.get("intent")
        sub_intent = analysis.get("sub_intent")
        confidence = analysis.get("confidence", 0.0)
        
        if confidence < IntentConfidence.MEDIUM:
            # Low confidence - ask clarifying question
            return analysis.get("clarifying_question", "Could you please clarify what you'd like to do?")
        
        # Medium-high confidence - confirm action
        if intent == "ai_image" and sub_intent:
            feature_name = sub_intent.replace("_", " ").title()
            return f"I think you want to use {feature_name}. Should I open it for you?"
        
        elif intent == "blog":
            return "Would you like me to help you write a blog article?"
        
        elif intent == "travel":
            return "Would you like me to help you plan a trip?"
        
        elif intent == "navigation":
            return "Where would you like to go?"
        
        else:
            return "I'm not quite sure what you need. Could you please clarify?"


# Singleton instance
_intent_engine: Optional[IntelligentIntentEngine] = None

def get_intent_engine() -> IntelligentIntentEngine:
    """Get or create intent engine instance"""
    global _intent_engine
    
    if _intent_engine is None:
        _intent_engine = IntelligentIntentEngine()
    
    return _intent_engine

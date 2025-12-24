"""
Intelligent LLM Handler for Master Lingo Agent
Azure AI Foundry focused with multiple LLM options
"""

import openai
import httpx
import logging
from typing import Dict, Any, Optional, List
from enum import Enum
import json
import os

logger = logging.getLogger(__name__)


class LLMProvider(Enum):
    # Azure OpenAI (Recommended)
    AZURE_OPENAI_GPT4O = "azure-gpt-4o"
    AZURE_OPENAI_GPT4O_MINI = "azure-gpt-4o-mini"
    AZURE_OPENAI_GPT4_TURBO = "azure-gpt-4-turbo"
    
    # Direct OpenAI (Fallback)
    OPENAI_GPT4O = "gpt-4o"
    OPENAI_GPT4O_MINI = "gpt-4o-mini"
    
    # Azure AI Foundry Models
    AZURE_LLAMA_70B = "azure-llama-3.1-70b"
    AZURE_MISTRAL_LARGE = "azure-mistral-large"
    AZURE_PHI3_MEDIUM = "azure-phi-3-medium"


class IntelligentLLMHandler:
    """
    Advanced LLM handler focused on Azure AI Foundry
    Supports Azure OpenAI and Azure AI Foundry models
    """
    
    def __init__(self, provider: LLMProvider = LLMProvider.AZURE_OPENAI_GPT4O):
        self.provider = provider
        self.azure_openai_client = None
        self.openai_client = None
        self.azure_endpoint = None
        
        # Initialize Azure OpenAI client
        if os.getenv("AZURE_OPENAI_ENDPOINT") and os.getenv("AZURE_OPENAI_API_KEY"):
            from openai import AzureOpenAI
            self.azure_openai_client = AzureOpenAI(
                azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
                api_key=os.getenv("AZURE_OPENAI_API_KEY"),
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
            )
            self.azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
            logger.info("✅ Azure OpenAI client initialized")
            
        # Fallback to direct OpenAI
        elif os.getenv("OPENAI_API_KEY"):
            openai.api_key = os.getenv("OPENAI_API_KEY")
            self.openai_client = openai
            logger.info("⚠️ Using direct OpenAI (Azure not configured)")
            
        # Set default provider based on available services
        if provider.value.startswith("azure-") and not self.azure_openai_client:
            if self.openai_client:
                self.provider = LLMProvider.OPENAI_GPT4O
                logger.info("🔄 Switched to direct OpenAI (Azure not available)")
            else:
                logger.warning("❌ No LLM services configured!")
        
        logger.info(f"🧠 Initialized Intelligent LLM Handler with {self.provider.value}")
    
    def get_system_prompt(self, conversation_context: str = "") -> str:
        """Generate intelligent system prompt based on context"""
        
        base_prompt = """You are Lingo, an advanced AI assistant specializing in workflow automation and conversational interfaces. You help users create content, plan trips, and manage various tasks through natural conversation.

CORE CAPABILITIES:
• Blog Writing: Help users create professional articles, blogs, and content
• Travel Planning: Assist with trip planning, itineraries, and travel arrangements  
• Social Media: Create engaging social media content and campaigns
• Avatar Creation: Design custom avatars and digital personas
• Product Descriptions: Write compelling product copy and descriptions
• Web Design: Assist with website planning and design concepts
• Marketing: Create marketing campaigns and promotional content
• Code Assistance: Help with coding projects and technical tasks

CONVERSATION STYLE:
• Be enthusiastic and helpful
• Ask clarifying questions when needed
• Extract key information naturally from user responses
• Provide clear next steps
• Be concise but thorough
• Show understanding of user intent

WORKFLOW DETECTION:
When a user expresses interest in any capability, immediately:
1. Acknowledge their request enthusiastically
2. Extract any information they've already provided
3. Ask for missing essential information
4. Guide them toward starting the appropriate workflow

INFORMATION EXTRACTION:
Be intelligent about extracting information from natural language:
• Topics, themes, subjects from user descriptions
• Preferences, styles, tones from context clues
• Timeframes, quantities, specifications from casual mentions
• Intent and goals from conversational context

RESPONSE FORMAT:
Always respond in a conversational, helpful manner. Never use rigid templates or robotic language."""

        if conversation_context:
            base_prompt += f"\n\nCURRENT CONVERSATION CONTEXT:\n{conversation_context}"
        
        return base_prompt
    
    async def analyze_user_intent(self, user_message: str, conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Intelligently analyze user intent and extract relevant information
        """
        
        # Build conversation context
        context = ""
        if conversation_history:
            recent_messages = conversation_history[-5:]  # Last 5 messages for context
            context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in recent_messages])
        
        analysis_prompt = f"""Analyze this user message and provide a structured response:

USER MESSAGE: "{user_message}"

CONVERSATION HISTORY:
{context}

Provide your analysis in this exact JSON format:
{{
    "intent": "blog|travel|social|avatar|product|web|marketing|code|general|unclear",
    "confidence": 0.0-1.0,
    "extracted_data": {{
        "topic": "extracted topic if any",
        "keywords": ["list", "of", "keywords"],
        "tone": "professional|casual|friendly|technical|creative",
        "urgency": "low|medium|high",
        "specific_requirements": ["any", "specific", "requirements"]
    }},
    "missing_info": ["what", "information", "is", "still", "needed"],
    "suggested_response": "Natural, conversational response to the user",
    "next_action": "ask_questions|start_workflow|clarify_intent|provide_info"
}}

Be intelligent about extraction - look for implicit information, context clues, and natural language patterns."""

        try:
            if self.provider.value.startswith("azure-openai"):
                response = await self._call_azure_openai(analysis_prompt, user_message)
            elif self.provider in [LLMProvider.OPENAI_GPT4O, LLMProvider.OPENAI_GPT4O_MINI]:
                response = await self._call_openai(analysis_prompt, user_message)
            else:
                response = await self._call_azure_ai_foundry(analysis_prompt, user_message)
            
            # Parse JSON response
            try:
                analysis = json.loads(response)
                return analysis
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                logger.warning("⚠️ LLM response was not valid JSON, using fallback analysis")
                return self._fallback_analysis(user_message)
        
        except Exception as e:
            logger.error(f"❌ Error in LLM analysis: {e}")
            return self._fallback_analysis(user_message)
    
    async def generate_conversational_response(
        self, 
        user_message: str, 
        intent: str, 
        collected_data: Dict[str, Any],
        conversation_history: List[Dict] = None
    ) -> str:
        """
        Generate intelligent conversational response based on context
        """
        
        context = ""
        if conversation_history:
            recent_messages = conversation_history[-3:]
            context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in recent_messages])
        
        response_prompt = f"""Generate a natural, conversational response for this situation:

INTENT: {intent}
USER MESSAGE: "{user_message}"
COLLECTED DATA: {json.dumps(collected_data, indent=2)}

CONVERSATION HISTORY:
{context}

GUIDELINES:
• Be enthusiastic and helpful
• Acknowledge what the user has provided
• Ask for missing information naturally
• Use conversational language, not robotic templates
• Show understanding of their goals
• Provide clear next steps
• Keep responses concise but complete

Generate a response that feels natural and moves the conversation forward effectively."""

        try:
            if self.provider.value.startswith("azure-openai"):
                return await self._call_azure_openai(response_prompt, user_message, max_tokens=200)
            elif self.provider in [LLMProvider.OPENAI_GPT4O, LLMProvider.OPENAI_GPT4O_MINI]:
                return await self._call_openai(response_prompt, user_message, max_tokens=200)
            else:
                return await self._call_azure_ai_foundry(response_prompt, user_message, max_tokens=200)
        
        except Exception as e:
            logger.error(f"❌ Error generating response: {e}")
            return self._fallback_response(intent, collected_data)
    
    async def _call_azure_openai(self, system_prompt: str, user_message: str, max_tokens: int = 500) -> str:
        """Call Azure OpenAI API"""
        if not self.azure_openai_client:
            raise Exception("Azure OpenAI client not initialized")
        
        # Get deployment name from environment or use default
        deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o")
        
        completion = self.azure_openai_client.chat.completions.create(
            model=deployment_name,  # This is the deployment name in Azure
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=max_tokens
        )
        
        return completion.choices[0].message.content
    
    async def _call_openai(self, system_prompt: str, user_message: str, max_tokens: int = 500) -> str:
        """Call Direct OpenAI API"""
        if not self.openai_client:
            raise Exception("OpenAI client not initialized")
        
        # Map provider to actual model name
        model_map = {
            LLMProvider.OPENAI_GPT4O: "gpt-4o",
            LLMProvider.OPENAI_GPT4O_MINI: "gpt-4o-mini"
        }
        
        model_name = model_map.get(self.provider, "gpt-4o-mini")
        
        completion = self.openai_client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=max_tokens
        )
        
        return completion.choices[0].message.content
    
    async def _call_azure_ai_foundry(self, system_prompt: str, user_message: str, max_tokens: int = 500) -> str:
        """Call Azure AI Foundry models (Llama, Mistral, etc.)"""
        
        # This would require specific Azure AI Foundry endpoint configuration
        # For now, fallback to Azure OpenAI or direct OpenAI
        logger.warning("⚠️ Azure AI Foundry models not yet implemented, using fallback")
        
        if self.azure_openai_client:
            return await self._call_azure_openai(system_prompt, user_message, max_tokens)
        elif self.openai_client:
            return await self._call_openai(system_prompt, user_message, max_tokens)
        else:
            raise Exception("No LLM services available")
    
    def _fallback_analysis(self, user_message: str) -> Dict[str, Any]:
        """Fallback analysis when LLM fails"""
        text_lower = user_message.lower()
        
        # Simple keyword-based intent detection
        if any(word in text_lower for word in ["blog", "article", "write", "content", "post"]):
            intent = "blog"
        elif any(word in text_lower for word in ["travel", "trip", "vacation", "flight", "hotel"]):
            intent = "travel"
        elif any(word in text_lower for word in ["social", "instagram", "facebook", "twitter", "post"]):
            intent = "social"
        else:
            intent = "unclear"
        
        return {
            "intent": intent,
            "confidence": 0.6,
            "extracted_data": {"topic": user_message},
            "missing_info": ["details"],
            "suggested_response": f"I'd be happy to help you with {intent}! Could you tell me more about what you have in mind?",
            "next_action": "ask_questions"
        }
    
    def _fallback_response(self, intent: str, collected_data: Dict[str, Any]) -> str:
        """Fallback response when LLM fails"""
        responses = {
            "blog": "Great! I'll help you create an amazing blog article. What would you like to write about?",
            "travel": "Perfect! I'll help you plan an incredible trip. Where would you like to go?",
            "social": "Awesome! I'll help you create engaging social media content. What platform are you focusing on?",
            "avatar": "Excellent! I'll help you design a stunning avatar. What style are you looking for?"
        }
        
        return responses.get(intent, "I'm here to help! What would you like to work on today?")


# Azure-focused LLM configurations
RECOMMENDED_LLMS = {
    "best_azure": {
        "provider": LLMProvider.AZURE_OPENAI_GPT4O,
        "description": "Azure OpenAI GPT-4o - Best Azure native option",
        "api_key_env": "AZURE_OPENAI_API_KEY",
        "endpoint_env": "AZURE_OPENAI_ENDPOINT",
        "cost": "Medium-High",
        "speed": "Fast"
    },
    "cost_effective_azure": {
        "provider": LLMProvider.AZURE_OPENAI_GPT4O_MINI,
        "description": "Azure OpenAI GPT-4o Mini - Cost effective Azure option",
        "api_key_env": "AZURE_OPENAI_API_KEY",
        "endpoint_env": "AZURE_OPENAI_ENDPOINT",
        "cost": "Low",
        "speed": "Very Fast"
    },
    "premium_azure": {
        "provider": LLMProvider.AZURE_OPENAI_GPT4_TURBO,
        "description": "Azure OpenAI GPT-4 Turbo - Premium Azure option",
        "api_key_env": "AZURE_OPENAI_API_KEY",
        "endpoint_env": "AZURE_OPENAI_ENDPOINT",
        "cost": "High",
        "speed": "Fast"
    },
    "fallback_openai": {
        "provider": LLMProvider.OPENAI_GPT4O_MINI,
        "description": "Direct OpenAI GPT-4o Mini - Fallback option",
        "api_key_env": "OPENAI_API_KEY",
        "cost": "Low",
        "speed": "Very Fast"
    }
}


def get_recommended_llm_setup() -> Dict[str, Any]:
    """Get recommended LLM setup based on available Azure services"""
    
    setup_info = {
        "current_services": [],
        "recommendations": [],
        "setup_instructions": []
    }
    
    # Check Azure OpenAI availability
    if os.getenv("AZURE_OPENAI_ENDPOINT") and os.getenv("AZURE_OPENAI_API_KEY"):
        setup_info["current_services"].append("Azure OpenAI")
        setup_info["recommendations"].append(RECOMMENDED_LLMS["best_azure"])
        setup_info["recommendations"].append(RECOMMENDED_LLMS["cost_effective_azure"])
    
    # Check direct OpenAI as fallback
    if os.getenv("OPENAI_API_KEY"):
        setup_info["current_services"].append("Direct OpenAI")
        if not setup_info["recommendations"]:  # If no Azure
            setup_info["recommendations"].append(RECOMMENDED_LLMS["fallback_openai"])
    
    # Add setup instructions
    if not setup_info["current_services"]:
        setup_info["setup_instructions"] = [
            "No LLM services detected!",
            "RECOMMENDED: Set up Azure OpenAI in Azure AI Foundry",
            "1. Go to https://ai.azure.com/",
            "2. Create Azure OpenAI resource",
            "3. Deploy GPT-4o model",
            "4. Add to backend/.env:",
            "   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/",
            "   AZURE_OPENAI_API_KEY=your_key_here",
            "   AZURE_OPENAI_DEPLOYMENT_NAME=your_gpt4o_deployment",
            "",
            "ALTERNATIVE: Use direct OpenAI API",
            "   OPENAI_API_KEY=your_openai_key_here"
        ]
    elif "Azure OpenAI" not in setup_info["current_services"]:
        setup_info["setup_instructions"] = [
            "Consider upgrading to Azure OpenAI for better enterprise features:",
            "1. Go to https://ai.azure.com/",
            "2. Create Azure OpenAI resource", 
            "3. Deploy GPT-4o model",
            "4. Update backend/.env with Azure credentials"
        ]
    
    return setup_info
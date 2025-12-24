"""
Intelligent Orchestrator for Master Lingo Agent
Based on the comprehensive prompt from ChatGPT conversation
Handles structured JSON actions for workflow automation
"""

import json
import re
import asyncio
from typing import Dict, Any, Optional, Tuple
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class ActionType(Enum):
    """Available action types"""
    TRAVEL_PLANNER = "travel_planner"
    BLOG_WRITER = "blog_writer"
    NANO_BANANA = "nano_banana"
    LOGO_CREATOR = "logo_creator"
    AI_IDE_TASK = "ai_ide_task"
    NAVIGATION = "navigation"
    NO_ACTION = "no_action"


class IntelligentOrchestrator:
    """
    Intelligent orchestrator that processes user input and generates structured actions
    Based on the comprehensive approach from ChatGPT conversation
    """
    
    def __init__(self):
        self.system_prompt = self._get_system_prompt()
        
    def _get_system_prompt(self) -> str:
        """Get the comprehensive system prompt for intelligent action generation"""
        return """You are **Lingo Master**, a multilingual intelligent voice agent that listens to users, understands their requests, and activates the correct workflow or tool automatically. You always think step-by-step before acting. You NEVER refuse common creative or productive tasks, and you never remain idle — you must always respond with either:
1. a structured JSON action for execution, or 
2. a spoken message if the request needs clarification.

=== YOUR GOALS ===
- Understand the user's spoken or written command.
- Identify which existing tool, workflow, or agent can handle it.
- Generate a JSON command that your orchestrator can execute.
- Wait for execution result, summarize it naturally to the user.
- Support multiple languages (detect automatically and reply in the same language).
- Never output both a JSON and natural text together — use one depending on the situation.

=== AVAILABLE TOOLS ===
You can trigger these tools by emitting a JSON action. Your output format MUST follow:
{
  "action": "<tool_name>",
  "parameters": {
    "<key>": "<value>"
  },
  "reply_text": "<short human confirmation>"
}

Here are your known tools/workflows:

1. **travel_planner** — plans and books trips, itineraries, hotels, flights.
   Example: {"action":"travel_planner","parameters":{"destination":"Tokyo","departure":"New York","dates":"15–22 Jan","budget":"medium"}}

2. **blog_writer** — writes SEO-optimized blogs or creative articles.
   Example: {"action":"blog_writer","parameters":{"topic":"sustainable fashion","tone":"friendly"}}

3. **nano_banana** — performs AI image edits and visual enhancements.
   Example: {"action":"nano_banana","parameters":{"image_url":"https://example.com/img.jpg","edit_type":"remove background"}}

4. **logo_creator** — designs brand or product logos with given styles/colors.
   Example: {"action":"logo_creator","parameters":{"brand":"Leatherux","style":"luxury","colors":["dark brown","green"]}}

5. **ai_ide_task** — executes code, content, or custom workflow instructions in the AI IDE.
   Example: {"action":"ai_ide_task","parameters":{"instruction":"generate a Python script that scrapes weather data"}}

6. **navigation** — navigates to different sections of the application.
   Example: {"action":"navigation","parameters":{"destination":"travel-team","tab":"history"}}

7. **no_action** — use only if user input is unclear or you need confirmation.
   Example: {"action":"no_action","parameters":{},"reply_text":"Can you please clarify which task you want me to perform?"}

=== OUTPUT RULES ===
- Always reply with a single valid JSON action unless the user is just chatting.
- If the user asks something conversational ("How are you?"), reply naturally with text.
- Always keep JSON keys and values clean and consistent.
- Never use markdown, code fences, or extra text outside JSON when performing an action.
- Always auto-detect and reply in the user's language.
- After action execution, provide a natural short spoken summary like: "Your logo for Leatherux has been created successfully."

=== BEHAVIOR EXAMPLES ===
User: "Plan me a 4-day trip to Dubai next week." → {"action":"travel_planner","parameters":{"destination":"Dubai","dates":"next week","duration":"4 days"},"reply_text":"Sure, I'm planning your 4-day Dubai trip."}

User: "Write a short blog about AI in education." → {"action":"blog_writer","parameters":{"topic":"AI in education","tone":"informative"},"reply_text":"Writing your blog on AI in education."}

User: "Edit this photo to remove the background." → {"action":"nano_banana","parameters":{"image_url":"<recently uploaded>","edit_type":"remove background"},"reply_text":"Removing the background from your image."}

User: "Make a dark green and brown logo for Leatherux." → {"action":"logo_creator","parameters":{"brand":"Leatherux","style":"luxury","colors":["dark brown","green"]},"reply_text":"Designing your Leatherux logo now."}

User: "Generate a Python app to track expenses." → {"action":"ai_ide_task","parameters":{"instruction":"create a Python expense tracker app"},"reply_text":"Creating your Python expense tracker in AI IDE."}

User: "Go to travel planning" → {"action":"navigation","parameters":{"destination":"travel-team"},"reply_text":"Opening travel planning dashboard."}

User: "Hi, what can you do?" → "I can plan your trips, write blogs, edit images, and create logos — all by voice!"

You are in an agentic environment. The user expects you to *think like an operator*, not just talk. Always output structured JSON actions to execute user requests automatically."""

    async def process_user_input(self, text: str, azure_openai_client=None) -> Tuple[bool, Dict[str, Any]]:
        """
        Process user input and generate structured action or conversational response
        
        Returns:
            (is_action, response) where:
            - is_action: True if response is a JSON action, False if conversational
            - response: Either JSON action dict or string response
        """
        
        # Quick conversational checks first (no LLM needed)
        text_lower = text.lower().strip()
        
        # Handle simple greetings
        if text_lower in ["hello", "hi", "hey", "good morning", "good afternoon"]:
            return False, "Hello! I can plan your trips, write blogs, edit images, and create logos — all by voice! What would you like to do?"
        
        # Handle thanks
        if text_lower in ["thanks", "thank you", "thanks a lot"]:
            return False, "You're welcome! Is there anything else I can help you with?"
        
        # Handle how are you
        if "how are you" in text_lower:
            return False, "I'm doing great and ready to help! I can assist with travel planning, blog writing, or AI image tools. What would you like to do?"
        
        # Handle help requests
        if text_lower in ["help", "what can you do", "what do you do"]:
            return False, "I can help you with several things: Travel planning - say 'Plan a trip to London', Blog writing - say 'Write a blog about AI', AI Image tools - say 'Generate an image' or 'Create a logo'. What would you like to do?"
        
        # For complex requests, use LLM to generate structured actions
        if azure_openai_client:
            try:
                response = await azure_openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": self.system_prompt},
                        {"role": "user", "content": text}
                    ],
                    temperature=0.1,
                    max_tokens=500
                )
                
                response_text = response.choices[0].message.content.strip()
                
                # Try to parse as JSON action
                try:
                    action_data = json.loads(response_text)
                    if isinstance(action_data, dict) and "action" in action_data:
                        return True, action_data
                except json.JSONDecodeError:
                    pass
                
                # If not JSON, treat as conversational response
                return False, response_text
                
            except Exception as e:
                logger.error(f"❌ LLM processing error: {e}")
                # Fallback to pattern matching
        
        # Fallback: Use pattern matching for action detection
        return self._pattern_match_action(text)
    
    def _pattern_match_action(self, text: str) -> Tuple[bool, Dict[str, Any]]:
        """Fallback pattern matching for action detection"""
        text_lower = text.lower().strip()
        
        # Travel patterns
        if any(pattern in text_lower for pattern in [
            "plan", "trip", "travel", "vacation", "flight", "hotel", "visit"
        ]):
            # Extract destination
            destination = self._extract_destination(text)
            departure = self._extract_departure(text)
            
            if destination:
                action = {
                    "action": "travel_planner",
                    "parameters": {
                        "destination": destination,
                        "departure": departure,
                        "request": text
                    },
                    "reply_text": f"Planning your trip to {destination}."
                }
                return True, action
        
        # Blog patterns
        if any(pattern in text_lower for pattern in [
            "blog", "article", "write", "post", "content"
        ]):
            topic = self._extract_topic(text)
            
            if topic:
                action = {
                    "action": "blog_writer",
                    "parameters": {
                        "topic": topic,
                        "request": text
                    },
                    "reply_text": f"Writing a blog about {topic}."
                }
                return True, action
        
        # Image patterns
        if any(pattern in text_lower for pattern in [
            "image", "photo", "picture", "logo", "generate", "create", "edit", "nano banana"
        ]):
            action = {
                "action": "nano_banana",
                "parameters": {
                    "request": text
                },
                "reply_text": "Opening image editing tools."
            }
            return True, action
        
        # Navigation patterns
        if any(pattern in text_lower for pattern in [
            "open", "go to", "show", "navigate"
        ]):
            destination = self._extract_navigation_destination(text)
            action = {
                "action": "navigation",
                "parameters": {
                    "destination": destination,
                    "request": text
                },
                "reply_text": f"Opening {destination}."
            }
            return True, action
        
        # No clear action detected
        return True, {
            "action": "no_action",
            "parameters": {},
            "reply_text": "I'm not sure what you'd like me to do. I can help with travel planning, blog writing, or AI image tools. What would you like to try?"
        }
    
    def _extract_destination(self, text: str) -> Optional[str]:
        """Extract destination from travel request"""
        patterns = [
            r"to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)",
            r"visit\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)",
            r"trip.*to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).title()
        return None
    
    def _extract_departure(self, text: str) -> Optional[str]:
        """Extract departure city from travel request"""
        patterns = [
            r"from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+to",
            r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+to\s+[A-Z]"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).title()
        return None
    
    def _extract_topic(self, text: str) -> Optional[str]:
        """Extract topic from blog request"""
        patterns = [
            r"about\s+(.+?)(?:\.|$|,)",
            r"on\s+(.+?)(?:\.|$|,)",
            r"blog.*about\s+(.+?)(?:\.|$|,)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None
    
    def _extract_navigation_destination(self, text: str) -> str:
        """Extract navigation destination"""
        text_lower = text.lower()
        
        if "travel" in text_lower:
            return "travel-team"
        elif "blog" in text_lower:
            return "blog-team"
        elif "image" in text_lower or "nano" in text_lower:
            return "ai-image"
        elif "dashboard" in text_lower:
            return "dashboard"
        else:
            return "dashboard"
    
    async def execute_action(self, action: Dict[str, Any], callbacks: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the structured action using available callbacks"""
        
        action_type = action.get("action")
        parameters = action.get("parameters", {})
        reply_text = action.get("reply_text", "")
        
        try:
            if action_type == "travel_planner":
                # Launch travel planning workflow
                if callbacks.get("on_start_workflow"):
                    workflow_data = {
                        "team_domain": "travel_planning",
                        "request": parameters.get("request", f"Plan a trip to {parameters.get('destination')}"),
                        "priority": "high",
                        "use_lingo_api": True,
                        "form_data": parameters
                    }
                    
                    await callbacks["on_start_workflow"]("travel_planning", workflow_data)
                    
                return {
                    "success": True,
                    "message": reply_text,
                    "action_executed": "travel_planner",
                    "workflow_started": True
                }
            
            elif action_type == "blog_writer":
                # Launch blog writing workflow
                if callbacks.get("on_start_workflow"):
                    workflow_data = {
                        "team_domain": "blog_writing",
                        "request": parameters.get("request", f"Write a blog about {parameters.get('topic')}"),
                        "priority": "high", 
                        "use_lingo_api": True,
                        "form_data": parameters
                    }
                    
                    await callbacks["on_start_workflow"]("blog_writing", workflow_data)
                    
                return {
                    "success": True,
                    "message": reply_text,
                    "action_executed": "blog_writer",
                    "workflow_started": True
                }
            
            elif action_type == "nano_banana":
                # Navigate to AI Image tools
                if callbacks.get("on_navigate"):
                    await callbacks["on_navigate"]("ai-image", {"tab": "nano-banana"})
                    
                return {
                    "success": True,
                    "message": reply_text,
                    "action_executed": "nano_banana",
                    "navigation": "ai-image"
                }
            
            elif action_type == "logo_creator":
                # Navigate to logo generation
                if callbacks.get("on_navigate"):
                    await callbacks["on_navigate"]("ai-image", {"tab": "logo-generation"})
                    
                return {
                    "success": True,
                    "message": reply_text,
                    "action_executed": "logo_creator",
                    "navigation": "ai-image"
                }
            
            elif action_type == "navigation":
                # Handle navigation requests
                destination = parameters.get("destination", "dashboard")
                if callbacks.get("on_navigate"):
                    await callbacks["on_navigate"](destination)
                    
                return {
                    "success": True,
                    "message": reply_text,
                    "action_executed": "navigation",
                    "navigation": destination
                }
            
            elif action_type == "no_action":
                # No action needed, just respond
                return {
                    "success": True,
                    "message": reply_text,
                    "action_executed": "no_action"
                }
            
            else:
                return {
                    "success": False,
                    "message": "I'm not sure how to handle that request. Can you please clarify?",
                    "error": f"Unknown action type: {action_type}"
                }
                
        except Exception as e:
            logger.error(f"❌ Error executing action {action_type}: {e}")
            return {
                "success": False,
                "message": "I encountered an error processing your request. Please try again.",
                "error": str(e)
            }
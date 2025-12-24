"""
Azure Intelligent Speech Handler
Leverages Azure Speech's built-in conversational AI capabilities
"""

import asyncio
import logging
from typing import Dict, Any, Optional, Callable
import json
import os
import re
from enum import Enum

logger = logging.getLogger(__name__)

class VoiceCommand(Enum):
    """Direct voice command mappings"""
    NAVIGATE_AI_IMAGE = "navigate_ai_image"
    NAVIGATE_TRAVEL = "navigate_travel"
    NAVIGATE_BLOG = "navigate_blog"
    OPEN_NANO_BANANA = "open_nano_banana"
    OPEN_LOGO_GENERATION = "open_logo_generation"
    OPEN_REMOVE_BACKGROUND = "open_remove_background"
    OPEN_PRODUCT_SHOT = "open_product_shot"
    OPEN_VIRTUAL_TRYON = "open_virtual_tryon"
    GENERATE_IMAGE = "generate_image"
    PLAN_TRIP = "plan_trip"
    WRITE_BLOG = "write_blog"
    HELP = "help"
    UNKNOWN = "unknown"

class AzureIntelligentSpeech:
    """
    Azure Speech with built-in intelligence for voice commands
    Bypasses GPT-4o for simple navigation commands for faster response
    """
    
    def __init__(self):
        self.voice_patterns = self._initialize_voice_patterns()
        self.on_navigate: Optional[Callable] = None
        self.on_start_workflow: Optional[Callable] = None
        self.on_update_ui: Optional[Callable] = None
        self.on_speak: Optional[Callable] = None  # Add speak callback
        
    def _initialize_voice_patterns(self) -> Dict[str, VoiceCommand]:
        """Initialize flexible voice command patterns for natural language recognition"""
        # Use regex patterns for flexible natural language matching
        return {
            # AI Image navigation (flexible patterns with politeness)
            r".*(?:can you (?:please )?)?(?:navigate|go|take me|show me|open).*(?:to )?(?:the )?ai.*images?.*": VoiceCommand.NAVIGATE_AI_IMAGE,
            r".*(?:can you (?:please )?)?(?:navigate|go|take me|show me|open).*(?:to )?(?:the )?image.*(?:edit|tool|suite).*": VoiceCommand.NAVIGATE_AI_IMAGE,
            r".*(?:can you (?:please )?)?(?:open|show).*(?:the )?ai.*image.*(?:section|page|area).*": VoiceCommand.NAVIGATE_AI_IMAGE,
            
            # Nano Banana (flexible patterns)
            r".*(?:can you (?:please )?)?(?:navigate|go|take me|open).*(?:to )?(?:the )?nano.*banana.*": VoiceCommand.OPEN_NANO_BANANA,
            r".*(?:can you (?:please )?)?(?:navigate|go|take me|open).*(?:to )?(?:the )?nana.*banana.*": VoiceCommand.OPEN_NANO_BANANA,
            
            # Logo Generation (flexible patterns)
            r".*(?:can you (?:please )?)?(?:open|navigate|go).*(?:to )?(?:the )?logo.*generat.*": VoiceCommand.OPEN_LOGO_GENERATION,
            r".*(?:can you (?:please )?)?(?:open|navigate|go).*(?:to )?(?:the )?logo.*creat.*": VoiceCommand.OPEN_LOGO_GENERATION,
            r".*(?:i )?(?:want|need).*logo.*generat.*": VoiceCommand.OPEN_LOGO_GENERATION,
            r".*(?:can you )?(?:please )?generat.*logo.*for me.*": VoiceCommand.OPEN_LOGO_GENERATION,
            
            # Remove Background (flexible patterns)
            r".*(?:can you (?:please )?)?(?:open|navigate|go).*(?:to )?(?:the )?(?:remove|background).*(?:background|remov).*": VoiceCommand.OPEN_REMOVE_BACKGROUND,
            r".*(?:can you (?:please )?)?(?:open|navigate|go).*(?:to )?(?:the )?background.*remov.*": VoiceCommand.OPEN_REMOVE_BACKGROUND,
            
            # Product Shot (flexible patterns)
            r".*(?:can you (?:please )?)?(?:open|navigate|go).*(?:to )?(?:the )?product.*shot.*": VoiceCommand.OPEN_PRODUCT_SHOT,
            r".*(?:can you (?:please )?)?(?:open|navigate|go).*(?:to )?(?:the )?product.*photo.*": VoiceCommand.OPEN_PRODUCT_SHOT,
            
            # Virtual Try-On (flexible patterns)
            r".*(?:can you (?:please )?)?(?:open|navigate|go).*(?:to )?(?:the )?virtual.*try.*on.*": VoiceCommand.OPEN_VIRTUAL_TRYON,
            r".*(?:can you (?:please )?)?(?:open|navigate|go).*(?:to )?(?:the )?virtual.*tryon.*": VoiceCommand.OPEN_VIRTUAL_TRYON,
            r".*(?:can you (?:please )?)?(?:open|navigate|go).*(?:to )?(?:the )?virtualdrion.*": VoiceCommand.OPEN_VIRTUAL_TRYON,
            r".*(?:can you (?:please )?)?(?:open|navigate|go).*(?:to )?(?:the )?virtual.*dri.*on.*": VoiceCommand.OPEN_VIRTUAL_TRYON,
            r".*(?:i )?(?:want to )?use.*virtual.*try.*on.*": VoiceCommand.OPEN_VIRTUAL_TRYON,
            r".*(?:i )?(?:want to )?use.*virtual.*tryon.*": VoiceCommand.OPEN_VIRTUAL_TRYON,
            
            # Travel commands (flexible patterns)
            r".*(?:can you (?:please )?)?(?:navigate|go|take me|open).*(?:to )?(?:the )?travel.*": VoiceCommand.NAVIGATE_TRAVEL,
            r".*(?:can you (?:please )?)?(?:open|show).*(?:the )?travel.*(?:plan|team|section).*": VoiceCommand.NAVIGATE_TRAVEL,
            r".*(?:can you (?:please )?)?plan.*(?:a )?trip.*": VoiceCommand.PLAN_TRIP,
            
            # Blog commands (flexible patterns)
            r".*(?:can you (?:please )?)?(?:navigate|go|take me|open).*(?:to )?(?:the )?blog.*": VoiceCommand.NAVIGATE_BLOG,
            r".*(?:can you (?:please )?)?(?:open|show).*(?:the )?blog.*(?:writ|team|section).*": VoiceCommand.NAVIGATE_BLOG,
            r".*(?:can you (?:please )?)?write.*(?:a )?blog.*": VoiceCommand.WRITE_BLOG,
            
            # Image generation (flexible patterns)
            r".*(?:can you (?:please )?)?(?:generat|creat|mak).*(?:an? )?image.*": VoiceCommand.GENERATE_IMAGE,
            r".*(?:can you (?:please )?)?(?:generat|creat|mak).*(?:a )?picture.*": VoiceCommand.GENERATE_IMAGE,
            
            # Help (specific patterns only - avoid catching complex questions)
            r"^(?:can you )?help\s*$": VoiceCommand.HELP,
            r"^(?:can you )?help me\s*$": VoiceCommand.HELP,
            r"^what can you do\s*\??$": VoiceCommand.HELP,
            r"^(?:show|tell) me (?:the )?options\s*$": VoiceCommand.HELP,
            r"^(?:show|tell) me what you can do\s*$": VoiceCommand.HELP,
        }
    
    def register_callbacks(
        self,
        on_navigate: Optional[Callable] = None,
        on_start_workflow: Optional[Callable] = None,
        on_update_ui: Optional[Callable] = None,
        on_speak: Optional[Callable] = None  # Add speak parameter
    ):
        """Register callbacks for UI control"""
        self.on_navigate = on_navigate
        self.on_start_workflow = on_start_workflow
        self.on_update_ui = on_update_ui
        self.on_speak = on_speak
    
    async def process_voice_command(self, text: str) -> Dict[str, Any]:
        """
        Process voice command with Azure Speech intelligence
        Returns immediate response for navigation commands
        """
        text_lower = text.lower().strip()
        
        # Check for commands with parameters FIRST (needs processing but faster than LLM)
        if self._contains_prompt(text_lower):
            return await self._process_command_with_prompt(text)
        
        # Check for direct command matches (instant response)
        command = self._match_direct_command(text_lower)
        
        if command != VoiceCommand.UNKNOWN:
            return await self._execute_direct_command(command, text)
        
        # Unknown command - needs GPT-4o processing
        return {
            "needs_llm_processing": True,
            "original_text": text,
            "confidence": 0.0
        }
    
    def _match_direct_command(self, text_lower: str) -> VoiceCommand:
        """Match direct voice commands using flexible regex patterns"""
        
        # Use regex matching for flexible natural language recognition
        for pattern, command in self.voice_patterns.items():
            try:
                if re.match(pattern, text_lower, re.IGNORECASE):
                    logger.info(f"✅ PATTERN MATCHED: '{text_lower}' -> {pattern} -> {command.value}")
                    return command
            except re.error as e:
                logger.warning(f"Invalid regex pattern {pattern}: {e}")
                continue
        
        logger.info(f"❌ NO PATTERN MATCHED: '{text_lower}'")
        return VoiceCommand.UNKNOWN
    
    def _contains_prompt(self, text_lower: str) -> bool:
        """Check if command contains a prompt that needs processing"""
        prompt_patterns = [
            r".*(?:generat|creat|mak).*image.*of.*\w+.*",
            r".*(?:generat|creat|mak).*picture.*of.*\w+.*",
            r".*plan.*trip.*to.*\w+.*",
            r".*write.*blog.*about.*\w+.*",
            r".*(?:creat|mak).*logo.*for.*\w+.*"
        ]
        
        return any(re.search(pattern, text_lower, re.IGNORECASE) for pattern in prompt_patterns)
    
    async def _execute_direct_command(self, command: VoiceCommand, original_text: str) -> Dict[str, Any]:
        """Execute direct navigation commands instantly"""
        
        logger.info(f"⚡ INSTANT COMMAND: {command.value}")
        
        if command == VoiceCommand.NAVIGATE_AI_IMAGE:
            await self._navigate_to("ai-image", "AI Image Suite")
            return {"handled": True, "type": "navigation", "destination": "ai-image"}
        
        elif command == VoiceCommand.OPEN_NANO_BANANA:
            # Navigate to standalone Nano Banana view
            await self._navigate_to("nano-banana", "Nano Banana Studio")
            return {"handled": True, "type": "navigation", "destination": "nano-banana"}
        
        elif command == VoiceCommand.OPEN_LOGO_GENERATION:
            await self._navigate_to("ai-image", "Logo Generation", tab="logo-generation")
            return {"handled": True, "type": "navigation", "destination": "ai-image", "tab": "logo-generation"}
        
        elif command == VoiceCommand.OPEN_REMOVE_BACKGROUND:
            await self._navigate_to("ai-image", "Remove Background", tab="remove-background")
            return {"handled": True, "type": "navigation", "destination": "ai-image", "tab": "remove-background"}
        
        elif command == VoiceCommand.OPEN_PRODUCT_SHOT:
            await self._navigate_to("ai-image", "Product Shot", tab="product-shot")
            return {"handled": True, "type": "navigation", "destination": "ai-image", "tab": "product-shot"}
        
        elif command == VoiceCommand.OPEN_VIRTUAL_TRYON:
            # Navigate to Virtual Try-On (AI Try-On tab only, Virtual Model removed)
            await self._navigate_to("virtual-try-on", "Virtual Try-On", tab="ai-try-on")
            return {"handled": True, "type": "navigation", "destination": "virtual-try-on", "tab": "ai-try-on"}
        
        elif command == VoiceCommand.NAVIGATE_TRAVEL:
            await self._navigate_to("travel-team", "Travel Planning")
            return {"handled": True, "type": "navigation", "destination": "travel-team"}
        
        elif command == VoiceCommand.NAVIGATE_BLOG:
            await self._navigate_to("blog-team", "Blog Writing")
            return {"handled": True, "type": "navigation", "destination": "blog-team"}
        
        elif command == VoiceCommand.HELP:
            await self._show_help()
            return {"handled": True, "type": "help"}
        
        return {"handled": False, "needs_llm_processing": True}
    
    async def _process_command_with_prompt(self, text: str) -> Dict[str, Any]:
        """Process commands that contain prompts (needs some processing but faster than full LLM)"""
        
        text_lower = text.lower().strip()
        
        # Extract prompt for image generation using regex
        image_patterns = [
            r".*(?:generat|creat|mak).*image.*of\s+(.+)",
            r".*(?:generat|creat|mak).*picture.*of\s+(.+)"
        ]
        
        for pattern in image_patterns:
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                prompt = match.group(1).strip()
                # Clean up the prompt
                prompt = re.sub(r'\s*(?:please|for me)\s*$', '', prompt).strip()
                if len(prompt) > 2:
                    # Navigate to standalone nano-banana view with prompt
                    await self._navigate_to("nano-banana", f"Nano Banana - {prompt}", data={"prompt": prompt})
                    await self._send_ui_update(f"Opening Nano Banana to create: {prompt}")
                    return {
                        "handled": True, 
                        "type": "ai_image_with_prompt",
                        "destination": "nano-banana",
                        "prompt": prompt
                    }
        
        # Extract destination for travel using regex
        travel_patterns = [
            r".*plan.*trip.*to\s+(.+)",
            r".*travel.*to\s+(.+)"
        ]
        
        for pattern in travel_patterns:
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                destination = match.group(1).strip()
                destination = re.sub(r'\s*(?:please|for me)\s*$', '', destination).strip()
                if len(destination) > 2:
                    await self._navigate_to("travel-team", f"Travel to {destination}")
                    await self._send_ui_update(f"Planning your trip to {destination}")
                    return {
                        "handled": True,
                        "type": "travel_with_destination", 
                        "destination": "travel-team",
                        "location": destination
                    }
        
        # Extract topic for blog using regex
        blog_patterns = [
            r".*write.*blog.*about\s+(.+)",
            r".*blog.*about\s+(.+)"
        ]
        
        for pattern in blog_patterns:
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                topic = match.group(1).strip()
                topic = re.sub(r'\s*(?:please|for me)\s*$', '', topic).strip()
                if len(topic) > 2:
                    await self._navigate_to("blog-team", f"Blog about {topic}")
                    await self._send_ui_update(f"Writing blog article about {topic}")
                    return {
                        "handled": True,
                        "type": "blog_with_topic",
                        "destination": "blog-team", 
                        "topic": topic
                    }
        
        return {"handled": False, "needs_llm_processing": True}
    
    def _extract_prompt(self, text: str, prefixes: list) -> Optional[str]:
        """Extract prompt from voice command"""
        text_lower = text.lower()
        
        for prefix in prefixes:
            if prefix in text_lower:
                # Find the part after the prefix
                parts = text_lower.split(prefix, 1)
                if len(parts) > 1:
                    prompt = parts[1].strip()
                    # Remove common endings
                    prompt = prompt.replace(" please", "").replace(" for me", "").strip()
                    if len(prompt) > 2:
                        return prompt
        
        return None
    
    async def _navigate_to(self, destination: str, description: str, tab: Optional[str] = None, data: Optional[Dict[str, Any]] = None):
        """Navigate to destination with instant feedback and optional data (like prompts)"""
        
        logger.info(f"🚀 INSTANT NAVIGATION: {destination} ({description})")
        
        # Speak the feedback for voice confirmation
        speech_message = f"Opening {description}"
        if self.on_speak:
            try:
                if asyncio.iscoroutinefunction(self.on_speak):
                    await self.on_speak(speech_message)
                else:
                    self.on_speak(speech_message)
            except Exception as e:
                logger.error(f"Speech error: {e}")
        
        # Send immediate UI feedback
        await self._send_ui_update(speech_message)
        
        # Navigate with data
        if self.on_navigate:
            try:
                # Create navigation payload
                nav_data = {"tab": tab} if tab else {}
                if data:
                    nav_data.update(data)
                
                if asyncio.iscoroutinefunction(self.on_navigate):
                    if nav_data:
                        await self.on_navigate(destination, nav_data)
                    else:
                        await self.on_navigate(destination)
                else:
                    if nav_data:
                        self.on_navigate(destination, nav_data)
                    else:
                        self.on_navigate(destination)
                logger.info(f"✅ Navigated to {destination} with data: {nav_data}")
            except Exception as e:
                logger.error(f"Navigation error: {e}")
    
    async def _show_help(self):
        """Show help message with available commands"""
        
        help_message = """🎤 **Voice Commands Available:**

**Navigation (Instant):**
• "Navigate to AI Image" or "Open AI Image"
• "Navigate to Nano Banana" or "Open Nano Banana"  
• "Navigate to Travel" or "Open Travel"
• "Navigate to Blog" or "Open Blog"

**AI Image Tools (Instant):**
• "Open Logo Generation"
• "Open Remove Background"
• "Open Product Shot"
• "Open Virtual Try-On"

**With Prompts (Fast):**
• "Generate image of [description]"
• "Plan trip to [destination]"
• "Write blog about [topic]"

**Help:**
• "Help" or "What can you do?"

Try any of these commands for instant response! 🚀"""
        
        await self._send_ui_update(help_message)
    
    async def _send_ui_update(self, message: str):
        """Send UI update message"""
        if self.on_update_ui:
            ui_data = {
                "message": message,
                "intent": "voice_command",
                "phase": "completed",
                "agent_type": "azure_intelligent_speech",
                "timestamp": asyncio.get_event_loop().time()
            }
            
            try:
                if asyncio.iscoroutinefunction(self.on_update_ui):
                    await self.on_update_ui(ui_data)
                else:
                    self.on_update_ui(ui_data)
            except Exception as e:
                logger.error(f"UI update error: {e}")

# Global instance
_azure_intelligent_speech = None

def get_azure_intelligent_speech() -> AzureIntelligentSpeech:
    """Get global Azure Intelligent Speech instance"""
    global _azure_intelligent_speech
    if _azure_intelligent_speech is None:
        _azure_intelligent_speech = AzureIntelligentSpeech()
    return _azure_intelligent_speech
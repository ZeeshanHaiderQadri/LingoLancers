"""
Streamlined Master Lingo Agent with LLM Integration
Fast, intelligent, multilingual voice assistant
"""

import asyncio
import logging
from typing import Dict, Any, Optional, Callable
from enum import Enum
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, SystemMessage

from .azure_speech_handler import AzureSpeechHandler

logger = logging.getLogger(__name__)


class ConversationState(Enum):
    IDLE = "idle"
    LISTENING = "listening"
    COLLECTING_BLOG_INFO = "collecting_blog_info"
    COLLECTING_TRAVEL_INFO = "collecting_travel_info"


class StreamlinedLingoAgent:
    """
    Streamlined voice agent with LLM intelligence
    - Fast responses (no stop/start cycle)
    - Intelligent conversation (LLM-powered)
    - Multilingual support
    - WebSocket integration
    """
    
    def __init__(self, openai_api_key: str):
        self.speech_handler = AzureSpeechHandler()
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.7,
            openai_api_key=openai_api_key
        )
        
        self.state = ConversationState.IDLE
        self.current_workflow = None
        self.collected_data = {}
        
        # Callbacks for UI integration
        self.on_navigate: Optional[Callable] = None
        self.on_start_workflow: Optional[Callable] = None
        self.on_update_ui: Optional[Callable] = None
        
        # System prompt for LLM
        self.system_prompt = """You are Master Lingo, a helpful voice assistant that helps users with:
1. Writing blog articles
2. Planning travel trips

You are conversational, friendly, and efficient. When a user wants to write a blog or plan a trip:
- Quickly understand their intent
- Ask ONLY essential questions (max 3-4)
- Be concise in your responses
- Confirm and proceed

For blog writing, you need: topic, target audience (optional), tone (optional)
For travel planning, you need: destination, dates (optional), preferences (optional)

Always respond in the language the user is speaking. If they speak Hindi, respond in Hindi. If Arabic, respond in Arabic.
Keep responses SHORT and natural."""
    
    def register_callbacks(
        self,
        on_navigate: Optional[Callable] = None,
        on_start_workflow: Optional[Callable] = None,
        on_update_ui: Optional[Callable] = None
    ):
        """Register callbacks for UI updates"""
        self.on_navigate = on_navigate
        self.on_start_workflow = on_start_workflow
        self.on_update_ui = on_update_ui
        logger.info("✅ Callbacks registered")
    
    def set_voice(self, voice: str, language: str):
        """Change voice and language"""
        self.speech_handler.set_voice(voice)
        self.speech_handler.set_language(language)
        logger.info(f"Voice changed to: {voice}, Language: {language}")
    
    async def start(self, voice: str = "en-US-AriaNeural", language: str = "en-US"):
        """Start the agent"""
        self.set_voice(voice, language)
        
        # Start continuous recognition with callback
        async def on_transcript_callback(text: str, is_final: bool):
            if is_final and text.strip():
                logger.info(f"User said: {text}")
                await self._process_input(text)
        
        await self.speech_handler.start_continuous_recognition(
            on_transcript=on_transcript_callback
        )
        
        self.state = ConversationState.LISTENING
        
        # Welcome message
        await self._speak("Hello! I can help you write blog articles or plan trips. What would you like to do?")
        logger.info("✅ Streamlined Lingo Agent started")
    
    async def stop(self):
        """Stop the agent"""
        await self.speech_handler.stop_recognition()
        self.state = ConversationState.IDLE
        logger.info("✅ Streamlined Lingo Agent stopped")
    
    async def _process_input(self, text: str):
        """Process user input with LLM"""
        try:
            logger.info(f"🧠 Processing input with LLM: {text}")
            
            # Build conversation context
            messages = [
                SystemMessage(content=self.system_prompt),
                HumanMessage(content=f"User said: {text}\n\nCurrent state: {self.state.value}\nCollected data: {self.collected_data}")
            ]
            
            # Get LLM response
            logger.info("📡 Calling GPT-4...")
            response = await self.llm.ainvoke(messages)
            llm_response = response.content
            logger.info(f"🤖 LLM response: {llm_response[:100]}...")
            
            # Analyze intent and take action
            await self._analyze_and_act(text, llm_response)
            
        except Exception as e:
            logger.error(f"❌ Error processing input: {e}")
            await self._speak("Sorry, I had trouble understanding that. Could you try again?")
    
    async def _analyze_and_act(self, user_text: str, llm_response: str):
        """Analyze LLM response and take appropriate action"""
        user_lower = user_text.lower()
        
        # Check for blog intent
        if any(word in user_lower for word in ["blog", "article", "write", "post"]):
            if self.state == ConversationState.IDLE or self.state == ConversationState.LISTENING:
                # Start blog workflow
                self.state = ConversationState.COLLECTING_BLOG_INFO
                self.current_workflow = "blog"
                
                # Navigate to blog dashboard
                if self.on_navigate:
                    try:
                        if asyncio.iscoroutinefunction(self.on_navigate):
                            await self.on_navigate("blog")
                        else:
                            self.on_navigate("blog")
                        logger.info("✅ Navigated to blog dashboard")
                    except Exception as e:
                        logger.error(f"Navigation error: {e}")
                
                # Extract topic if mentioned
                if "about" in user_lower or "on" in user_lower:
                    words = user_text.split()
                    try:
                        about_idx = next(i for i, w in enumerate(words) if w.lower() in ["about", "on"])
                        topic = " ".join(words[about_idx + 1:])
                        self.collected_data["topic"] = topic
                    except:
                        pass
                
                await self._speak(llm_response)
            
            elif self.state == ConversationState.COLLECTING_BLOG_INFO:
                # Collecting blog info
                self._store_blog_data(user_text)
                
                # Check if we have enough info
                if self._has_enough_blog_info():
                    await self._start_blog_workflow()
                else:
                    await self._speak(llm_response)
        
        # Check for travel intent
        elif any(word in user_lower for word in ["trip", "travel", "visit", "vacation", "holiday"]):
            if self.state == ConversationState.IDLE or self.state == ConversationState.LISTENING:
                # Start travel workflow
                self.state = ConversationState.COLLECTING_TRAVEL_INFO
                self.current_workflow = "travel"
                
                # Navigate to travel dashboard
                if self.on_navigate:
                    try:
                        if asyncio.iscoroutinefunction(self.on_navigate):
                            await self.on_navigate("travel")
                        else:
                            self.on_navigate("travel")
                        logger.info("✅ Navigated to travel dashboard")
                    except Exception as e:
                        logger.error(f"Navigation error: {e}")
                
                # Extract destination if mentioned
                if "to" in user_lower:
                    words = user_text.split()
                    try:
                        to_idx = next(i for i, w in enumerate(words) if w.lower() == "to")
                        destination = " ".join(words[to_idx + 1:])
                        self.collected_data["destination"] = destination
                    except:
                        pass
                
                await self._speak(llm_response)
            
            elif self.state == ConversationState.COLLECTING_TRAVEL_INFO:
                # Collecting travel info
                self._store_travel_data(user_text)
                
                # Check if we have enough info
                if self._has_enough_travel_info():
                    await self._start_travel_workflow()
                else:
                    await self._speak(llm_response)
        
        else:
            # General response
            await self._speak(llm_response)
    
    def _store_blog_data(self, text: str):
        """Store blog-related data from user input"""
        if not self.collected_data.get("topic"):
            self.collected_data["topic"] = text
        elif not self.collected_data.get("audience"):
            self.collected_data["audience"] = text
        elif not self.collected_data.get("tone"):
            self.collected_data["tone"] = text
    
    def _store_travel_data(self, text: str):
        """Store travel-related data from user input"""
        if not self.collected_data.get("destination"):
            self.collected_data["destination"] = text
        elif not self.collected_data.get("dates"):
            self.collected_data["dates"] = text
        elif not self.collected_data.get("preferences"):
            self.collected_data["preferences"] = text
    
    def _has_enough_blog_info(self) -> bool:
        """Check if we have enough info to start blog workflow"""
        return "topic" in self.collected_data
    
    def _has_enough_travel_info(self) -> bool:
        """Check if we have enough info to start travel workflow"""
        return "destination" in self.collected_data
    
    async def _start_blog_workflow(self):
        """Start the blog writing workflow"""
        await self._speak("Perfect! Starting your blog article now.")
        
        if self.on_start_workflow:
            try:
                if asyncio.iscoroutinefunction(self.on_start_workflow):
                    await self.on_start_workflow("blog", self.collected_data)
                else:
                    self.on_start_workflow("blog", self.collected_data)
                logger.info(f"✅ Started blog workflow with data: {self.collected_data}")
            except Exception as e:
                logger.error(f"Workflow start error: {e}")
        
        # Reset state
        self.state = ConversationState.LISTENING
        self.current_workflow = None
        self.collected_data = {}
    
    async def _start_travel_workflow(self):
        """Start the travel planning workflow"""
        await self._speak("Great! Let me plan your trip.")
        
        if self.on_start_workflow:
            try:
                if asyncio.iscoroutinefunction(self.on_start_workflow):
                    await self.on_start_workflow("travel", self.collected_data)
                else:
                    self.on_start_workflow("travel", self.collected_data)
                logger.info(f"✅ Started travel workflow with data: {self.collected_data}")
            except Exception as e:
                logger.error(f"Workflow start error: {e}")
        
        # Reset state
        self.state = ConversationState.LISTENING
        self.current_workflow = None
        self.collected_data = {}
    
    async def _speak(self, text: str):
        """Speak text using Azure Speech"""
        try:
            await self.speech_handler.speak(text)
            logger.info(f"Spoke: {text[:50]}...")
        except Exception as e:
            logger.error(f"Speech error: {e}")

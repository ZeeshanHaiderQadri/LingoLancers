"""
Master Lingo Agent - Main Orchestrator
Handles conversational interactions and delegates to specialized teams
"""

import asyncio
from typing import Optional, Dict, Any, Callable
from enum import Enum
import logging

from .azure_speech_handler import get_azure_speech
from .intent_classifier import IntentClassifier, IntentType
from .azure_intelligent_speech import get_azure_intelligent_speech
from openai import AzureOpenAI
import os

# Import Agent Lightning for enhanced intelligence
try:
    import sys
    import os
    # Add parent directory to path to import agent_lightning
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
    from agent_lightning import get_agent_lightning_bridge
    AGENT_LIGHTNING_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("⚡ Agent Lightning available for Master Lingo Agent")
except ImportError as e:
    AGENT_LIGHTNING_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning(f"⚠️ Agent Lightning not available: {e}")


class ConversationState(Enum):
    """States of the conversation"""
    IDLE = "idle"
    LISTENING = "listening"
    PROCESSING = "processing"
    COLLECTING_INFO = "collecting_info"
    DELEGATING = "delegating"
    SPEAKING = "speaking"


class MasterLingoAgent:
    """
    Master conversational agent that:
    1. Listens to user voice input with Azure Speech (90+ languages, 10+ emotions)
    2. Classifies intent
    3. Collects required information through conversation
    4. Delegates to appropriate agent teams
    5. Controls UI navigation
    """
    
    def __init__(self):
        # Use Azure Speech instead of Deepgram
        self.voice_handler = get_azure_speech()
        self.intent_classifier = IntentClassifier()
        
        # Azure Intelligent Speech for instant voice commands
        self.azure_intelligent_speech = get_azure_intelligent_speech()
        
        # Initialize Azure OpenAI for general knowledge queries
        self.azure_openai_client = None
        try:
            azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
            azure_key = os.getenv("AZURE_OPENAI_API_KEY") or os.getenv("AZURE_OPENAI_KEY") or os.getenv("AZURE_OPENAI_REALTIME_KEY")
            
            if azure_endpoint and azure_key:
                self.azure_openai_client = AzureOpenAI(
                    azure_endpoint=azure_endpoint,
                    api_key=azure_key,
                    api_version="2024-08-01-preview"
                )
                logger.info("✓ Azure OpenAI initialized for general knowledge queries")
            else:
                logger.warning("⚠️ Azure OpenAI not configured - general knowledge queries will be limited")
        except Exception as e:
            logger.error(f"❌ Error initializing Azure OpenAI: {e}")
        
        # State management
        self.state = ConversationState.IDLE
        self.current_intent: Optional[IntentType] = None
        self.collected_data: Dict[str, Any] = {}
        self.conversation_history = []
        
        # Voice and language configuration
        self.current_voice = "en-US-AriaNeural"  # Default voice
        self.current_language = "en-US"  # Default language
        
        # Callbacks for UI control
        self.on_navigate: Optional[Callable] = None
        self.on_start_workflow: Optional[Callable] = None
        self.on_update_ui: Optional[Callable] = None
        
        # Echo prevention - track what we're saying
        self.currently_speaking = False
        self.last_spoken_text = ""
        
        # Form fields for different agents
        self.agent_form_fields = {
            "blog": [
                {"name": "topic", "prompt": "What topic would you like me to write about?", "required": True},
                {"name": "keywords", "prompt": "Any specific SEO keywords you want to target? (You can say 'skip' if none)", "required": False},
                {"name": "tone", "prompt": "What tone would you prefer? Professional, casual, technical, or friendly?", "required": False},
                {"name": "length", "prompt": "How long should the article be? Short (800 words), Medium (1500 words), or Long (2500 words)?", "required": False}
            ],
            "travel": [
                {"name": "destination", "prompt": "Where would you like to travel to?", "required": True},
                {"name": "departure", "prompt": "Where are you traveling from? (You can say 'skip' if flexible)", "required": False},
                {"name": "dates", "prompt": "When would you like to travel? (You can say 'flexible' or specific dates)", "required": False},
                {"name": "duration", "prompt": "How many days are you planning to stay?", "required": False},
                {"name": "travelers", "prompt": "How many travelers? (e.g., '2 adults', '4 family members')", "required": False},
                {"name": "budget", "prompt": "What's your budget preference? Economy, Comfort, or Luxury?", "required": False}
            ],
            "social": [
                {"name": "platform", "prompt": "Which social media platform? Instagram, Facebook, Twitter, or LinkedIn?", "required": True},
                {"name": "content_type", "prompt": "What type of content? Post, Story, Reel, or Campaign?", "required": False},
                {"name": "topic", "prompt": "What's the topic or theme for your content?", "required": True},
                {"name": "tone", "prompt": "What tone? Professional, casual, fun, or inspirational?", "required": False}
            ],
            "avatar": [
                {"name": "style", "prompt": "What style of avatar? Realistic, cartoon, anime, or professional?", "required": True},
                {"name": "gender", "prompt": "Gender preference? Male, female, or non-binary?", "required": False},
                {"name": "age_range", "prompt": "Age range? Young adult, middle-aged, or senior?", "required": False},
                {"name": "purpose", "prompt": "What will you use this avatar for? Profile picture, gaming, business, or other?", "required": False}
            ]
        }
        
        self.current_agent = None
        self.current_field_index = 0
    
    def _get_multilingual_greeting(self, greeting_type: str = "initial") -> str:
        """Get greeting message in the current voice's native language"""
        # Extract language code from voice name
        if hasattr(self, 'current_voice') and self.current_voice:
            voice_lang = self.current_voice.split('-')[0:2]
            if len(voice_lang) >= 2:
                lang_code = f"{voice_lang[0]}-{voice_lang[1]}"
            else:
                lang_code = "en-US"
        else:
            lang_code = "en-US"
        
        # Multilingual greetings
        greetings = {
            "initial": {
                "en-US": "Hello! I'm your Master Lingo assistant. I can help you plan trips or write blog articles. What would you like to do?",
                "en-GB": "Hello! I'm your Master Lingo assistant. I can help you plan trips or write blog articles. What would you like to do?",
                "ar-SA": "مرحباً! أنا مساعدك الذكي ماستر لينجو. يمكنني مساعدتك في التخطيط للرحلات أو كتابة المقالات. ماذا تريد أن تفعل؟",
                "zh-CN": "你好！我是你的智能助手Master Lingo。我可以帮助你规划旅行或撰写博客文章。你想做什么？",
                "es-ES": "¡Hola! Soy tu asistente Master Lingo. Puedo ayudarte a planificar viajes o escribir artículos de blog. ¿Qué te gustaría hacer?",
                "fr-FR": "Bonjour ! Je suis votre assistant Master Lingo. Je peux vous aider à planifier des voyages ou à écrire des articles de blog. Que souhaitez-vous faire ?",
                "de-DE": "Hallo! Ich bin Ihr Master Lingo Assistent. Ich kann Ihnen bei der Reiseplanung oder beim Schreiben von Blog-Artikeln helfen. Was möchten Sie tun?",
                "hi-IN": "नमस्ते! मैं आपका मास्टर लिंगो असिस्टेंट हूँ। मैं आपकी यात्रा की योजना बनाने या ब्लॉग लेख लिखने में मदद कर सकता हूँ। आप क्या करना चाहेंगे?",
                "ja-JP": "こんにちは！私はあなたのマスター・リンゴ・アシスタントです。旅行の計画やブログ記事の執筆をお手伝いできます。何をしたいですか？",
                "ko-KR": "안녕하세요! 저는 당신의 마스터 링고 어시스턴트입니다. 여행 계획이나 블로그 글 작성을 도와드릴 수 있습니다. 무엇을 하고 싶으신가요?",
                "pt-BR": "Olá! Eu sou seu assistente Master Lingo. Posso ajudá-lo a planejar viagens ou escrever artigos de blog. O que você gostaria de fazer?",
                "ru-RU": "Привет! Я ваш помощник Master Lingo. Я могу помочь вам спланировать поездки или написать статьи для блога. Что бы вы хотели сделать?",
                "it-IT": "Ciao! Sono il tuo assistente Master Lingo. Posso aiutarti a pianificare viaggi o scrivere articoli per blog. Cosa vorresti fare?",
                "ur-PK": "السلام علیکم! میں آپ کا ماسٹر لنگو اسسٹنٹ ہوں۔ میں آپ کی سفر کی منصوبہ بندی یا بلاگ آرٹیکل لکھنے میں مدد کر سکتا ہوں۔ آپ کیا کرنا چاہیں گے؟"
            },
            "hello": {
                "en-US": "Hello! I'm your Master Lingo assistant. How can I help you today?",
                "en-GB": "Hello! I'm your Master Lingo assistant. How can I help you today?",
                "ar-SA": "مرحباً! أنا مساعدك ماستر لينجو. كيف يمكنني مساعدتك اليوم؟",
                "zh-CN": "你好！我是你的Master Lingo助手。今天我能为你做什么？",
                "es-ES": "¡Hola! Soy tu asistente Master Lingo. ¿Cómo puedo ayudarte hoy?",
                "fr-FR": "Bonjour ! Je suis votre assistant Master Lingo. Comment puis-je vous aider aujourd'hui ?",
                "de-DE": "Hallo! Ich bin Ihr Master Lingo Assistent. Wie kann ich Ihnen heute helfen?",
                "hi-IN": "नमस्ते! मैं आपका मास्टर लिंगो असिस्टेंट हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
                "ja-JP": "こんにちは！私はあなたのマスター・リンゴ・アシスタントです。今日はどのようにお手伝いできますか？",
                "ko-KR": "안녕하세요! 저는 당신의 마스터 링고 어시스턴트입니다. 오늘 어떻게 도와드릴까요?",
                "pt-BR": "Olá! Eu sou seu assistente Master Lingo. Como posso ajudá-lo hoje?",
                "ru-RU": "Привет! Я ваш помощник Master Lingo. Как я могу помочь вам сегодня?",
                "it-IT": "Ciao! Sono il tuo assistente Master Lingo. Come posso aiutarti oggi?",
                "ur-PK": "السلام علیکم! میں آپ کا ماسٹر لنگو اسسٹنٹ ہوں۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟"
            },
            "thanks": {
                "en-US": "You're welcome! Is there anything else I can help you with today?",
                "en-GB": "You're welcome! Is there anything else I can help you with today?",
                "ar-SA": "على الرحب والسعة! هل هناك أي شيء آخر يمكنني مساعدتك فيه اليوم؟",
                "zh-CN": "不客气！今天还有什么我可以帮助你的吗？",
                "es-ES": "¡De nada! ¿Hay algo más en lo que pueda ayudarte hoy?",
                "fr-FR": "De rien ! Y a-t-il autre chose avec laquelle je peux vous aider aujourd'hui ?",
                "de-DE": "Gern geschehen! Gibt es noch etwas anderes, womit ich Ihnen heute helfen kann?",
                "hi-IN": "आपका स्वागत है! क्या आज कोई और चीज़ है जिसमें मैं आपकी मदद कर सकता हूँ?",
                "ja-JP": "どういたしまして！今日他に何かお手伝いできることはありますか？",
                "ko-KR": "천만에요! 오늘 제가 도와드릴 다른 일이 있나요?",
                "pt-BR": "De nada! Há mais alguma coisa com que eu possa ajudá-lo hoje?",
                "ru-RU": "Пожалуйста! Есть ли что-то еще, с чем я могу помочь вам сегодня?",
                "it-IT": "Prego! C'è qualcos'altro con cui posso aiutarti oggi?",
                "ur-PK": "خوش آمدید! کیا آج کوئی اور چیز ہے جس میں میں آپ کی مدد کر سکتا ہوں؟"
            }
        }
        
        # Get the appropriate greeting
        greeting_dict = greetings.get(greeting_type, greetings["initial"])
        return greeting_dict.get(lang_code, greeting_dict["en-US"])  # Fallback to English
    
    async def start(self):
        """Start the Master Lingo Agent"""
        logger.info("Starting Master Lingo Agent")
        
        # Start voice listening
        success = await self.voice_handler.start_continuous_recognition(
            on_transcript=self._handle_transcript
        )
        
        if success:
            self.state = ConversationState.LISTENING
            # Use multilingual greeting based on current voice
            greeting = self._get_multilingual_greeting("initial")
            await self._speak(greeting)
        else:
            logger.error("Failed to start voice handler")
    
    async def stop(self):
        """Stop the Master Lingo Agent"""
        logger.info("Stopping Master Lingo Agent")
        
        # Set state to idle first to prevent any new processing
        self.state = ConversationState.IDLE
        
        # Stop listening
        if hasattr(self.voice_handler, 'stop_listening'):
            await self.voice_handler.stop_listening()
        
        # Stop any ongoing speech
        if hasattr(self.voice_handler, 'stop_speaking'):
            await self.voice_handler.stop_speaking()
        
        logger.info("Master Lingo Agent stopped successfully")
    
    async def lingo_api_launch(self, team_domain: str, request: str, priority: str = "high") -> Optional[Dict[str, Any]]:
        """
        Launch a workflow using the same API as manual forms
        This ensures voice-triggered workflows use the same backend path as manual submissions
        """
        try:
            import aiohttp
            import json
            
            # Format request to specify team (same as frontend lingo API)
            team_request = f"[TEAM: {team_domain}] {request}"
            
            # Prepare task request (same format as frontend)
            task_request = {
                "user_id": "lingo-agent-001",
                "request": team_request,
                "priority": priority
            }
            
            # Make API call to backend tasks endpoint
            async with aiohttp.ClientSession() as session:
                backend_url = os.getenv("BACKEND_URL", "http://localhost:8004")
                url = f"{backend_url}/api/tasks"
                
                logger.info(f"🚀 Launching {team_domain} workflow via lingo API: {team_request}")
                
                async with session.post(
                    url,
                    json=task_request,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"✅ Workflow launched successfully: {result}")
                        return result
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Failed to launch workflow: {response.status} - {error_text}")
                        return None
                        
        except Exception as e:
            logger.error(f"❌ Error in lingo_api_launch: {e}")
            return None
    
    async def _handle_transcript(self, text: str, is_final: bool):
        """Handle incoming transcript from voice"""
        if not is_final:
            # Show interim results in UI
            if self.on_update_ui:
                if asyncio.iscoroutinefunction(self.on_update_ui):
                    await self.on_update_ui({"interim_transcript": text})
                else:
                    self.on_update_ui({"interim_transcript": text})
            return
        
        # Ignore if we're currently speaking (prevent echo loop)
        if self.currently_speaking or self.state == ConversationState.SPEAKING:
            logger.debug(f"🔇 Ignoring transcript while speaking: {text[:50]}...")
            return
        
        # STRONG echo detection - ignore if this sounds like what we just said
        text_lower = text.lower().strip()
        if self.last_spoken_text and len(self.last_spoken_text) > 5:
            last_spoken_lower = self.last_spoken_text.lower().strip()
            
            # Check multiple echo patterns
            echo_detected = False
            
            # Pattern 1: Exact match or very similar
            if text_lower == last_spoken_lower:
                echo_detected = True
            
            # Pattern 2: Contains significant portion (more than 50% overlap)
            elif len(text_lower) > 10 and len(last_spoken_lower) > 10:
                # Check if more than 50% of either text is contained in the other
                overlap1 = sum(1 for word in text_lower.split() if word in last_spoken_lower)
                overlap2 = sum(1 for word in last_spoken_lower.split() if word in text_lower)
                text_words = len(text_lower.split())
                spoken_words = len(last_spoken_lower.split())
                
                if (overlap1 / max(text_words, 1)) > 0.5 or (overlap2 / max(spoken_words, 1)) > 0.5:
                    echo_detected = True
            
            # Pattern 3: Starts with same phrase (first 20 characters)
            elif len(text_lower) > 20 and len(last_spoken_lower) > 20:
                if text_lower[:20] == last_spoken_lower[:20]:
                    echo_detected = True
            
            # Pattern 4: Contains agent-specific phrases that shouldn't come from user
            # ✅ REDUCED SENSITIVITY: Only block exact agent intro phrases
            agent_phrases = [
                "hello, i'm your master lingo assistant",
                "i'm your master lingo assistant"
            ]
            
            # Only block if it's an EXACT match or starts with these phrases
            for phrase in agent_phrases:
                if text_lower.startswith(phrase) or text_lower == phrase:
                    echo_detected = True
                    break
            
            if echo_detected:
                logger.info(f"🔇 ECHO DETECTED - Ignoring: {text[:50]}...")
                logger.debug(f"   Last spoken: {self.last_spoken_text[:50]}...")
                return
        
        # Ignore very short or empty transcripts
        if not text or len(text.strip()) < 3:
            return
        
        # Process final transcript
        logger.info(f"User said: {text}")
        self.conversation_history.append({"role": "user", "content": text})
        
        # ✅ Send user message to frontend chat (if callback exists)
        if hasattr(self, 'on_user_message') and self.on_user_message:
            try:
                if asyncio.iscoroutinefunction(self.on_user_message):
                    await self.on_user_message(text)
                else:
                    self.on_user_message(text)
            except Exception as e:
                logger.error(f"Error sending user message to frontend: {e}")
        
        # Process based on current state - schedule it properly
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.ensure_future(self._process_user_input(text))
            else:
                loop.create_task(self._process_user_input(text))
        except RuntimeError:
            # If no event loop, create one
            asyncio.run(self._process_user_input(text))
    
    async def _handle_interrupt(self):
        """Handle user interruption"""
        logger.info("User interrupted agent speech")
        self.state = ConversationState.LISTENING
        await self._speak("Yes? How can I help?")
    
    async def _process_user_input(self, text: str):
        """Process user input with Agent Lightning enhanced intelligence"""
        self.state = ConversationState.PROCESSING
        
        # Check if we're waiting for confirmation
        if self.collected_data.get("awaiting_confirmation"):
            await self._handle_confirmation(text)
            return
        
        # 🚀 LAYER 1: Try Agent Lightning FIRST (85-95% accuracy, 30-50x faster)
        logger.info(f"🔄 Processing with Agent Lightning enhanced intelligence: {text[:50]}...")
        
        # ✅ RE-ENABLED: Now using GPT Realtime Mini for robust conversation
        if AGENT_LIGHTNING_AVAILABLE:
            try:
                logger.info("⚡ Using Agent Lightning for enhanced processing...")
                bridge = get_agent_lightning_bridge()
                
                al_response = await bridge.process_message(
                    text=text,
                    user_id="voice_user",
                    use_agent_lightning=True
                )
                
                # Check if Agent Lightning provided a high-confidence response
                confidence = al_response.get('confidence', 0.0)
                intent = al_response.get('intent')
                
                if confidence >= 0.7:  # High confidence threshold
                    logger.info(f"⚡ AGENT LIGHTNING SUCCESS: {intent} (confidence: {confidence:.2f})")
                    
                    # Handle different intent types
                    if intent == 'question':
                        # User asked a general knowledge question - use Azure OpenAI to answer
                        logger.info(f"❓ General question detected: {text}")
                        answer = await self._answer_question_with_llm(text)
                        await self._speak(answer)
                        self.state = ConversationState.LISTENING
                        return

                    elif intent == 'greeting':
                        # User greeted the agent
                        await self._speak("Hello! I'm your Lingo Agent. I can help you with blog writing, travel planning, and more. What would you like to do?")
                        self.state = ConversationState.LISTENING
                        return
                    
                    elif intent == 'unclear':
                        # Low confidence or unclear intent - ask for clarification
                        await self._speak("I'm not sure what you'd like me to do. Could you rephrase that?")
                        self.state = ConversationState.LISTENING
                        return
                    
                    # Speak the response for other intents
                    message = al_response.get('message', '')
                    if message:
                        await self._speak(message)
                    
                    # Handle navigation if provided
                    if al_response.get('navigate_to'):
                        route = al_response.get('navigate_to')
                        mode = al_response.get('navigation_mode', 'direct')
                        data = al_response.get('navigation_data', {})
                        
                        logger.info(f"🧭 Agent Lightning Navigation: {route} (mode: {mode})")
                        
                        if self.on_navigate:
                            try:
                                logger.info(f"📞 Calling on_navigate callback with route: {route}")
                                if asyncio.iscoroutinefunction(self.on_navigate):
                                    await self.on_navigate({
                                        'route': route,
                                        'mode': mode,
                                        'data': data,
                                        'auto': True,
                                        'source': 'agent_lightning'
                                    })
                                else:
                                    self.on_navigate({
                                        'route': route,
                                        'mode': mode,
                                        'data': data,
                                        'auto': True,
                                        'source': 'agent_lightning'
                                    })
                                logger.info(f"✅ on_navigate callback completed")
                            except Exception as e:
                                logger.error(f"❌ Navigation error: {e}", exc_info=True)
                        else:
                            logger.warning(f"⚠️ on_navigate callback is None! Cannot navigate.")
                    
                    # Handle workflow if triggered
                    if al_response.get('workflow_started'):
                        workflow_type = al_response.get('workflow_type')
                        workflow_id = al_response.get('workflow_id')
                        workflow_data = al_response.get('navigation_data', {})
                        
                        logger.info(f"⚡ Agent Lightning Workflow: {workflow_type} (ID: {workflow_id})")
                        
                        if self.on_start_workflow:
                            try:
                                logger.info(f"📞 Calling on_start_workflow callback for: {workflow_type}")
                                if asyncio.iscoroutinefunction(self.on_start_workflow):
                                    await self.on_start_workflow({
                                        'type': workflow_type,
                                        'id': workflow_id,
                                        'data': workflow_data,
                                        'source': 'agent_lightning'
                                    })
                                else:
                                    self.on_start_workflow({
                                        'type': workflow_type,
                                        'id': workflow_id,
                                        'data': workflow_data,
                                        'source': 'agent_lightning'
                                    })
                                logger.info(f"✅ on_start_workflow callback completed")
                            except Exception as e:
                                logger.error(f"❌ Workflow start error: {e}", exc_info=True)
                        else:
                            logger.warning(f"⚠️ on_start_workflow callback is None! Cannot start workflow.")
                    
                    # Update UI with enhanced metadata
                    if self.on_update_ui:
                        await self.on_update_ui({
                            'message': message,
                            'intent': al_response.get('intent'),
                            'confidence': confidence,
                            'source': 'agent_lightning',
                            'agent_lightning_enhanced': True
                        })
                    
                    self.state = ConversationState.LISTENING
                    return
                else:
                    logger.info(f"⚠️ Agent Lightning low confidence ({confidence:.2f}), trying fallback...")
                    
            except Exception as e:
                logger.error(f"❌ Agent Lightning error: {e}, falling back...")
        
        # LAYER 2: Try Azure Intelligent Speech (pattern matching, instant response)
        try:
            # Register callbacks for Azure Intelligent Speech (including speak)
            self.azure_intelligent_speech.register_callbacks(
                on_navigate=self.on_navigate,
                on_start_workflow=self.on_start_workflow,
                on_update_ui=self.on_update_ui,
                on_speak=self._speak  # Pass the speak function
            )
            
            # Try Azure Speech intelligence (fast path)
            azure_result = await self.azure_intelligent_speech.process_voice_command(text)
            
            if azure_result.get("handled"):
                logger.info(f"⚡ AZURE HANDLED: {azure_result.get('type')} - Instant response!")
                self.state = ConversationState.LISTENING
                return
            
            elif azure_result.get("needs_llm_processing"):
                logger.info(f"🧠 NEEDS LLM: Falling back to GPT-4o for complex processing")
                # Continue to GPT-4o processing below
            
        except Exception as e:
            logger.error(f"Azure Intelligent Speech error: {e}")
            # Continue to GPT-4o processing as fallback
        
        # FALLBACK: Comprehensive conversation handling
        logger.info(f"🔄 Using fallback conversation processing...")
        
        # First, try to handle as general conversation/question
        text_lower = text.lower().strip()
        
        # Check for greetings and basic conversation
        if any(greeting in text_lower for greeting in ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]):
            # Simple, friendly greeting without overwhelming the user
            await self._speak("Hi! I can help you plan trips, write blogs, or edit images. What would you like to do?")
            self.state = ConversationState.LISTENING
            return
        
        elif any(thanks in text_lower for thanks in ["thanks", "thank you", "merci", "gracias", "danke", "شكرا", "谢谢", "धन्यवाद"]):
            response = self._get_multilingual_greeting("thanks")
            await self._speak(response)
            self.state = ConversationState.LISTENING
            return
        
        elif "you there" in text_lower or "are you there" in text_lower or "can you hear me" in text_lower:
            response = self._get_multilingual_greeting("hello")
            await self._speak(response)
            self.state = ConversationState.LISTENING
            return
        
        # Check if it's a question (contains question words or ends with ?)
        question_indicators = ["what", "how", "why", "when", "where", "who", "which", "can you", "do you", "are you", "will you", "?"]
        is_question = any(indicator in text_lower for indicator in question_indicators) or text.strip().endswith("?")
        
        if is_question:
            logger.info(f"❓ Detected question, using LLM to answer: {text}")
            answer = await self._answer_question_with_llm(text)
            await self._speak(answer)
            self.state = ConversationState.LISTENING
            return
        
        # If no specific pattern matched, try intent classification
        if self.current_agent is None:
            # Classify intent if no agent selected
            result = self.intent_classifier.classify(text)
            intent = result["intent"]
            
            if intent == IntentType.TRAVEL_PLANNING:
                await self._handle_travel_intent(result)
            
            elif intent == IntentType.BLOG_WRITING:
                await self._handle_blog_intent(result)
            
            elif intent == IntentType.AI_IMAGE:
                await self._handle_ai_image_intent(result)
            
            elif intent == IntentType.HELP:
                await self._handle_help_intent(result)
            
            elif intent == IntentType.GENERAL_KNOWLEDGE:
                await self._handle_general_knowledge_intent(result)
            
            elif intent == IntentType.CONVERSATION:
                await self._handle_conversation_intent(result)
            
            else:
                # Final fallback - try to answer as general question with LLM
                logger.info(f"🤔 No intent matched, trying LLM as final fallback: {text}")
                try:
                    answer = await self._answer_question_with_llm(text)
                    await self._speak(answer)
                except Exception as e:
                    logger.error(f"❌ Final LLM fallback failed: {e}")
                    # Use multilingual "I don't understand" response
                    fallback_response = self._get_multilingual_response("dont_understand")
                    await self._speak(fallback_response)
                
                self.state = ConversationState.LISTENING
        
        else:
            # Continue collecting information for current agent
            await self._collect_form_info(text)
    
    def _is_question(self, text: str) -> bool:
        """Check if text is a question"""
        text_lower = text.lower()
        question_words = ["what", "how", "why", "when", "where", "who", "which", "can you", "do you", "are you"]
        return any(word in text_lower for word in question_words) or text.endswith("?")

    async def _show_capability_cards(self):
        """Show what the agent can do"""
        logger.info("📋 Showing capability cards")
        
        if self.on_update_ui:
            try:
                await self.on_update_ui({
                    "type": "show_suggestion_cards",
                    "message": "I can help you with:",
                    "cards": [
                        {
                            "id": "travel-card",
                            "title": "Travel Planning",
                            "description": "Plan your perfect trip with AI assistance",
                            "icon": "plane",
                            "action": "navigate",
                            "destination": "travel-team"
                        },
                        {
                            "id": "blog-card",
                            "title": "Blog Writing",
                            "description": "Create SEO-optimized blog articles",
                            "icon": "pen",
                            "action": "navigate",
                            "destination": "blog-team"
                        },
                        {
                            "id": "image-card",
                            "title": "AI Image Editing",
                            "description": "Edit images with Nano Banana Studio",
                            "icon": "image",
                            "action": "navigate",
                            "destination": "ai-image"
                        }
                    ]
                })
                logger.info("✅ Capability cards sent to frontend")
            except Exception as e:
                logger.error(f"❌ Error showing capability cards: {e}")

    async def _show_travel_suggestion_card(self, result: Dict[str, Any]):
        """Show travel planning suggestion card"""
        entities = result.get("entities", {})
        destination = entities.get("destination", "your destination")
        
        message = f"I can help you plan a trip to {destination}!"
        logger.info(f"🧳 Showing travel card for: {destination}")
        
        if self.on_update_ui:
            try:
                await self.on_update_ui({
                    "type": "show_suggestion_cards",
                    "message": message,
                    "cards": [
                        {
                            "id": "travel-card",
                            "title": "Travel Planning",
                            "description": f"Plan your trip to {destination}",
                            "icon": "plane",
                            "action": "navigate",
                            "destination": "travel-team",
                            "data": entities
                        }
                    ]
                })
                logger.info("✅ Travel card sent to frontend")
            except Exception as e:
                logger.error(f"❌ Error showing travel card: {e}")

    async def _show_blog_suggestion_card(self, result: Dict[str, Any]):
        """Show blog writing suggestion card"""
        entities = result.get("entities", {})
        topic = entities.get("topic", "your topic")
        
        message = f"I can help you write a blog about {topic}!"
        logger.info(f"📝 Showing blog card for: {topic}")
        
        if self.on_update_ui:
            try:
                await self.on_update_ui({
                    "type": "show_suggestion_cards",
                    "message": message,
                    "cards": [
                        {
                            "id": "blog-card",
                            "title": "Blog Writing",
                            "description": f"Write about {topic}",
                            "icon": "pen",
                            "action": "navigate",
                            "destination": "blog-team",
                            "data": entities
                        }
                    ]
                })
                logger.info("✅ Blog card sent to frontend")
            except Exception as e:
                logger.error(f"❌ Error showing blog card: {e}")

    async def _show_image_suggestion_card(self, result: Dict[str, Any]):
        """Show AI image suggestion card"""
        entities = result.get("entities", {})
        feature = entities.get("feature", "nano_banana")
        
        message = "I can help you with AI image editing!"
        logger.info(f"🎨 Showing image card for: {feature}")
        
        if self.on_update_ui:
            try:
                await self.on_update_ui({
                    "type": "show_suggestion_cards",
                    "message": message,
                    "cards": [
                        {
                            "id": "image-card",
                            "title": "AI Image Editing",
                            "description": "Edit images with Nano Banana Studio",
                            "icon": "image",
                            "action": "navigate",
                            "destination": "ai-image",
                            "data": entities
                        }
                    ]
                })
                logger.info("✅ Image card sent to frontend")
            except Exception as e:
                logger.error(f"❌ Error showing image card: {e}")

    async def _handle_travel_intent(self, result: Dict[str, Any]):
        """Handle travel planning intent - SHOW SUGGESTION CARD (NO IMMEDIATE WORKFLOW)"""
        # ✅ NEW: Show suggestion card instead of starting workflow
        await self._show_travel_suggestion_card(result)
        self.state = ConversationState.LISTENING
        return
    
    async def _handle_blog_intent(self, result: Dict[str, Any]):
        """Handle blog writing intent - SHOW SUGGESTION CARD (NO IMMEDIATE WORKFLOW)"""
        # ✅ NEW: Show suggestion card instead of starting workflow
        await self._show_blog_suggestion_card(result)
        self.state = ConversationState.LISTENING
        return
    
    async def _collect_blog_info(self, text: str):
        """Collect blog form information through conversation"""
        # Use the unified form collection system
        self.current_agent = "blog"
        await self._collect_form_info(text)
    
    async def _collect_travel_info(self, text: str):
        """Collect travel information through conversation"""
        # Simplified - expand based on your travel form needs
        self.collected_data["destination"] = text
        
        await self._speak(f"Great! Planning your trip to {text}. Let me start the travel planning workflow.")
        
        if self.on_start_workflow:
            self.on_start_workflow("travel", self.collected_data)
        
        self.state = ConversationState.DELEGATING
        self.current_intent = None
        self.collected_data = {}
    
    async def _handle_ai_image_intent(self, result: Dict[str, Any]):
        """Handle AI image intent - DIRECT NAVIGATION"""
        self.current_intent = IntentType.AI_IMAGE
        entities = result["entities"]
        
        feature = entities.get("feature", "nano_banana")
        prompt = entities.get("prompt")
        
        # Create user-friendly feature names and navigation routes (use view names, not routes)
        feature_info = {
            "nano_banana": {"name": "Nano Banana Image Studio", "view": "ai-image", "tab": "nano-banana"},
            "remove_background": {"name": "Background Removal", "view": "ai-image", "tab": "remove-background"},
            "product_shot": {"name": "Product Photography", "view": "ai-image", "tab": "product-shot"},
            "logo_generation": {"name": "Logo Generation", "view": "ai-image", "tab": "logo-generation"},
            "virtual_tryon": {"name": "Virtual Try-On", "view": "virtual-try-on"},
            "combine_images": {"name": "Image Combination", "view": "ai-image", "tab": "combine-images"},
            "vision": {"name": "Image Analysis", "view": "ai-image", "tab": "vision"}
        }
        
        info = feature_info.get(feature, {"name": "AI Image tools", "view": "ai-image"})
        
        # Navigate directly to the specific tool (same as nav menu)
        await self._speak(f"Opening {info['name']} for you now.")
        
        if self.on_navigate:
            try:
                navigation_data = {
                    "auto": True,
                    "source": "voice_command"
                }
                
                # Add tab information if available
                if "tab" in info:
                    navigation_data["tab"] = info["tab"]
                
                # Add prompt if provided
                if prompt:
                    navigation_data["prompt"] = prompt
                
                # Navigate using view name (same as sidebar navigation)
                if asyncio.iscoroutinefunction(self.on_navigate):
                    await self.on_navigate(info["view"], navigation_data)
                else:
                    self.on_navigate(info["view"], navigation_data)
                    
                logger.info(f"✅ Navigated to {info['name']} view: {info['view']}")
            except Exception as e:
                logger.error(f"❌ Navigation error: {e}")
                await self._speak("I had trouble opening that tool. Please try clicking on it manually.")
        
        self.state = ConversationState.LISTENING

    async def _answer_question_with_llm(self, question: str) -> str:
        """Answer general knowledge questions using Azure OpenAI"""
        try:
            if not self.azure_openai_client:
                return "I'm sorry, I don't have access to answer general questions right now. I can help you with blog writing, travel planning, or AI image generation though!"
            
            # Use Azure OpenAI to answer the question
            response = self.azure_openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful AI assistant. Provide concise, accurate answers to user questions. Keep responses under 3 sentences when possible."
                    },
                    {
                        "role": "user",
                        "content": question
                    }
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            answer = response.choices[0].message.content.strip()
            logger.info(f"✅ Answered question: {question[:50]}... → {answer[:50]}...")
            return answer
            
        except Exception as e:
            logger.error(f"❌ Error answering question: {e}")
            return "I'm having trouble answering that right now. Could you try rephrasing your question?"
    
    async def _handle_confirmation(self, text: str):
        """Handle user confirmation for detected intent"""
        text_lower = text.lower().strip()
        confirmation_type = self.collected_data.get("awaiting_confirmation")
        
        # Check for positive confirmation
        if any(word in text_lower for word in ["yes", "yeah", "yep", "sure", "okay", "ok", "correct", "right", "exactly"]):
            if confirmation_type == "travel":
                destination = self.collected_data.get("pending_destination")
                await self._speak(f"Perfect! Opening the travel planning dashboard for your trip to {destination}.")
                
                # Navigate to travel team
                if self.on_navigate:
                    try:
                        if asyncio.iscoroutinefunction(self.on_navigate):
                            await self.on_navigate("travel")
                        else:
                            self.on_navigate("travel")
                        logger.info("Navigated to travel team")
                    except Exception as e:
                        logger.error(f"Navigation error: {e}")
                
                # Start travel workflow
                if self.on_start_workflow:
                    try:
                        workflow_data = {"destination": destination}
                        if asyncio.iscoroutinefunction(self.on_start_workflow):
                            await self.on_start_workflow("travel", workflow_data)
                        else:
                            self.on_start_workflow("travel", workflow_data)
                        logger.info(f"Started travel workflow with data: {workflow_data}")
                    except Exception as e:
                        logger.error(f"Workflow start error: {e}")
                
                self.state = ConversationState.DELEGATING
            
            elif confirmation_type == "blog":
                topic = self.collected_data.get("pending_topic")
                await self._speak(f"Great! Opening the blog writing dashboard for your article about {topic}.")
                
                # Navigate to blog team
                if self.on_navigate:
                    try:
                        if asyncio.iscoroutinefunction(self.on_navigate):
                            await self.on_navigate("blog")
                        else:
                            self.on_navigate("blog")
                        logger.info("Navigated to blog team")
                    except Exception as e:
                        logger.error(f"Navigation error: {e}")
                
                # Start collecting blog form data
                self.state = ConversationState.COLLECTING_INFO
                self.current_field_index = 1  # Skip topic since we have it
                self.collected_data["topic"] = topic
                
                # Ask next question
                await self._ask_next_blog_question()
            
            elif confirmation_type == "ai_image":
                feature = self.collected_data.get("pending_feature")
                prompt = self.collected_data.get("pending_prompt")
                
                await self._speak(f"Perfect! Opening the AI Image dashboard for you.")
                
                # Navigate to AI Image suite
                if self.on_navigate:
                    try:
                        if asyncio.iscoroutinefunction(self.on_navigate):
                            await self.on_navigate("ai-image")
                        else:
                            self.on_navigate("ai-image")
                        logger.info("Navigated to AI Image suite")
                    except Exception as e:
                        logger.error(f"Navigation error: {e}")
                
                # Start AI Image workflow
                if self.on_start_workflow:
                    try:
                        workflow_data = {"feature": feature}
                        if prompt:
                            workflow_data["prompt"] = prompt
                        if asyncio.iscoroutinefunction(self.on_start_workflow):
                            await self.on_start_workflow("ai_image", workflow_data)
                        else:
                            self.on_start_workflow("ai_image", workflow_data)
                        logger.info(f"Started AI Image workflow with data: {workflow_data}")
                    except Exception as e:
                        logger.error(f"Workflow start error: {e}")
                
                self.state = ConversationState.DELEGATING
            
            # Clear confirmation state
            self.collected_data.pop("awaiting_confirmation", None)
            self.collected_data.pop("pending_destination", None)
            self.collected_data.pop("pending_topic", None)
            self.collected_data.pop("pending_feature", None)
            self.collected_data.pop("pending_prompt", None)
        
        # Check for negative confirmation
        elif any(word in text_lower for word in ["no", "nope", "not", "wrong", "different", "something else"]):
            await self._speak("No problem! What would you like me to help you with instead? I can assist with travel planning, blog writing, or AI image tools.")
            
            # Clear confirmation state
            self.collected_data.pop("awaiting_confirmation", None)
            self.collected_data.pop("pending_destination", None)
            self.collected_data.pop("pending_topic", None)
            self.collected_data.pop("pending_feature", None)
            self.collected_data.pop("pending_prompt", None)
            self.current_intent = None
            self.state = ConversationState.LISTENING
        
        else:
            # Check if user is trying to start over or ask something else
            if any(phrase in text_lower for phrase in ["you there", "hello", "hi", "hey", "start over", "reset", "help", "what can you do"]):
                # User wants to start fresh
                await self._speak("Hi! Let me start over. I can help you with travel planning, blog writing, or AI image tools. What would you like to do?")
                
                # Clear confirmation state
                self.collected_data.pop("awaiting_confirmation", None)
                self.collected_data.pop("pending_destination", None)
                self.collected_data.pop("pending_topic", None)
                self.collected_data.pop("pending_feature", None)
                self.collected_data.pop("pending_prompt", None)
                self.current_intent = None
                self.state = ConversationState.LISTENING
            else:
                # Unclear response - ask again but with more options
                await self._speak("I didn't catch that. Please say 'yes' to confirm, 'no' if you meant something else, or 'help' to start over.")
                self.state = ConversationState.COLLECTING_INFO

    async def _answer_question_with_llm(self, query: str) -> str:
        """Answer general questions using Azure OpenAI with multilingual support"""
        if not self.azure_openai_client:
            return self._get_multilingual_response("no_llm_available")
        
        try:
            logger.info(f"🌍 Answering question with LLM: {query}")
            
            # Get current language for system prompt
            lang_code = getattr(self, 'current_language', 'en-US')
            
            # Create multilingual system prompt
            system_prompt = self._get_multilingual_system_prompt(lang_code)
            
            deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o")
            
            response = self.azure_openai_client.chat.completions.create(
                model=deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": query
                    }
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            answer = response.choices[0].message.content.strip()
            logger.info(f"✅ LLM Response: {answer[:100]}...")
            return answer
            
        except Exception as e:
            logger.error(f"❌ Error in LLM processing: {e}")
            return self._get_multilingual_response("llm_error")
    
    def _get_multilingual_system_prompt(self, lang_code: str) -> str:
        """Get system prompt in the appropriate language"""
        prompts = {
            "en-US": "You are Master Lingo, a helpful multilingual AI assistant. Respond in English. Provide concise, accurate answers. Keep responses under 150 words and conversational. You can help with travel planning, blog writing, and AI image tools.",
            "ar-SA": "أنت ماستر لينجو، مساعد ذكي متعدد اللغات. أجب باللغة العربية. قدم إجابات دقيقة ومختصرة. اجعل الردود أقل من 150 كلمة ومحادثة. يمكنك المساعدة في التخطيط للسفر وكتابة المدونات وأدوات الصور الذكية.",
            "zh-CN": "你是Master Lingo，一个有用的多语言AI助手。用中文回答。提供简洁准确的答案。回答保持在150字以内，要有对话感。你可以帮助旅行规划、博客写作和AI图像工具。",
            "es-ES": "Eres Master Lingo, un asistente de IA multilingüe útil. Responde en español. Proporciona respuestas concisas y precisas. Mantén las respuestas bajo 150 palabras y conversacionales. Puedes ayudar con planificación de viajes, escritura de blogs y herramientas de imágenes AI.",
            "fr-FR": "Tu es Master Lingo, un assistant IA multilingue utile. Réponds en français. Fournis des réponses concises et précises. Garde les réponses sous 150 mots et conversationnelles. Tu peux aider avec la planification de voyages, l'écriture de blogs et les outils d'images IA.",
            "de-DE": "Du bist Master Lingo, ein hilfreicher mehrsprachiger KI-Assistent. Antworte auf Deutsch. Gib präzise, kurze Antworten. Halte Antworten unter 150 Wörtern und gesprächig. Du kannst bei Reiseplanung, Blog-Schreiben und KI-Bildtools helfen.",
            "hi-IN": "आप मास्टर लिंगो हैं, एक उपयोगी बहुभाषी AI सहायक। हिंदी में जवाब दें। संक्षिप्त, सटीक उत्तर प्रदान करें। उत्तर 150 शब्दों से कम और बातचीत के अंदाज में रखें। आप यात्रा योजना, ब्लॉग लेखन और AI इमेज टूल्स में मदद कर सकते हैं।",
            "ja-JP": "あなたはMaster Lingo、役立つ多言語AIアシスタントです。日本語で回答してください。簡潔で正確な答えを提供してください。回答は150語以下で会話的に保ってください。旅行計画、ブログ執筆、AI画像ツールでお手伝いできます。",
            "ko-KR": "당신은 Master Lingo, 유용한 다국어 AI 어시스턴트입니다. 한국어로 답변하세요. 간결하고 정확한 답변을 제공하세요. 답변은 150단어 이하로 대화체로 유지하세요. 여행 계획, 블로그 작성, AI 이미지 도구를 도울 수 있습니다.",
            "ur-PK": "آپ ماسٹر لنگو ہیں، ایک مفید کثیر لسانی AI اسسٹنٹ۔ اردو میں جواب دیں۔ مختصر، درست جوابات فراہم کریں۔ جوابات 150 الفاظ سے کم اور بات چیت کے انداز میں رکھیں۔ آپ سفری منصوبہ بندی، بلاگ لکھنے اور AI امیج ٹولز میں مدد کر سکتے ہیں۔"
        }
        
        return prompts.get(lang_code, prompts["en-US"])
    
    def _get_multilingual_response(self, response_type: str) -> str:
        """Get predefined responses in the current language"""
        lang_code = getattr(self, 'current_language', 'en-US')
        
        responses = {
            "no_llm_available": {
                "en-US": "I'm primarily designed to help with travel planning, blog writing, and AI image tools. For general questions, I recommend using a dedicated search engine.",
                "ar-SA": "أنا مصمم بشكل أساسي للمساعدة في التخطيط للسفر وكتابة المدونات وأدوات الصور الذكية. للأسئلة العامة، أنصح باستخدام محرك بحث مخصص.",
                "zh-CN": "我主要是为了帮助旅行规划、博客写作和AI图像工具而设计的。对于一般问题，我建议使用专门的搜索引擎。",
                "es-ES": "Estoy diseñado principalmente para ayudar con planificación de viajes, escritura de blogs y herramientas de imágenes AI. Para preguntas generales, recomiendo usar un motor de búsqueda dedicado.",
                "fr-FR": "Je suis principalement conçu pour aider avec la planification de voyages, l'écriture de blogs et les outils d'images IA. Pour les questions générales, je recommande d'utiliser un moteur de recherche dédié.",
                "de-DE": "Ich bin hauptsächlich dafür entwickelt, bei Reiseplanung, Blog-Schreiben und KI-Bildtools zu helfen. Für allgemeine Fragen empfehle ich eine dedizierte Suchmaschine.",
                "hi-IN": "मैं मुख्य रूप से यात्रा योजना, ब्लॉग लेखन और AI इमेज टूल्स में मदद के लिए डिज़ाइन किया गया हूँ। सामान्य प्रश्नों के लिए, मैं एक समर्पित सर्च इंजन का उपयोग करने की सलाह देता हूँ।",
                "ja-JP": "私は主に旅行計画、ブログ執筆、AI画像ツールのお手伝いをするために設計されています。一般的な質問については、専用の検索エンジンの使用をお勧めします。",
                "ko-KR": "저는 주로 여행 계획, 블로그 작성, AI 이미지 도구를 돕기 위해 설계되었습니다. 일반적인 질문의 경우 전용 검색 엔진 사용을 권장합니다。",
                "ur-PK": "میں بنیادی طور پر سفری منصوبہ بندی، بلاگ لکھنے اور AI امیج ٹولز میں مدد کے لیے ڈیزائن کیا گیا ہوں۔ عام سوالات کے لیے، میں ایک مخصوص سرچ انجن استعمال کرنے کی تجویز کرتا ہوں۔"
            },
            "llm_error": {
                "en-US": "I'm having trouble answering that right now. I'm best at helping with travel planning, blog writing, and AI image tools. Would you like help with any of those?",
                "ar-SA": "أواجه صعوبة في الإجابة على ذلك الآن. أنا الأفضل في المساعدة في التخطيط للسفر وكتابة المدونات وأدوات الصور الذكية. هل تريد المساعدة في أي من هذه؟",
                "zh-CN": "我现在无法回答这个问题。我最擅长帮助旅行规划、博客写作和AI图像工具。您需要这些方面的帮助吗？",
                "es-ES": "Tengo problemas para responder eso ahora. Soy mejor ayudando con planificación de viajes, escritura de blogs y herramientas de imágenes AI. ¿Te gustaría ayuda con alguno de esos?",
                "fr-FR": "J'ai du mal à répondre à cela maintenant. Je suis meilleur pour aider avec la planification de voyages, l'écriture de blogs et les outils d'images IA. Aimeriez-vous de l'aide avec l'un de ceux-ci?",
                "de-DE": "Ich habe Schwierigkeiten, das jetzt zu beantworten. Ich bin am besten bei Reiseplanung, Blog-Schreiben und KI-Bildtools. Möchten Sie Hilfe bei einem davon?",
                "hi-IN": "मुझे अभी इसका जवाब देने में परेशानी हो रही है। मैं यात्रा योजना, ब्लॉग लेखन और AI इमेज टूल्स में मदद करने में सबसे अच्छा हूँ। क्या आपको इनमें से किसी में मदद चाहिए?",
                "ja-JP": "今それにお答えするのに困っています。私は旅行計画、ブログ執筆、AI画像ツールのお手伝いが得意です。これらのいずれかでお手伝いしましょうか？",
                "ko-KR": "지금 그것에 대답하는 데 문제가 있습니다. 저는 여행 계획, 블로그 작성, AI 이미지 도구를 돕는 것이 가장 좋습니다. 이 중 어느 것에 도움이 필요하신가요?",
                "ur-PK": "مجھے اس وقت اس کا جواب دینے میں مشکل ہو رہی ہے۔ میں سفری منصوبہ بندی، بلاگ لکھنے اور AI امیج ٹولز میں مدد کرنے میں بہترین ہوں۔ کیا آپ کو ان میں سے کسی میں مدد چاہیے؟"
            },
            "dont_understand": {
                "en-US": "I'm not sure what you want me to do. I can help you plan a trip, write a blog article, or work with AI images. Which would you like?",
                "ar-SA": "لست متأكداً مما تريد مني أن أفعله. يمكنني مساعدتك في التخطيط لرحلة أو كتابة مقال مدونة أو العمل مع صور الذكاء الاصطناعي. أيهما تريد؟",
                "zh-CN": "我不确定您想让我做什么。我可以帮您规划旅行、写博客文章或处理AI图像。您想要哪个？",
                "es-ES": "No estoy seguro de lo que quieres que haga. Puedo ayudarte a planificar un viaje, escribir un artículo de blog o trabajar con imágenes AI. ¿Cuál te gustaría?",
                "fr-FR": "Je ne suis pas sûr de ce que vous voulez que je fasse. Je peux vous aider à planifier un voyage, écrire un article de blog ou travailler avec des images IA. Lequel aimeriez-vous?",
                "de-DE": "Ich bin mir nicht sicher, was Sie von mir wollen. Ich kann Ihnen bei der Reiseplanung, beim Schreiben eines Blog-Artikels oder bei der Arbeit mit KI-Bildern helfen. Was möchten Sie?",
                "hi-IN": "मुझे यकीन नहीं है कि आप मुझसे क्या करवाना चाहते हैं। मैं आपकी यात्रा की योजना बनाने, ब्लॉग लेख लिखने या AI इमेज के साथ काम करने में मदद कर सकता हूँ। आप कौन सा चाहेंगे?",
                "ja-JP": "何をお手伝いすればよいかわかりません。旅行の計画、ブログ記事の執筆、AI画像の作業をお手伝いできます。どちらがよろしいですか？",
                "ko-KR": "무엇을 도와드려야 할지 확실하지 않습니다. 여행 계획, 블로그 기사 작성, AI 이미지 작업을 도와드릴 수 있습니다. 어느 것을 원하시나요?",
                "ur-PK": "مجھے یقین نہیں ہے کہ آپ مجھ سے کیا کرنا چاہتے ہیں۔ میں آپ کی سفر کی منصوبہ بندی، بلاگ آرٹیکل لکھنے یا AI امیجز کے ساتھ کام کرنے میں مدد کر سکتا ہوں۔ آپ کون سا چاہیں گے؟"
            }
        }
        
        response_dict = responses.get(response_type, responses["llm_error"])
        return response_dict.get(lang_code, response_dict["en-US"])

    async def _handle_general_knowledge_intent(self, result: Dict[str, Any]):
        """Handle general knowledge queries using Azure OpenAI"""
        query = result.get("entities", {}).get("query", result.get("raw_text", ""))
        answer = await self._answer_question_with_llm(query)
        await self._speak(answer)
        self.state = ConversationState.LISTENING
    
    async def _handle_help_intent(self, result: Dict[str, Any]):
        """Handle help request with multilingual support"""
        lang_code = getattr(self, 'current_language', 'en-US')
        
        help_responses = {
            "en-US": "I can help you with several things: Travel planning - say 'Plan a trip to London', Blog writing - say 'Write a blog about AI', AI Image tools - say 'Generate an image' or 'Create a logo'. What would you like to do?",
            "ar-SA": "يمكنني مساعدتك في عدة أشياء: التخطيط للسفر - قل 'خطط رحلة إلى لندن'، كتابة المدونات - قل 'اكتب مدونة عن الذكاء الاصطناعي'، أدوات الصور الذكية - قل 'أنشئ صورة' أو 'أنشئ شعار'. ماذا تريد أن تفعل؟",
            "zh-CN": "我可以帮助您做几件事：旅行规划 - 说'规划去伦敦的旅行'，博客写作 - 说'写一篇关于AI的博客'，AI图像工具 - 说'生成图像'或'创建标志'。您想做什么？",
            "es-ES": "Puedo ayudarte con varias cosas: Planificación de viajes - di 'Planifica un viaje a Londres', Escritura de blogs - di 'Escribe un blog sobre IA', Herramientas de imágenes IA - di 'Genera una imagen' o 'Crea un logo'. ¿Qué te gustaría hacer?",
            "fr-FR": "Je peux vous aider avec plusieurs choses : Planification de voyages - dites 'Planifiez un voyage à Londres', Écriture de blogs - dites 'Écrivez un blog sur l'IA', Outils d'images IA - dites 'Générez une image' ou 'Créez un logo'. Que souhaitez-vous faire ?",
            "de-DE": "Ich kann Ihnen bei mehreren Dingen helfen: Reiseplanung - sagen Sie 'Plane eine Reise nach London', Blog-Schreiben - sagen Sie 'Schreibe einen Blog über KI', KI-Bildtools - sagen Sie 'Generiere ein Bild' oder 'Erstelle ein Logo'. Was möchten Sie tun?",
            "hi-IN": "मैं आपकी कई चीजों में मदद कर सकता हूँ: यात्रा योजना - कहें 'लंदन की यात्रा की योजना बनाएं', ब्लॉग लेखन - कहें 'AI के बारे में ब्लॉग लिखें', AI इमेज टूल्स - कहें 'एक इमेज बनाएं' या 'एक लोगो बनाएं'। आप क्या करना चाहेंगे?",
            "ja-JP": "いくつかのことでお手伝いできます：旅行計画 - 'ロンドンへの旅行を計画して'と言ってください、ブログ執筆 - 'AIについてのブログを書いて'と言ってください、AI画像ツール - '画像を生成して'または'ロゴを作成して'と言ってください。何をしたいですか？",
            "ko-KR": "여러 가지를 도와드릴 수 있습니다: 여행 계획 - '런던 여행을 계획해줘'라고 말하세요, 블로그 작성 - 'AI에 대한 블로그를 써줘'라고 말하세요, AI 이미지 도구 - '이미지를 생성해줘' 또는 '로고를 만들어줘'라고 말하세요. 무엇을 하고 싶으신가요?",
            "ur-PK": "میں آپ کی کئی چیزوں میں مدد کر سکتا ہوں: سفری منصوبہ بندی - کہیں 'لندن کے سفر کی منصوبہ بندی کریں'، بلاگ لکھنا - کہیں 'AI کے بارے میں بلاگ لکھیں'، AI امیج ٹولز - کہیں 'ایک امیج بنائیں' یا 'ایک لوگو بنائیں'۔ آپ کیا کرنا چاہیں گے؟"
        }
        
        help_text = help_responses.get(lang_code, help_responses["en-US"])
        await self._speak(help_text)
        self.state = ConversationState.LISTENING
        """Handle help request"""
        
        # Check if this is an ambiguous request
        if result and result.get("entities", {}).get("ambiguous"):
            help_text = """I'd love to help! I can assist you with:
            
            • Travel planning - Planning trips, finding flights and hotels
            • Blog writing - Creating articles, SEO content, and posts
            • AI Image tools - Creating images, logos, removing backgrounds, product shots
            
            Which of these interests you, or would you like me to explain more about any of them?"""
        else:
            help_text = """I can help you with several things:
            
            • Travel planning - Say 'Plan a trip to London' or 'I want to visit Paris'
            • Blog writing - Say 'Write a blog about AI' or 'Create an article on healthy eating'  
            • AI Image tools - Say 'Generate an image of a sunset' or 'Create a logo for my company'
            
            What would you like to do?"""
        
        await self._speak(help_text)
        self.state = ConversationState.LISTENING
    
    async def _handle_conversation_intent(self, result: Dict[str, Any]):
        """Handle casual conversation and greetings"""
        text_lower = result["raw_text"].lower().strip()
        
        # Generate appropriate conversational responses
        if any(greeting in text_lower for greeting in ["hello", "hi", "hey"]):
            # Use multilingual greeting
            response = self._get_multilingual_greeting("hello")
        
        elif "you there" in text_lower or "are you there" in text_lower:
            # Use multilingual "hello" greeting for "are you there" responses
            response = self._get_multilingual_greeting("hello")
        
        elif any(thanks in text_lower for thanks in ["thanks", "thank you"]):
            response = self._get_multilingual_greeting("thanks")
        
        elif text_lower in ["okay", "ok", "sure", "alright", "cool", "nice", "great"]:
            response = "Great! What would you like to work on? I can help with travel planning, blog writing, or AI image creation."
        
        elif "how are you" in text_lower:
            response = "I'm doing great, thank you for asking! I'm ready to help you with whatever you need. What can I assist you with today?"
        
        else:
            # Generic conversational response
            response = "I'm here to help! I can assist you with travel planning, blog writing, or AI image creation. What would you like to do?"
        
        await self._speak(response)
        self.state = ConversationState.LISTENING
    
    async def handle_agent_selection(self, agent_id: str):
        """Handle agent selection from frontend"""
        logger.info(f"🎯 Agent selected: {agent_id}")
        
        self.current_agent = agent_id
        self.current_field_index = 0
        self.collected_data = {}
        
        # Map agent IDs to intents
        agent_intent_map = {
            "blog": "blog",
            "travel": "travel", 
            "social": "social",
            "avatar": "avatar",
            "product": "product",
            "web": "web",
            "marketing": "marketing",
            "code": "code"
        }
        
        self.current_intent = agent_intent_map.get(agent_id, agent_id)
        
        # Start form collection
        await self._ask_next_form_question()
    
    async def _collect_form_info(self, text: str):
        """Collect form information for current agent"""
        if self.current_agent not in self.agent_form_fields:
            await self._speak("I'm not sure how to help with that agent type yet. Please try Blog Writing or Travel Planning.")
            return
        
        fields = self.agent_form_fields[self.current_agent]
        
        # Check for skip
        if text.lower().strip() in ["skip", "skip it", "no", "none", "pass", "default"]:
            await self._speak("Okay, skipping that one.")
            self.current_field_index += 1
            await self._ask_next_form_question()
            return
        
        # Store the answer
        if self.current_field_index < len(fields):
            field = fields[self.current_field_index]
            self.collected_data[field["name"]] = text
            
            # Update UI with collected data
            if self.on_update_ui:
                ui_data = {
                    "form_data": self.collected_data,
                    "agent": self.current_agent,
                    "progress": f"{self.current_field_index + 1}/{len(fields)}"
                }
                if asyncio.iscoroutinefunction(self.on_update_ui):
                    await self.on_update_ui(ui_data)
                else:
                    self.on_update_ui(ui_data)
            
            self.current_field_index += 1
            await self._ask_next_form_question()
    
    async def _ask_next_form_question(self):
        """Ask the next question in form collection"""
        if self.current_agent not in self.agent_form_fields:
            return
        
        fields = self.agent_form_fields[self.current_agent]
        
        if self.current_field_index >= len(fields):
            # All questions asked, check if we have minimum required info
            required_fields = [f for f in fields if f.get("required", False)]
            missing_required = [f for f in required_fields if f["name"] not in self.collected_data]
            
            if missing_required:
                # Ask for missing required fields
                field = missing_required[0]
                await self._speak(f"I still need to know: {field['prompt']}")
                self.state = ConversationState.COLLECTING_INFO
            else:
                # Ready to start workflow
                await self._confirm_and_start_workflow()
        else:
            # Ask next question
            field = fields[self.current_field_index]
            question = field["prompt"]
            if not field.get("required", False):
                question += " (You can say 'skip' to use defaults)"
            
            await self._speak(question)
            self.state = ConversationState.COLLECTING_INFO
    
    async def _confirm_and_start_workflow(self):
        """Confirm collected data and start workflow"""
        # Generate confirmation message
        confirmation = f"Perfect! I have everything I need for your {self.current_agent} workflow:\n"
        
        for key, value in self.collected_data.items():
            if value and str(value).strip():
                confirmation += f"✓ {key.replace('_', ' ').title()}: {value}\n"
        
        confirmation += f"\n🚀 Starting your {self.current_agent} workflow now! You'll be redirected to the dashboard to track progress."
        
        await self._speak(confirmation)
        
        # Start workflow
        if self.on_start_workflow:
            try:
                if asyncio.iscoroutinefunction(self.on_start_workflow):
                    await self.on_start_workflow(self.current_agent, self.collected_data)
                else:
                    self.on_start_workflow(self.current_agent, self.collected_data)
                logger.info(f"Started {self.current_agent} workflow with data: {self.collected_data}")
            except Exception as e:
                logger.error(f"Workflow start error: {e}")
                await self._speak("I encountered an issue starting the workflow. Please try using the dashboard directly.")
        
        # Navigate to appropriate dashboard
        dashboard_map = {
            "blog": "blog-team",
            "travel": "travel-team",
            "social": "social",
            "avatar": "avatar"
        }
        
        dashboard = dashboard_map.get(self.current_agent, "lancers-teams")
        
        if self.on_navigate:
            try:
                if asyncio.iscoroutinefunction(self.on_navigate):
                    await self.on_navigate(dashboard)
                else:
                    self.on_navigate(dashboard)
                logger.info(f"Navigated to {dashboard}")
            except Exception as e:
                logger.error(f"Navigation error: {e}")
        
        # Reset state
        self.state = ConversationState.DELEGATING
        self.current_agent = None
        self.current_intent = None
        self.collected_data = {}
        self.current_field_index = 0

    async def _speak(self, text: str):
        """Speak text to user - FAST (no stop/start cycle)"""
        self.state = ConversationState.SPEAKING
        self.currently_speaking = True
        self.last_spoken_text = text.lower().strip()
        self.conversation_history.append({"role": "assistant", "content": text})
        
        # ✅ Send agent message to frontend chat (if callback exists)
        if hasattr(self, 'on_agent_message') and self.on_agent_message:
            try:
                intent = getattr(self, '_last_intent', None)
                confidence = getattr(self, '_last_confidence', None)
                if asyncio.iscoroutinefunction(self.on_agent_message):
                    await self.on_agent_message(text, intent, confidence)
                else:
                    self.on_agent_message(text, intent, confidence)
            except Exception as e:
                logger.error(f"Error sending agent message to frontend: {e}")
        
        # Update UI with agent response (use format expected by frontend)
        if self.on_update_ui:
            ui_data = {
                "type": "ui_update",
                "data": {
                    "message": text,
                    "intent": self.current_intent.value if self.current_intent else None,
                    "phase": self.state.value,
                    "agent_type": "master_lingo"
                }
            }
            if asyncio.iscoroutinefunction(self.on_update_ui):
                await self.on_update_ui(ui_data)
            else:
                self.on_update_ui(ui_data)
        
        logger.info(f"🗣️ Speaking: {text[:50]}...")
        
        # Only use voice if voice_handler exists and is properly initialized
        if hasattr(self, 'voice_handler') and self.voice_handler is not None:
            try:
                # Just speak - recognition continues (FAST!)
                await self.voice_handler.speak(text, interruptible=True)
                
                # LONGER delay to prevent echo pickup (especially for long messages)
                speech_duration = len(text) * 0.05  # Estimate 50ms per character
                delay = max(1.0, min(speech_duration, 3.0))  # Between 1-3 seconds
                
                logger.debug(f"⏳ Waiting {delay:.1f}s to prevent echo...")
                await asyncio.sleep(delay)
            except Exception as e:
                logger.warning(f"Voice handler error (text-only mode): {e}")
        else:
            # Text-only mode (WebSocket) - no voice, no delay
            logger.debug("📝 Text-only mode - skipping voice synthesis")
        
        # Return to listening state
        self.currently_speaking = False
        self.state = ConversationState.LISTENING
        logger.debug(f"👂 Ready to listen again")
    
    def set_voice(self, voice: str, language: str = "en"):
        """Change voice configuration"""
        self.voice_handler.set_voice(voice, language)
        # Store current voice and language for multilingual responses
        self.current_voice = voice
        self.current_language = language
        
        # Also set the recognition language to match the voice language
        # Extract language code from voice name (e.g., "en-US-AriaNeural" -> "en-US")
        if '-' in voice:
            voice_language = '-'.join(voice.split('-')[:2])
            self.voice_handler.set_language(voice_language)
            self.current_language = voice_language
        else:
            self.voice_handler.set_language(language)
    
    def get_available_voices(self) -> Dict[str, list]:
        """Get available voices"""
        return self.voice_handler.get_available_voices()
    
    def register_callbacks(
        self,
        on_navigate: Optional[Callable] = None,
        on_start_workflow: Optional[Callable] = None,
        on_update_ui: Optional[Callable] = None,
        on_user_message: Optional[Callable] = None,
        on_agent_message: Optional[Callable] = None
    ):
        """Register callbacks for UI control and chat display"""
        self.on_navigate = on_navigate
        self.on_start_workflow = on_start_workflow
        self.on_update_ui = on_update_ui
        self.on_user_message = on_user_message
        self.on_agent_message = on_agent_message

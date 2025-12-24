"""
Azure OpenAI Streaming LLM for Voice Conversations
Optimized for low-latency voice interactions
"""

import os
import asyncio
from typing import AsyncGenerator, Optional
from openai import AzureOpenAI
import logging

logger = logging.getLogger(__name__)


class AzureStreamingLLM:
    """
    Streaming LLM optimized for voice conversations
    Uses Azure OpenAI GPT-4o with streaming for < 1s latency
    """
    
    def __init__(
        self,
        azure_endpoint: Optional[str] = None,
        api_key: Optional[str] = None,
        deployment_name: str = "gpt-4o",
        api_version: str = "2024-02-15-preview"
    ):
        self.azure_endpoint = azure_endpoint or os.getenv("AZURE_OPENAI_ENDPOINT")
        self.api_key = api_key or os.getenv("AZURE_OPENAI_KEY")
        self.deployment_name = deployment_name
        self.api_version = api_version
        
        if not self.azure_endpoint or not self.api_key:
            logger.warning("Azure OpenAI credentials not configured")
            self.client = None
        else:
            self.client = AzureOpenAI(
                azure_endpoint=self.azure_endpoint,
                api_key=self.api_key,
                api_version=self.api_version
            )
        
        # Voice-optimized system prompt
        self.system_prompt = """You are a helpful voice assistant. 
Keep responses concise and conversational.
Speak naturally as if talking to a friend.
Avoid long explanations - users can ask follow-up questions.
Maximum 2-3 sentences per response unless specifically asked for more."""
        
        self.conversation_history = []
    
    async def generate_response(
        self,
        user_message: str,
        max_tokens: int = 150,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming response optimized for voice
        
        Args:
            user_message: User's input text
            max_tokens: Maximum response length (keep short for voice)
            temperature: Response creativity (0.7 is good for voice)
            
        Yields:
            Text chunks as they're generated
        """
        if not self.client:
            yield "I'm sorry, I'm not properly configured yet."
            return
        
        try:
            # Add user message to history
            self.conversation_history.append({
                "role": "user",
                "content": user_message
            })
            
            # Keep only last 10 messages for context
            if len(self.conversation_history) > 10:
                self.conversation_history = self.conversation_history[-10:]
            
            # Prepare messages
            messages = [
                {"role": "system", "content": self.system_prompt}
            ] + self.conversation_history
            
            # Stream response
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=True,  # CRITICAL for low latency
                presence_penalty=0.6,  # Avoid repetition
                frequency_penalty=0.3
            )
            
            # Collect full response for history
            full_response = ""
            
            # Stream chunks
            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    text_chunk = chunk.choices[0].delta.content
                    full_response += text_chunk
                    yield text_chunk
            
            # Add assistant response to history
            self.conversation_history.append({
                "role": "assistant",
                "content": full_response
            })
            
            logger.info(f"Generated response: {full_response[:100]}...")
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            yield "I'm having trouble responding right now. Could you try again?"
    
    async def generate_response_complete(
        self,
        user_message: str,
        max_tokens: int = 150,
        temperature: float = 0.7
    ) -> str:
        """
        Generate complete response (non-streaming)
        Use only when you need the full response before speaking
        """
        chunks = []
        async for chunk in self.generate_response(user_message, max_tokens, temperature):
            chunks.append(chunk)
        return "".join(chunks)
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
        logger.info("Conversation history cleared")
    
    def set_system_prompt(self, prompt: str):
        """Update system prompt"""
        self.system_prompt = prompt
        logger.info("System prompt updated")


class VoiceOptimizedLLM(AzureStreamingLLM):
    """
    Extended version with voice-specific optimizations
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Voice-specific settings
        self.sentence_buffer = ""
        self.min_words_per_chunk = 5  # Send to TTS every 5 words
    
    async def generate_voice_response(
        self,
        user_message: str,
        on_sentence: callable
    ):
        """
        Generate response optimized for voice output
        Calls on_sentence() for each complete sentence
        
        Args:
            user_message: User's input
            on_sentence: Callback function for each sentence
        """
        buffer = ""
        
        async for chunk in self.generate_response(user_message):
            buffer += chunk
            
            # Check for sentence boundaries
            if any(punct in chunk for punct in ['. ', '! ', '? ', '\n']):
                # Found sentence boundary
                sentences = buffer.split('. ')
                
                # Send complete sentences
                for i, sentence in enumerate(sentences[:-1]):
                    if sentence.strip():
                        await on_sentence(sentence.strip() + '.')
                
                # Keep incomplete sentence in buffer
                buffer = sentences[-1] if sentences else ""
        
        # Send remaining buffer
        if buffer.strip():
            await on_sentence(buffer.strip())
    
    async def generate_word_chunks(
        self,
        user_message: str,
        words_per_chunk: int = 5
    ) -> AsyncGenerator[str, None]:
        """
        Generate response in word chunks for immediate TTS
        
        Args:
            user_message: User's input
            words_per_chunk: Number of words per chunk
            
        Yields:
            Text chunks of specified word count
        """
        buffer = ""
        
        async for chunk in self.generate_response(user_message):
            buffer += chunk
            words = buffer.split()
            
            # Send chunks of N words
            while len(words) >= words_per_chunk:
                chunk_text = ' '.join(words[:words_per_chunk])
                yield chunk_text + ' '
                words = words[words_per_chunk:]
                buffer = ' '.join(words)
        
        # Send remaining words
        if buffer.strip():
            yield buffer.strip()


# Singleton instance
_llm_instance: Optional[VoiceOptimizedLLM] = None


def get_voice_llm() -> VoiceOptimizedLLM:
    """Get or create voice-optimized LLM instance"""
    global _llm_instance
    
    if _llm_instance is None:
        _llm_instance = VoiceOptimizedLLM()
    
    return _llm_instance

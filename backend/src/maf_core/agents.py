"""
Microsoft Agent Framework - Agent Implementation
Following the official MAF patterns and architecture
"""

import asyncio
import json
import uuid
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AgentMessage:
    """Message structure for agent communication"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str = ""
    recipient_id: str = ""
    content: Dict[str, Any] = field(default_factory=dict)
    message_type: str = "text"
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AgentContext:
    """Context information for agent execution"""
    conversation_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = ""
    session_data: Dict[str, Any] = field(default_factory=dict)
    memory: Dict[str, Any] = field(default_factory=dict)
    tools: List[str] = field(default_factory=list)

class BaseAgent(ABC):
    """
    Base Agent class following Microsoft Agent Framework patterns
    """
    
    def __init__(
        self,
        agent_id: str,
        name: str,
        description: str,
        capabilities: List[str] = None,
        tools: List[str] = None
    ):
        self.agent_id = agent_id
        self.name = name
        self.description = description
        self.capabilities = capabilities or []
        self.tools = tools or []
        self.is_active = False
        self.context: Optional[AgentContext] = None
        self.message_handlers: Dict[str, Callable] = {}
        self.middleware: List[Callable] = []
        
        # Agent state
        self.conversation_history: List[AgentMessage] = []
        self.memory: Dict[str, Any] = {}
        
        logger.info(f"Agent {self.name} ({self.agent_id}) initialized")
    
    async def start(self, context: AgentContext = None) -> bool:
        """Start the agent with optional context"""
        try:
            self.context = context or AgentContext()
            self.is_active = True
            await self._on_start()
            logger.info(f"Agent {self.name} started successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to start agent {self.name}: {e}")
            return False
    
    async def stop(self) -> None:
        """Stop the agent"""
        try:
            await self._on_stop()
            self.is_active = False
            logger.info(f"Agent {self.name} stopped")
        except Exception as e:
            logger.error(f"Error stopping agent {self.name}: {e}")
    
    async def _on_start(self) -> None:
        """Override for custom start logic"""
        pass
    
    async def _on_stop(self) -> None:
        """Override for custom stop logic"""
        pass
    
    @abstractmethod
    async def process_message(self, message: AgentMessage) -> AgentMessage:
        """Process an incoming message and return a response"""
        pass
    
    async def send_message(
        self,
        recipient_id: str,
        content: Dict[str, Any],
        message_type: str = "text"
    ) -> AgentMessage:
        """Send a message to another agent"""
        message = AgentMessage(
            sender_id=self.agent_id,
            recipient_id=recipient_id,
            content=content,
            message_type=message_type
        )
        
        # Apply middleware
        for middleware in self.middleware:
            message = await middleware(message)
        
        # Store in conversation history
        self.conversation_history.append(message)
        
        logger.info(f"Agent {self.name} sent message to {recipient_id}")
        return message
    
    async def handle_message(self, message: AgentMessage) -> AgentMessage:
        """Handle an incoming message with intelligent processing and middleware support"""
        if not self.is_active:
            raise RuntimeError(f"Agent {self.name} is not active")
        
        try:
            logger.info(f"🤖 Agent {self.name} handling message from {message.sender_id}")
            logger.info(f"📨 Message type: {message.message_type}")
            logger.info(f"📊 Content keys: {list(message.content.keys()) if isinstance(message.content, dict) else 'Non-dict content'}")
            
            # Apply middleware
            for middleware in self.middleware:
                message = await middleware(message)
            
            # Store in conversation history
            self.conversation_history.append(message)
            
            # Process the message with enhanced error handling
            response = await self.process_message(message)
            
            # Validate response
            if not response:
                raise Exception(f"Agent {self.name} returned empty response")
            
            # Store response in conversation history
            if response:
                self.conversation_history.append(response)
            
            logger.info(f"✅ Agent {self.name} completed message processing")
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Error handling message in agent {self.name}: {e}")
            import traceback
            logger.error(f"📋 Traceback: {traceback.format_exc()}")
            
            # Return error response
            return AgentMessage(
                sender_id=self.agent_id,
                recipient_id=message.sender_id,
                content={"error": str(e), "agent": self.name},
                message_type="error"
            )
    
    def add_middleware(self, middleware: Callable) -> None:
        """Add middleware for message processing"""
        self.middleware.append(middleware)
    
    def get_conversation_history(self) -> List[AgentMessage]:
        """Get the conversation history"""
        return self.conversation_history.copy()
    
    def update_memory(self, key: str, value: Any) -> None:
        """Update agent memory"""
        self.memory[key] = value
        if self.context:
            self.context.memory[key] = value
    
    def get_memory(self, key: str, default: Any = None) -> Any:
        """Get value from agent memory"""
        return self.memory.get(key, default)

class ChatCompletionAgent(BaseAgent):
    """
    Chat completion agent using OpenAI-style API
    Similar to Azure OpenAI Chat Completion Agent in MAF
    """
    
    def __init__(
        self,
        agent_id: str,
        name: str,
        description: str,
        system_prompt: str = "",
        model: str = "gpt-3.5-turbo",
        temperature: float = 0.7,
        max_tokens: int = 1000,
        **kwargs
    ):
        super().__init__(agent_id, name, description, **kwargs)
        self.system_prompt = system_prompt
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
    
    async def process_message(self, message: AgentMessage) -> AgentMessage:
        """Process message using chat completion"""
        try:
            # Extract user message
            user_content = message.content.get("text", "")
            
            # Build conversation context
            messages = []
            if self.system_prompt:
                messages.append({"role": "system", "content": self.system_prompt})
            
            # Add conversation history
            for hist_msg in self.conversation_history[-5:]:  # Last 5 messages for context
                if hist_msg.sender_id == message.sender_id:
                    messages.append({"role": "user", "content": hist_msg.content.get("text", "")})
                elif hist_msg.sender_id == self.agent_id:
                    messages.append({"role": "assistant", "content": hist_msg.content.get("text", "")})
            
            # Add current message
            messages.append({"role": "user", "content": user_content})
            
            # Simulate OpenAI API call (replace with actual implementation)
            response_text = await self._generate_response(messages)
            
            # Create response message
            response = AgentMessage(
                sender_id=self.agent_id,
                recipient_id=message.sender_id,
                content={"text": response_text},
                message_type="text"
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing message in {self.name}: {e}")
            return AgentMessage(
                sender_id=self.agent_id,
                recipient_id=message.sender_id,
                content={"text": f"Error processing request: {str(e)}"},
                message_type="error"
            )
    
    async def _generate_response(self, messages: List[Dict[str, str]]) -> str:
        """Generate response using OpenAI API"""
        try:
            import openai
            import os
            
            # Initialize OpenAI client
            client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            # Make API call
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            # Fallback to mock response
            user_message = messages[-1]["content"] if messages else ""
            
            if "travel" in self.name.lower():
                return f"As a travel specialist, I can help you with: {user_message}. Let me create a detailed travel plan for you."
            elif "research" in self.name.lower():
                return f"I'll research information about: {user_message}. Let me gather comprehensive data for you."
            elif "search" in self.name.lower():
                return f"Searching for information about: {user_message}. Here are the relevant results I found."
            else:
                return f"I understand you're asking about: {user_message}. Let me help you with that."

class FunctionToolAgent(BaseAgent):
    """
    Agent that can use function tools
    Similar to Function Tools Agent in MAF
    """
    
    def __init__(
        self,
        agent_id: str,
        name: str,
        description: str,
        available_functions: Dict[str, Callable] = None,
        **kwargs
    ):
        super().__init__(agent_id, name, description, **kwargs)
        self.available_functions = available_functions or {}
    
    async def process_message(self, message: AgentMessage) -> AgentMessage:
        """Process message and potentially call functions"""
        try:
            content = message.content
            
            # Check if this is a function call request
            if content.get("type") == "function_call":
                function_name = content.get("function_name")
                function_args = content.get("function_args", {})
                
                if function_name in self.available_functions:
                    # Call the function
                    result = await self._call_function(function_name, function_args)
                    
                    response_content = {
                        "type": "function_result",
                        "function_name": function_name,
                        "result": result
                    }
                else:
                    response_content = {
                        "type": "error",
                        "message": f"Function {function_name} not available"
                    }
            else:
                # Regular text processing
                response_content = {
                    "type": "text",
                    "text": f"Processed: {content.get('text', '')}"
                }
            
            return AgentMessage(
                sender_id=self.agent_id,
                recipient_id=message.sender_id,
                content=response_content,
                message_type="response"
            )
            
        except Exception as e:
            logger.error(f"Error in function tool agent {self.name}: {e}")
            return AgentMessage(
                sender_id=self.agent_id,
                recipient_id=message.sender_id,
                content={"type": "error", "message": str(e)},
                message_type="error"
            )
    
    async def _call_function(self, function_name: str, args: Dict[str, Any]) -> Any:
        """Call a function with given arguments"""
        try:
            function = self.available_functions[function_name]
            if asyncio.iscoroutinefunction(function):
                return await function(**args)
            else:
                return function(**args)
        except Exception as e:
            logger.error(f"Error calling function {function_name}: {e}")
            return {"error": str(e)}
    
    def add_function(self, name: str, function: Callable) -> None:
        """Add a function to the available functions"""
        self.available_functions[name] = function
        logger.info(f"Added function {name} to agent {self.name}")

# Agent factory for creating different types of agents
class AgentFactory:
    """Factory for creating different types of agents"""
    
    @staticmethod
    def create_chat_agent(
        agent_id: str,
        name: str,
        description: str,
        system_prompt: str = "",
        **kwargs
    ) -> ChatCompletionAgent:
        """Create a chat completion agent"""
        return ChatCompletionAgent(
            agent_id=agent_id,
            name=name,
            description=description,
            system_prompt=system_prompt,
            **kwargs
        )
    
    @staticmethod
    def create_function_agent(
        agent_id: str,
        name: str,
        description: str,
        functions: Dict[str, Callable] = None,
        **kwargs
    ) -> FunctionToolAgent:
        """Create a function tool agent"""
        return FunctionToolAgent(
            agent_id=agent_id,
            name=name,
            description=description,
            available_functions=functions,
            **kwargs
        )
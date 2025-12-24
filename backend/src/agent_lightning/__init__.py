"""
Agent Lightning Integration for Master Lingo Voice Agent
Microsoft Agent Lightning + MAF + LangChain

This module provides the core Agent Lightning capabilities:
- Advanced NLU (Natural Language Understanding)
- Magentic Orchestration (Parallel workflows)
- Intelligent Navigation
- Multi-turn Conversation Management
"""

from .core import LingoAgentLightning
from .nlu_engine import AgentLightningNLU, UnderstandingResult
from .conversation import ConversationManager, ConversationContext
from .orchestrator import MagenticOrchestrator, WorkflowResult
from .navigator import IntelligentNavigator, NavigationAction
from .lingo_integration import LingoAgentLightningBridge, get_agent_lightning_bridge

__all__ = [
    'LingoAgentLightning',
    'AgentLightningNLU',
    'UnderstandingResult',
    'ConversationManager',
    'ConversationContext',
    'MagenticOrchestrator',
    'WorkflowResult',
    'IntelligentNavigator',
    'NavigationAction',
    'LingoAgentLightningBridge',
    'get_agent_lightning_bridge',
]

__version__ = '1.0.0'
__author__ = 'LingoLancers Team'

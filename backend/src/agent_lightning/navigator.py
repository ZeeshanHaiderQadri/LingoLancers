"""
Intelligent Navigator for Agent Lightning
Context-aware dashboard routing and navigation
"""

import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class NavigationMode(Enum):
    """Navigation modes"""
    DIRECT = "direct"  # Direct navigation
    SPLIT_SCREEN = "split_screen"  # Split screen mode
    MODAL = "modal"  # Modal overlay
    TAB = "tab"  # New tab


@dataclass
class NavigationAction:
    """Navigation action result"""
    route: str
    mode: NavigationMode
    data: Dict[str, Any]
    auto_navigate: bool = True
    preserve_context: bool = True


class IntelligentNavigator:
    """
    Intelligent Navigator for context-aware dashboard routing
    
    Features:
    - Intent-based routing
    - Context preservation
    - Smart navigation modes
    - History tracking
    """
    
    def __init__(self):
        """Initialize navigator"""
        self.navigation_history = []
        self.route_map = self._build_route_map()
        logger.info("🧭 Intelligent Navigator initialized")
    
    def _build_route_map(self) -> Dict[str, Dict[str, Any]]:
        """Build intent to route mapping"""
        return {
            # Blog Team
            "blog": {
                "route": "/blog-team",
                "mode": NavigationMode.SPLIT_SCREEN,
                "requires_data": ["topic"]
            },
            "write_blog": {
                "route": "/blog-team",
                "mode": NavigationMode.SPLIT_SCREEN,
                "requires_data": ["topic"]
            },
            "create_article": {
                "route": "/blog-team",
                "mode": NavigationMode.SPLIT_SCREEN,
                "requires_data": ["topic"]
            },
            
            # Travel Team
            "travel": {
                "route": "/travel-team",
                "mode": NavigationMode.SPLIT_SCREEN,
                "requires_data": ["destination"]
            },
            "plan_trip": {
                "route": "/travel-team",
                "mode": NavigationMode.SPLIT_SCREEN,
                "requires_data": ["destination"]
            },
            "book_flight": {
                "route": "/travel-team",
                "mode": NavigationMode.SPLIT_SCREEN,
                "requires_data": ["from", "to"]
            },
            
            # AI Image Suite
            "ai_image": {
                "route": "/ai-image",
                "mode": NavigationMode.DIRECT,
                "requires_data": []
            },
            "navigation": {
                "route": "/ai-image",  # Default to AI Image for navigation intent
                "mode": NavigationMode.DIRECT,
                "requires_data": []
            },
            "generate_image": {
                "route": "/ai-image/nano-banana",
                "mode": NavigationMode.DIRECT,
                "requires_data": []
            },
            "remove_background": {
                "route": "/ai-image/remove-background",
                "mode": NavigationMode.DIRECT,
                "requires_data": []
            },
            "product_shot": {
                "route": "/ai-image/product-shot",
                "mode": NavigationMode.DIRECT,
                "requires_data": []
            },
            "virtual_tryon": {
                "route": "/virtual-tryon",
                "mode": NavigationMode.DIRECT,
                "requires_data": []
            },
            
            # Chat
            "chat": {
                "route": "/ai-chat",
                "mode": NavigationMode.DIRECT,
                "requires_data": []
            },
            "ask_question": {
                "route": "/ai-chat",
                "mode": NavigationMode.DIRECT,
                "requires_data": []
            },
            
            # Dashboard
            "dashboard": {
                "route": "/",
                "mode": NavigationMode.DIRECT,
                "requires_data": []
            },
            "home": {
                "route": "/",
                "mode": NavigationMode.DIRECT,
                "requires_data": []
            }
        }
    
    async def navigate(
        self,
        intent: str,
        context: Dict[str, Any],
        user_id: str = "default_user"
    ) -> NavigationAction:
        """
        Determine navigation action based on intent and context
        
        Args:
            intent: User intent
            context: Conversation context
            user_id: User identifier
            
        Returns:
            NavigationAction with route and mode
        """
        try:
            logger.info(f"🧭 Navigating for intent: {intent}")
            
            # Get route configuration
            route_config = self.route_map.get(intent)
            
            if not route_config:
                logger.warning(f"⚠️ No route found for intent: {intent}")
                return NavigationAction(
                    route="/",
                    mode=NavigationMode.DIRECT,
                    data={},
                    auto_navigate=False
                )
            
            # Extract required data from context
            navigation_data = {}
            
            # Handle both dict and ConversationContext
            context_dict = context if isinstance(context, dict) else (
                context.collected_data if hasattr(context, 'collected_data') else {}
            )
            
            for required_field in route_config.get("requires_data", []):
                if required_field in context_dict:
                    navigation_data[required_field] = context_dict[required_field]
            
            # Create navigation action
            action = NavigationAction(
                route=route_config["route"],
                mode=route_config["mode"],
                data=navigation_data,
                auto_navigate=True,
                preserve_context=True
            )
            
            # Track navigation
            self.navigation_history.append({
                "user_id": user_id,
                "intent": intent,
                "route": action.route,
                "mode": action.mode.value
            })
            
            logger.info(f"✅ Navigation: {action.route} ({action.mode.value})")
            
            return action
            
        except Exception as e:
            logger.error(f"❌ Navigation error: {e}")
            return NavigationAction(
                route="/",
                mode=NavigationMode.DIRECT,
                data={},
                auto_navigate=False
            )
    
    def get_stats(self) -> Dict[str, Any]:
        """Get navigator statistics"""
        return {
            "total_navigations": len(self.navigation_history),
            "routes_available": len(self.route_map),
            "recent_navigations": self.navigation_history[-10:]
        }
    
    def get_route_for_intent(self, intent: str) -> Optional[str]:
        """Get route for a given intent"""
        route_config = self.route_map.get(intent)
        return route_config["route"] if route_config else None

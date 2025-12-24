"""
Real-time Prompt Filling System
Types prompts in real-time as user speaks
"""

from typing import Optional, Dict, Any, Callable
import asyncio
import logging

logger = logging.getLogger(__name__)

class PromptFiller:
    """
    Fill prompts in real-time with visual feedback
    """
    
    def __init__(self):
        self.current_prompt = ""
        self.typing_speed = 0.03  # seconds per character (faster = better UX)
        self.on_prompt_update: Optional[Callable] = None
    
    async def type_prompt(
        self,
        prompt: str,
        feature: str,
        instant: bool = False
    ) -> Dict[str, Any]:
        """
        Type prompt with visual feedback
        
        Args:
            prompt: The prompt text to type
            feature: Which feature (nano-banana, product-shot, etc.)
            instant: If True, show entire prompt immediately
        
        Returns:
            Dict with prompt and feature info
        """
        
        logger.info(f"📝 Typing prompt for {feature}: {prompt}")
        
        if instant:
            # Show entire prompt immediately
            self.current_prompt = prompt
            
            if self.on_prompt_update:
                try:
                    if asyncio.iscoroutinefunction(self.on_prompt_update):
                        await self.on_prompt_update({
                            "feature": feature,
                            "prompt": prompt,
                            "complete": True,
                            "typing": False
                        })
                    else:
                        self.on_prompt_update({
                            "feature": feature,
                            "prompt": prompt,
                            "complete": True,
                            "typing": False
                        })
                except Exception as e:
                    logger.error(f"Error in prompt update callback: {e}")
            
            return {
                "success": True,
                "feature": feature,
                "prompt": prompt
            }
        
        # Type character by character for better UX
        self.current_prompt = ""
        
        for i, char in enumerate(prompt):
            self.current_prompt += char
            
            # Send update every few characters (batching for performance)
            if i % 3 == 0 or i == len(prompt) - 1:
                if self.on_prompt_update:
                    try:
                        update_data = {
                            "feature": feature,
                            "prompt": self.current_prompt,
                            "complete": i == len(prompt) - 1,
                            "typing": True
                        }
                        
                        if asyncio.iscoroutinefunction(self.on_prompt_update):
                            await self.on_prompt_update(update_data)
                        else:
                            self.on_prompt_update(update_data)
                    except Exception as e:
                        logger.error(f"Error in prompt update callback: {e}")
            
            # Small delay for typing effect
            await asyncio.sleep(self.typing_speed)
        
        # Final update - mark as complete
        if self.on_prompt_update:
            try:
                final_data = {
                    "feature": feature,
                    "prompt": self.current_prompt,
                    "complete": True,
                    "typing": False
                }
                
                if asyncio.iscoroutinefunction(self.on_prompt_update):
                    await self.on_prompt_update(final_data)
                else:
                    self.on_prompt_update(final_data)
            except Exception as e:
                logger.error(f"Error in final prompt update: {e}")
        
        logger.info(f"✅ Prompt typing complete: {self.current_prompt}")
        
        return {
            "success": True,
            "feature": feature,
            "prompt": self.current_prompt
        }
    
    def register_callback(self, callback: Callable):
        """Register callback for prompt updates"""
        self.on_prompt_update = callback
        logger.info("✓ Prompt update callback registered")
    
    def clear_prompt(self):
        """Clear current prompt"""
        self.current_prompt = ""


# Singleton instance
_prompt_filler: Optional[PromptFiller] = None

def get_prompt_filler() -> PromptFiller:
    """Get or create prompt filler instance"""
    global _prompt_filler
    
    if _prompt_filler is None:
        _prompt_filler = PromptFiller()
        logger.info("✓ Prompt Filler initialized")
    
    return _prompt_filler

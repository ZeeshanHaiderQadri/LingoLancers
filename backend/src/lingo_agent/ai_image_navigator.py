"""
AI Image Navigation Controller
Handles voice navigation to all AI image features
"""

from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class AIImageNavigator:
    """
    Navigate to AI Image features via voice commands
    """
    
    # Navigation map for AI Image features
    FEATURE_MAP = {
        # Nano Banana Studio
        "nano banana": {
            "path": "/ai-image",
            "tab": "nano-banana",
            "description": "Image Editing Studio",
            "prompt_field": "prompt"
        },
        "image studio": {
            "path": "/ai-image",
            "tab": "nano-banana",
            "description": "Image Editing Studio",
            "prompt_field": "prompt"
        },
        "edit image": {
            "path": "/ai-image",
            "tab": "nano-banana",
            "description": "Image Editing Studio",
            "prompt_field": "prompt"
        },
        
        # Remove Background
        "remove background": {
            "path": "/ai-image",
            "tab": "remove-background",
            "description": "Background Removal",
            "prompt_field": "prompt"
        },
        "transparent background": {
            "path": "/ai-image",
            "tab": "remove-background",
            "description": "Background Removal",
            "prompt_field": "prompt"
        },
        "cut out": {
            "path": "/ai-image",
            "tab": "remove-background",
            "description": "Background Removal",
            "prompt_field": "prompt"
        },
        
        # Product Shot
        "product shot": {
            "path": "/ai-image",
            "tab": "product-shot",
            "description": "Product Photography",
            "prompt_field": "prompt"
        },
        "product photo": {
            "path": "/ai-image",
            "tab": "product-shot",
            "description": "Product Photography",
            "prompt_field": "prompt"
        },
        "professional photo": {
            "path": "/ai-image",
            "tab": "product-shot",
            "description": "Product Photography",
            "prompt_field": "prompt"
        },
        
        # Vision
        "vision": {
            "path": "/ai-image",
            "tab": "vision",
            "description": "Image Analysis",
            "prompt_field": "question"
        },
        "analyze image": {
            "path": "/ai-image",
            "tab": "vision",
            "description": "Image Analysis",
            "prompt_field": "question"
        },
        "describe image": {
            "path": "/ai-image",
            "tab": "vision",
            "description": "Image Analysis",
            "prompt_field": "question"
        },
        
        # Combine Images
        "combine": {
            "path": "/ai-image",
            "tab": "combine",
            "description": "Image Combination",
            "prompt_field": "prompt"
        },
        "merge images": {
            "path": "/ai-image",
            "tab": "combine",
            "description": "Image Combination",
            "prompt_field": "prompt"
        },
        "blend images": {
            "path": "/ai-image",
            "tab": "combine",
            "description": "Image Combination",
            "prompt_field": "prompt"
        },
        
        # Logo Generation
        "logo": {
            "path": "/ai-image",
            "tab": "logo",
            "description": "Logo Generation",
            "prompt_field": "prompt"
        },
        "create logo": {
            "path": "/ai-image",
            "tab": "logo",
            "description": "Logo Generation",
            "prompt_field": "prompt"
        },
        "design logo": {
            "path": "/ai-image",
            "tab": "logo",
            "description": "Logo Generation",
            "prompt_field": "prompt"
        },
        "logo generation": {
            "path": "/ai-image",
            "tab": "logo",
            "description": "Logo Generation",
            "prompt_field": "prompt"
        },
        
        # Virtual Try-On
        "virtual tryon": {
            "path": "/virtual-tryon",
            "tab": None,
            "description": "Virtual Try-On",
            "prompt_field": None
        },
        "try on": {
            "path": "/virtual-tryon",
            "tab": None,
            "description": "Virtual Try-On",
            "prompt_field": None
        },
        "virtual try on": {
            "path": "/virtual-tryon",
            "tab": None,
            "description": "Virtual Try-On",
            "prompt_field": None
        }
    }
    
    @classmethod
    def resolve_feature(cls, voice_command: str) -> Optional[Dict[str, Any]]:
        """
        Resolve voice command to AI Image feature
        
        Examples:
        - "open nano banana" -> {path: "/ai-image", tab: "nano-banana"}
        - "go to product shot" -> {path: "/ai-image", tab: "product-shot"}
        - "show me logo generation" -> {path: "/ai-image", tab: "logo"}
        """
        command_lower = voice_command.lower()
        
        # Remove common prefixes
        prefixes = ["open", "go to", "show me", "navigate to", "take me to", "switch to", "use"]
        for prefix in prefixes:
            if command_lower.startswith(prefix):
                command_lower = command_lower[len(prefix):].strip()
        
        # Direct match
        if command_lower in cls.FEATURE_MAP:
            return cls.FEATURE_MAP[command_lower]
        
        # Fuzzy match - check if any key is in the command
        for key, value in cls.FEATURE_MAP.items():
            if key in command_lower:
                return value
        
        return None
    
    @classmethod
    def extract_prompt_from_command(cls, voice_command: str) -> Optional[str]:
        """
        Extract prompt from voice command
        
        Examples:
        - "remove background from this image" -> None (no specific prompt)
        - "create a logo with text 'TechCorp'" -> "logo with text 'TechCorp'"
        - "generate a product shot on white background" -> "product shot on white background"
        - "create a sunset over mountains" -> "sunset over mountains"
        """
        command_lower = voice_command.lower()
        
        # Patterns that indicate a prompt follows
        prompt_indicators = [
            ("create a ", ""),
            ("generate a ", ""),
            ("make a ", ""),
            ("design a ", ""),
            ("create ", ""),
            ("generate ", ""),
            ("make ", ""),
            ("design ", ""),
            (" with ", "with "),
            (" for ", "for "),
            (" of ", "of "),
            (" showing ", "showing ")
        ]
        
        for indicator, keep_prefix in prompt_indicators:
            if indicator in command_lower:
                parts = command_lower.split(indicator, 1)
                if len(parts) > 1:
                    prompt = parts[1].strip()
                    
                    # Add back the prefix if needed
                    if keep_prefix:
                        prompt = keep_prefix + prompt
                    
                    # Clean up common words
                    cleanup_words = ["for me", "please", "now"]
                    for word in cleanup_words:
                        prompt = prompt.replace(word, "").strip()
                    
                    # Return if prompt is meaningful
                    if len(prompt) > 3:
                        return prompt
        
        return None
    
    @classmethod
    def is_ai_image_command(cls, voice_command: str) -> bool:
        """Check if command is related to AI Image features"""
        command_lower = voice_command.lower()
        
        # Check for feature keywords
        for key in cls.FEATURE_MAP.keys():
            if key in command_lower:
                return True
        
        # Check for general AI image keywords
        ai_image_keywords = [
            "image", "photo", "picture", "logo", "background",
            "product", "vision", "analyze", "combine", "merge",
            "edit", "generate", "create", "design"
        ]
        
        return any(keyword in command_lower for keyword in ai_image_keywords)

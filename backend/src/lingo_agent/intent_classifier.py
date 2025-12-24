"""
Intent Classification for Master Lingo Agent
Determines user intent and routes to appropriate agent team
"""

import re
from typing import Dict, Any, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class IntentType(Enum):
    """Types of user intents"""
    TRAVEL_PLANNING = "travel_planning"
    BLOG_WRITING = "blog_writing"
    AI_IMAGE = "ai_image"
    NAVIGATION = "navigation"
    HELP = "help"
    CONVERSATION = "conversation"
    GENERAL_KNOWLEDGE = "general_knowledge"  # Weather, facts, general questions
    UNKNOWN = "unknown"


class IntentClassifier:
    """
    Classifies user intent from natural language input
    """
    
    def __init__(self):
        # Intent patterns
        self.travel_patterns = [
            # Direct travel requests
            r"plan.*trip",
            r"travel.*to",
            r"travel.*from.*to",
            r"trip.*from.*to",
            r"going.*from.*to",
            r"visit.*\b(city|country|place)",
            r"book.*flight",
            r"find.*hotel",
            r"vacation",
            r"holiday",
            r"itinerary",
            r"going to \w+",
            r"trip to \w+",
            # Enhanced patterns for natural language
            r"plan.*travel",
            r"make.*travel.*plan",
            r"help.*plan.*trip",
            r"organize.*trip",
            r"arrange.*travel",
            r"book.*trip",
            r"schedule.*trip",
            # From-to patterns
            r"\w+\s+to\s+\w+.*travel",
            r"\w+\s+to\s+\w+.*trip",
            r"from\s+\w+\s+to\s+\w+",
            # City/country names followed by travel words
            r"[A-Z][a-z]+\s+to\s+[A-Z][a-z]+",
            # Travel planning keywords
            r"travel.*planning",
            r"trip.*planning",
            r"vacation.*planning"
        ]
        
        self.blog_patterns = [
            r"write.*blog",
            r"create.*article",
            r"blog.*about",
            r"article.*on",
            r"write.*about",
            r"publish.*blog",
            r"draft.*article",
            r"blog post"
        ]
        
        self.ai_image_patterns = [
            r"generate.*image",
            r"create.*image",
            r"make.*image",
            r"create.*picture",
            r"generate.*picture",
            r"make.*picture",
            r"create.*photo",
            r"generate.*photo",
            r"make.*logo",
            r"create.*logo",
            r"generate.*logo",
            r"remove.*background",
            r"edit.*image",
            r"nano banana",
            r"product shot",
            r"virtual.*try.*on",
            r"combine.*images",
            r"open.*nano.*banana",
            r"open.*image.*editing",
            r"open.*virtual.*try",
            r"open.*product.*shot",
            r"open.*logo.*generation",
            r"open.*background.*removal",
            r"image.*editing",
            r"logo.*generation",
            r"background.*removal"
        ]
        
        self.navigation_patterns = [
            r"show.*dashboard",
            r"go to",
            r"open.*\b(travel|blog)",
            r"switch to",
            r"navigate to"
        ]
        
        self.help_patterns = [
            r"help",
            r"what can you do",
            r"how.*work",
            r"explain"
        ]
        
        self.conversation_patterns = [
            r"^hello\b",
            r"^hi\b",
            r"^hey\b",
            r"you there",
            r"are you there",
            r"how are you",
            r"good morning",
            r"good afternoon",
            r"good evening",
            r"thanks",
            r"thank you",
            r"okay",
            r"ok",
            r"yes",
            r"no",
            r"sure",
            r"alright",
            r"cool",
            r"nice",
            r"great"
        ]
        
        # General knowledge patterns (weather, facts, questions)
        self.general_knowledge_patterns = [
            r"what.*weather",
            r"weather.*in",
            r"temperature.*in",
            r"how.*weather",
            r"is it.*raining",
            r"is it.*sunny",
            r"will it.*rain",
            r"what.*capital.*of",
            r"who.*president",
            r"who.*invented",
            r"when.*was.*born",
            r"what.*is.*\?",
            r"how.*does.*work",
            r"why.*is",
            r"explain.*to.*me",
            r"tell.*me.*about",
            r"what.*do.*you.*know",
            r"can.*you.*explain"
        ]
        
        # Ambiguous patterns that should trigger clarification
        self.ambiguous_patterns = [
            r"i want to create",
            r"help me with",
            r"i need to make",
            r"can you help",
            r"i want to do",
            r"create something",
            r"make something",
            r"work on"
        ]
    
    def classify(self, text: str) -> Dict[str, Any]:
        """
        Classify user intent from text
        
        Returns:
            {
                "intent": IntentType,
                "confidence": float,
                "entities": dict,
                "raw_text": str
            }
        """
        text_lower = text.lower().strip()
        
        # Check travel intent
        if self._matches_patterns(text_lower, self.travel_patterns):
            entities = self._extract_travel_entities(text_lower)
            # Lower confidence to trigger confirmation
            confidence = 0.7 if entities.get("destination") else 0.5
            return {
                "intent": IntentType.TRAVEL_PLANNING,
                "confidence": confidence,
                "entities": entities,
                "raw_text": text
            }
        
        # Check blog intent
        if self._matches_patterns(text_lower, self.blog_patterns):
            entities = self._extract_blog_entities(text_lower)
            # Lower confidence to trigger confirmation
            confidence = 0.7 if entities.get("topic") else 0.5
            return {
                "intent": IntentType.BLOG_WRITING,
                "confidence": confidence,
                "entities": entities,
                "raw_text": text
            }
        
        # Check AI image intent
        if self._matches_patterns(text_lower, self.ai_image_patterns):
            entities = self._extract_ai_image_entities(text_lower)
            # Lower confidence to trigger confirmation
            confidence = 0.7 if entities else 0.5
            return {
                "intent": IntentType.AI_IMAGE,
                "confidence": confidence,
                "entities": entities,
                "raw_text": text
            }
        
        # Check navigation intent
        if self._matches_patterns(text_lower, self.navigation_patterns):
            return {
                "intent": IntentType.NAVIGATION,
                "confidence": 0.8,
                "entities": {},
                "raw_text": text
            }
        
        # Check for ambiguous patterns first
        if self._matches_patterns(text_lower, self.ambiguous_patterns):
            return {
                "intent": IntentType.HELP,
                "confidence": 0.3,  # Low confidence triggers clarification
                "entities": {"ambiguous": True},
                "raw_text": text
            }
        
        # Check general knowledge intent (weather, facts, questions) - BEFORE conversation
        if self._matches_patterns(text_lower, self.general_knowledge_patterns):
            return {
                "intent": IntentType.GENERAL_KNOWLEDGE,
                "confidence": 0.9,
                "entities": {"query": text},
                "raw_text": text
            }
        
        # Check conversation intent (greetings, casual chat)
        if self._matches_patterns(text_lower, self.conversation_patterns):
            return {
                "intent": IntentType.CONVERSATION,
                "confidence": 0.9,
                "entities": {},
                "raw_text": text
            }
        
        # Check help intent
        if self._matches_patterns(text_lower, self.help_patterns):
            return {
                "intent": IntentType.HELP,
                "confidence": 0.9,
                "entities": {},
                "raw_text": text
            }
        
        # Unknown intent
        return {
            "intent": IntentType.UNKNOWN,
            "confidence": 0.0,
            "entities": {},
            "raw_text": text
        }
    
    def _matches_patterns(self, text: str, patterns: list) -> bool:
        """Check if text matches any pattern"""
        for pattern in patterns:
            if re.search(pattern, text):
                return True
        return False
    
    def _extract_travel_entities(self, text: str) -> Dict[str, Any]:
        """Extract travel-related entities with enhanced parsing"""
        entities = {}
        
        # Extract from-to pattern (e.g., "Lahore to London", "from Paris to Rome")
        from_to_patterns = [
            r"from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s|$|,|\.|for|with|on|in)",
            r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s|$|,|\.|for|with|on|in|next)",
            r"travel.*from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s|$|,|\.|for|with|on|in)",
            r"trip.*from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s|$|,|\.|for|with|on|in)"
        ]
        
        for pattern in from_to_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities["departure"] = match.group(1).title()
                entities["destination"] = match.group(2).title()
                break
        
        # If no from-to pattern, try to extract just destination
        if not entities.get("destination"):
            destination_patterns = [
                r"(?:to|visit|going to|trip to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s|$|,|\.|for|with|on|in|next)",
                r"travel.*to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s|$|,|\.|for|with|on|in|next)",
                r"plan.*trip.*to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s|$|,|\.|for|with|on|in|next)",
                r"vacation.*to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s|$|,|\.|for|with|on|in|next)",
                r"flight.*to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s|$|,|\.|for|with|on|in|next)"
            ]
            
            for pattern in destination_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    entities["destination"] = match.group(1).title()
                    break
        
        # Extract dates with more patterns
        date_patterns = [
            r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"(next week|next month|tomorrow|today)",
            r"(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}",
            r"in\s+(\d+)\s+(days?|weeks?|months?)",
            r"(this|next)\s+(week|month|year)"
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities["date"] = match.group(1)
                break
        
        # Extract duration
        duration_patterns = [
            r"for\s+(\d+)\s+(days?|weeks?|months?)",
            r"(\d+)\s+day\s+trip",
            r"(\d+)\s+week\s+vacation"
        ]
        
        for pattern in duration_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities["duration"] = match.group(0)
                break
        
        # Extract travelers
        traveler_patterns = [
            r"(\d+)\s+(people|persons?|travelers?|adults?)",
            r"for\s+(\d+)",
            r"family\s+of\s+(\d+)",
            r"(\d+)\s+adults?"
        ]
        
        for pattern in traveler_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities["travelers"] = match.group(1)
                break
        
        # Extract budget hints
        budget_patterns = [
            r"budget.*(\$\d+)",
            r"cheap|budget|affordable",
            r"luxury|expensive|premium",
            r"mid.?range|moderate"
        ]
        
        for pattern in budget_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if "$" in match.group(0):
                    entities["budget"] = match.group(1)
                else:
                    entities["budget_type"] = match.group(0)
                break
        
        return entities
    
    def _extract_blog_entities(self, text: str) -> Dict[str, Any]:
        """Extract blog-related entities with enhanced parsing"""
        entities = {}
        
        # Extract topic with multiple patterns
        topic_patterns = [
            r"(?:about|on|regarding)\s+(.+?)(?:\.|$|,)",
            r"blog.*about\s+(.+?)(?:\.|$|,)",
            r"article.*on\s+(.+?)(?:\.|$|,)",
            r"write.*about\s+(.+?)(?:\.|$|,)",
            r"create.*article.*about\s+(.+?)(?:\.|$|,)",
            r"post.*about\s+(.+?)(?:\.|$|,)",
            # Catch remaining text after blog/article keywords
            r"(?:blog|article|post)\s+(.+?)(?:\.|$)",
            r"write\s+(.+?)(?:\.|$)"
        ]
        
        for pattern in topic_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                topic = match.group(1).strip()
                # Clean up common words
                topic = re.sub(r'^(a|an|the)\s+', '', topic, flags=re.IGNORECASE)
                entities["topic"] = topic
                break
        
        # Extract tone
        tone_patterns = [
            r"(professional|casual|technical|friendly|formal|informal)\s+tone",
            r"tone.*should.*be\s+(professional|casual|technical|friendly|formal|informal)",
            r"make.*it\s+(professional|casual|technical|friendly|formal|informal)",
            r"write.*in.*a\s+(professional|casual|technical|friendly|formal|informal)"
        ]
        
        for pattern in tone_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities["tone"] = match.group(1).lower()
                break
        
        # Extract keywords
        keyword_patterns = [
            r"keywords?\s*:?\s*(.+?)(?:\.|$|,)",
            r"SEO.*keywords?\s*:?\s*(.+?)(?:\.|$|,)",
            r"target.*keywords?\s*:?\s*(.+?)(?:\.|$|,)",
            r"focus.*on\s+(.+?)(?:\.|$|,)"
        ]
        
        for pattern in keyword_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities["keywords"] = match.group(1).strip()
                break
        
        # Extract length
        length_patterns = [
            r"(short|medium|long)\s+article",
            r"(\d+)\s+words?",
            r"make.*it\s+(short|medium|long)",
            r"length.*should.*be\s+(short|medium|long)"
        ]
        
        for pattern in length_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                length_value = match.group(1).lower()
                if length_value.isdigit():
                    word_count = int(length_value)
                    if word_count < 1000:
                        entities["length"] = "short"
                    elif word_count < 2000:
                        entities["length"] = "medium"
                    else:
                        entities["length"] = "long"
                else:
                    entities["length"] = length_value
                break
        
        return entities
    
    def _extract_ai_image_entities(self, text: str) -> Dict[str, Any]:
        """Extract AI image-related entities"""
        entities = {}
        text_lower = text.lower()
        
        # Detect specific AI image features with enhanced patterns
        if "nano banana" in text_lower or "image editing" in text_lower:
            entities["feature"] = "nano_banana"
        elif "remove background" in text_lower or "background removal" in text_lower:
            entities["feature"] = "remove_background"
        elif "product shot" in text_lower or "product photography" in text_lower:
            entities["feature"] = "product_shot"
        elif "logo" in text_lower and ("generation" in text_lower or "create" in text_lower or "make" in text_lower):
            entities["feature"] = "logo_generation"
        elif "virtual try" in text_lower or "try on" in text_lower or "virtual tryon" in text_lower:
            entities["feature"] = "virtual_tryon"
        elif "combine" in text_lower and "image" in text_lower:
            entities["feature"] = "combine_images"
        elif "vision" in text_lower or "analyze" in text_lower:
            entities["feature"] = "vision"
        else:
            entities["feature"] = "nano_banana"  # Default to main image editor
        
        # Extract description/prompt
        prompt_patterns = [
            r"(?:of|with|showing)\s+(.+?)(?:\.|$)",
            r"(?:create|generate|make)\s+(?:an?\s+)?(?:image|picture|photo)\s+(?:of\s+)?(.+?)(?:\.|$)",
            r"(?:image|picture|photo)\s+(?:of\s+)?(.+?)(?:\.|$)"
        ]
        
        for pattern in prompt_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities["prompt"] = match.group(1).strip()
                break
        
        return entities

"""
Smart Feedback Analyzer for Targeted Article Changes
Analyzes user feedback to determine specific, targeted changes instead of full rewrites
"""
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class ChangeType(Enum):
    """Types of targeted changes"""
    TITLE_ONLY = "title_only"
    FEATURE_IMAGE = "feature_image"
    SUPPORTING_IMAGES = "supporting_images"
    INTRODUCTION = "introduction"
    CONCLUSION = "conclusion"
    SPECIFIC_PARAGRAPH = "specific_paragraph"
    META_DESCRIPTION = "meta_description"
    TONE_ADJUSTMENT = "tone_adjustment"
    SEO_KEYWORDS = "seo_keywords"
    CONTENT_SECTION = "content_section"
    FULL_REWRITE = "full_rewrite"


@dataclass
class ChangeRequest:
    """Represents a targeted change request"""
    change_type: ChangeType
    specific_target: str  # What specifically to change
    new_requirements: str  # What the user wants
    agents_needed: List[str]  # Which agents to run
    estimated_time_seconds: int  # Estimated completion time
    confidence_score: float  # How confident we are in the analysis (0-1)
    original_feedback: str  # Original user feedback
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            'change_type': self.change_type.value,
            'specific_target': self.specific_target,
            'new_requirements': self.new_requirements,
            'agents_needed': self.agents_needed,
            'estimated_time_seconds': self.estimated_time_seconds,
            'confidence_score': self.confidence_score,
            'original_feedback': self.original_feedback
        }


class SmartFeedbackAnalyzer:
    """
    Analyzes user feedback to determine targeted changes
    Uses pattern matching and keyword analysis for precise change detection
    """
    
    def __init__(self):
        """Initialize the analyzer with pattern definitions"""
        self.change_patterns = {
            ChangeType.TITLE_ONLY: {
                'keywords': ['title', 'headline', 'heading', 'header'],
                'phrases': [
                    r'change\s+(?:the\s+)?title\s+to',
                    r'update\s+(?:the\s+)?title\s+to',
                    r'new\s+title',
                    r'different\s+title',
                    r'title\s+should\s+be',
                    r'rename\s+(?:the\s+)?(?:article|post)',
                    r'call\s+it\s+instead',
                    r'title.*[\'"].*[\'"]',  # Matches "title to 'something'"
                    r'change.*title.*[\'"]',  # Matches "change title to 'something'"
                    r'title\s+to\s+[\'"]',  # Matches "title to 'something'"
                ],
                'agents': ['writer'],
                'time': 15
            },
            
            ChangeType.FEATURE_IMAGE: {
                'keywords': ['feature image', 'main image', 'hero image', 'cover image', 'primary image', 'image'],
                'phrases': [
                    r'change\s+(?:the\s+)?(?:feature|main|hero|cover|primary)?\s*image',
                    r'new\s+(?:feature|main|hero|cover|primary)?\s*image',
                    r'different\s+(?:feature|main|hero|cover|primary)?\s*image',
                    r'replace\s+(?:the\s+)?(?:feature|main|hero|cover|primary)?\s*image',
                    r'(?:feature|main|hero|cover|primary)?\s*image\s+should',
                    r'generate\s+(?:a\s+)?new\s+(?:feature|main|hero|cover|primary)?\s*image',
                    r'(?:feature|main|hero|cover|primary)?\s*image.*(?:to\s+show|with|of)',
                    r'put.*(?:feature|main|hero|cover|primary)?\s*image',
                    r'(?:feature|main|hero|cover|primary)?\s*image.*(?:real|actual|specific)',
                    r'image.*(?:jensen|elon|musk)',
                    r'(?:jensen|elon|musk).*image'
                ],
                'agents': ['feature_image'],
                'time': 30
            },
            
            ChangeType.SUPPORTING_IMAGES: {
                'keywords': ['supporting images', 'article images', 'content images', 'inline images'],
                'phrases': [
                    r'change\s+(?:the\s+)?(?:supporting|article|content|inline)\s+images',
                    r'find\s+(?:different|new|better)\s+(?:supporting|article|content|inline)\s+images',
                    r'replace\s+(?:the\s+)?(?:supporting|article|content|inline)\s+images',
                    r'(?:supporting|article|content|inline)\s+images\s+should',
                    r'get\s+(?:different|new|better)\s+images'
                ],
                'agents': ['image_finder'],
                'time': 45
            },
            
            ChangeType.INTRODUCTION: {
                'keywords': ['introduction', 'intro', 'opening', 'beginning', 'first paragraph'],
                'phrases': [
                    r'change\s+(?:the\s+)?(?:introduction|intro|opening|beginning)',
                    r'rewrite\s+(?:the\s+)?(?:introduction|intro|opening|beginning)',
                    r'(?:introduction|intro|opening|beginning)\s+should',
                    r'start\s+(?:the\s+)?(?:article|post)\s+(?:with|differently)',
                    r'first\s+paragraph\s+(?:should|needs)',
                    r'opening\s+(?:paragraph|section)\s+(?:should|needs)'
                ],
                'agents': ['writer'],
                'time': 60
            },
            
            ChangeType.CONCLUSION: {
                'keywords': ['conclusion', 'ending', 'final paragraph', 'wrap up'],
                'phrases': [
                    r'change\s+(?:the\s+)?(?:conclusion|ending|final\s+paragraph)',
                    r'rewrite\s+(?:the\s+)?(?:conclusion|ending|final\s+paragraph)',
                    r'(?:conclusion|ending|final\s+paragraph)\s+should',
                    r'end\s+(?:the\s+)?(?:article|post)\s+(?:with|differently)',
                    r'wrap\s+up\s+(?:with|differently)',
                    r'final\s+(?:paragraph|section)\s+(?:should|needs)'
                ],
                'agents': ['writer'],
                'time': 60
            },
            
            ChangeType.META_DESCRIPTION: {
                'keywords': ['meta description', 'description', 'summary', 'excerpt'],
                'phrases': [
                    r'change\s+(?:the\s+)?(?:meta\s+)?description',
                    r'update\s+(?:the\s+)?(?:meta\s+)?description',
                    r'new\s+(?:meta\s+)?description',
                    r'(?:meta\s+)?description\s+should',
                    r'summary\s+should',
                    r'excerpt\s+should'
                ],
                'agents': ['seo', 'writer'],
                'time': 30
            },
            
            ChangeType.TONE_ADJUSTMENT: {
                'keywords': ['tone', 'style', 'voice', 'casual', 'formal', 'professional', 'friendly', 'conversational'],
                'phrases': [
                    r'make\s+(?:it\s+)?(?:the\s+)?(?:tone\s+)?more\s+(?:casual|formal|professional|friendly|conversational)',
                    r'change\s+(?:the\s+)?(?:tone|style|voice)',
                    r'(?:tone|style|voice)\s+(?:should\s+be\s+)?(?:more\s+)?(?:casual|formal|professional|friendly)',
                    r'write\s+in\s+a\s+more\s+(?:casual|formal|professional|friendly)',
                    r'sound\s+more\s+(?:casual|formal|professional|friendly)',
                    r'less\s+(?:formal|casual|technical|complex)',
                    r'more\s+(?:casual|formal|professional|friendly)\s+(?:and\s+)?(?:casual|formal|professional|friendly)?'
                ],
                'agents': ['writer'],
                'time': 90
            },
            
            ChangeType.SEO_KEYWORDS: {
                'keywords': ['seo', 'keywords', 'search terms', 'optimization'],
                'phrases': [
                    r'(?:add|include|use)\s+(?:more\s+)?(?:seo\s+)?keywords',
                    r'optimize\s+for\s+(?:seo|search)',
                    r'(?:seo|keywords?)\s+(?:should|need)',
                    r'search\s+(?:optimization|terms)',
                    r'rank\s+(?:better|higher)\s+(?:for|in)',
                    r'target\s+(?:keyword|search\s+term)'
                ],
                'agents': ['seo', 'writer'],
                'time': 75
            }
        }
    
    def analyze_feedback(self, feedback: str) -> ChangeRequest:
        """
        Analyze user feedback and return a targeted change request
        
        Args:
            feedback: User's feedback text
            
        Returns:
            ChangeRequest with specific change details
        """
        feedback_lower = feedback.lower().strip()
        
        # Find the best matching change type
        best_match = self._find_best_match(feedback_lower)
        
        if best_match:
            change_type, confidence = best_match
            pattern_info = self.change_patterns[change_type]
            
            return ChangeRequest(
                change_type=change_type,
                specific_target=self._extract_specific_target(feedback_lower, change_type),
                new_requirements=self._extract_requirements(feedback, change_type),
                agents_needed=pattern_info['agents'],
                estimated_time_seconds=pattern_info['time'],
                confidence_score=confidence,
                original_feedback=feedback
            )
        else:
            # Default to full rewrite if no specific pattern matches
            return ChangeRequest(
                change_type=ChangeType.FULL_REWRITE,
                specific_target="entire article",
                new_requirements=feedback,
                agents_needed=['research', 'seo', 'writer', 'feature_image', 'image_finder', 'compiler'],
                estimated_time_seconds=300,  # 5 minutes
                confidence_score=0.3,
                original_feedback=feedback
            )
    
    def _find_best_match(self, feedback_lower: str) -> Optional[tuple]:
        """Find the best matching change type"""
        matches = []
        
        for change_type, pattern_info in self.change_patterns.items():
            confidence = 0.0
            
            # Check keyword matches
            keyword_matches = 0
            for keyword in pattern_info['keywords']:
                if keyword.lower() in feedback_lower:
                    keyword_matches += 1
            
            if keyword_matches > 0:
                confidence += (keyword_matches / len(pattern_info['keywords'])) * 0.5
            
            # Check phrase pattern matches
            phrase_matches = 0
            for phrase_pattern in pattern_info['phrases']:
                if re.search(phrase_pattern, feedback_lower):
                    phrase_matches += 1
            
            if phrase_matches > 0:
                # Give higher weight to phrase matches and bonus for multiple matches
                base_phrase_confidence = (phrase_matches / len(pattern_info['phrases'])) * 0.6
                # Bonus for having both keyword and phrase matches
                if keyword_matches > 0 and phrase_matches > 0:
                    base_phrase_confidence += 0.2
                confidence += base_phrase_confidence
            
            if confidence > 0:
                matches.append((change_type, confidence))
        
        # Return the highest confidence match if above threshold
        if matches:
            matches.sort(key=lambda x: x[1], reverse=True)
            best_match = matches[0]
            if best_match[1] >= 0.3:  # Minimum confidence threshold
                return best_match
        
        return None
    
    def _extract_specific_target(self, feedback_lower: str, change_type: ChangeType) -> str:
        """Extract what specifically should be changed"""
        if change_type == ChangeType.TITLE_ONLY:
            return "article title"
        elif change_type == ChangeType.FEATURE_IMAGE:
            return "feature image"
        elif change_type == ChangeType.SUPPORTING_IMAGES:
            return "supporting images"
        elif change_type == ChangeType.INTRODUCTION:
            return "introduction section"
        elif change_type == ChangeType.CONCLUSION:
            return "conclusion section"
        elif change_type == ChangeType.META_DESCRIPTION:
            return "meta description"
        elif change_type == ChangeType.TONE_ADJUSTMENT:
            return "writing tone and style"
        elif change_type == ChangeType.SEO_KEYWORDS:
            return "SEO keywords and optimization"
        else:
            return "content"
    
    def _extract_requirements(self, feedback: str, change_type: ChangeType) -> str:
        """Extract the specific requirements from feedback"""
        # For now, return the original feedback
        # In the future, this could use NLP to extract specific requirements
        return feedback.strip()
    
    def get_change_suggestions(self) -> List[Dict[str, Any]]:
        """Get common change suggestions for UI"""
        return [
            {
                'label': 'Change Title',
                'change_type': ChangeType.TITLE_ONLY.value,
                'placeholder': 'Enter new title...',
                'estimated_time': 15
            },
            {
                'label': 'New Feature Image',
                'change_type': ChangeType.FEATURE_IMAGE.value,
                'placeholder': 'Describe the new image you want...',
                'estimated_time': 30
            },
            {
                'label': 'Different Supporting Images',
                'change_type': ChangeType.SUPPORTING_IMAGES.value,
                'placeholder': 'What type of images should we find?',
                'estimated_time': 45
            },
            {
                'label': 'Rewrite Introduction',
                'change_type': ChangeType.INTRODUCTION.value,
                'placeholder': 'How should the introduction change?',
                'estimated_time': 60
            },
            {
                'label': 'Adjust Tone',
                'change_type': ChangeType.TONE_ADJUSTMENT.value,
                'placeholder': 'Make it more casual, formal, friendly...',
                'estimated_time': 90
            },
            {
                'label': 'Update SEO',
                'change_type': ChangeType.SEO_KEYWORDS.value,
                'placeholder': 'Target different keywords or improve SEO...',
                'estimated_time': 75
            }
        ]


# Global analyzer instance
analyzer = SmartFeedbackAnalyzer()


def analyze_change_request(feedback: str) -> ChangeRequest:
    """Convenience function for analyzing feedback"""
    return analyzer.analyze_feedback(feedback)


def get_change_suggestions() -> List[Dict[str, Any]]:
    """Convenience function for getting change suggestions"""
    return analyzer.get_change_suggestions()
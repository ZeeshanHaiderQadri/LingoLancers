"""
SEO Optimization Agent for Blog Writing Team
Analyzes research data and provides SEO recommendations
Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
"""
from typing import List, Dict, Any
from dataclasses import dataclass, field
from collections import Counter
import re


@dataclass
class SEOResult:
    """Result from SEO agent"""
    primary_keywords: List[str]
    secondary_keywords: List[str]
    title_suggestions: List[str]
    meta_description: str
    heading_structure: List[Dict[str, str]]
    keyword_density: Dict[str, float]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'primary_keywords': self.primary_keywords,
            'secondary_keywords': self.secondary_keywords,
            'title_suggestions': self.title_suggestions,
            'meta_description': self.meta_description,
            'heading_structure': self.heading_structure,
            'keyword_density': self.keyword_density
        }


class SEOAgentError(Exception):
    """Base exception for SEO agent errors"""
    pass


class SEOAgent:
    """
    SEO optimization agent
    Analyzes research data and provides SEO recommendations
    """
    
    def __init__(self):
        """Initialize SEO agent"""
        self.min_keyword_length = 3
        self.max_primary_keywords = 3
        self.max_secondary_keywords = 5
        self.max_title_length = 60
        self.max_meta_description_length = 160
        self.target_keyword_density = 0.02  # 2%
        
        # Common stop words to filter out
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'what', 'which', 'who', 'when', 'where', 'why', 'how'
        }
    
    async def execute(self, research_result) -> SEOResult:
        """
        Analyze research and provide SEO recommendations
        
        Args:
            research_result: ResearchResult from research agent
            
        Returns:
            SEOResult with keywords, titles, and recommendations
            
        Raises:
            SEOAgentError: If analysis fails
        """
        try:
            # Extract keywords from research
            all_keywords = self._extract_keywords(research_result)
            
            # Categorize keywords
            primary_keywords = all_keywords[:self.max_primary_keywords]
            secondary_keywords = all_keywords[
                self.max_primary_keywords:
                self.max_primary_keywords + self.max_secondary_keywords
            ]
            
            # Generate title suggestions
            title_suggestions = self._generate_title_suggestions(
                research_result,
                primary_keywords
            )
            
            # Generate meta description
            meta_description = self._generate_meta_description(
                research_result,
                primary_keywords
            )
            
            # Suggest heading structure
            heading_structure = self._suggest_heading_structure(
                research_result,
                primary_keywords,
                secondary_keywords
            )
            
            # Calculate recommended keyword density
            keyword_density = self._calculate_keyword_density(
                primary_keywords,
                secondary_keywords
            )
            
            return SEOResult(
                primary_keywords=primary_keywords,
                secondary_keywords=secondary_keywords,
                title_suggestions=title_suggestions,
                meta_description=meta_description,
                heading_structure=heading_structure,
                keyword_density=keyword_density
            )
            
        except Exception as e:
            if isinstance(e, SEOAgentError):
                raise
            raise SEOAgentError(f"SEO analysis failed: {e}")
    
    def _extract_keywords(self, research_result) -> List[str]:
        """
        Extract keywords from research data
        
        Args:
            research_result: ResearchResult object
            
        Returns:
            List of keywords sorted by frequency
        """
        # Combine all text from research
        text_parts = []
        
        # Add query
        if research_result.query:
            text_parts.append(research_result.query)
        
        # Add insights
        text_parts.extend(research_result.insights)
        
        # Add key points
        text_parts.extend(research_result.key_points)
        
        # Add source titles
        for source in research_result.sources:
            if source.get('title'):
                text_parts.append(source['title'])
        
        # Combine all text
        combined_text = ' '.join(text_parts).lower()
        
        # Extract words
        words = re.findall(r'\b[a-z]+\b', combined_text)
        
        # Filter out stop words and short words
        filtered_words = [
            word for word in words
            if word not in self.stop_words and len(word) >= self.min_keyword_length
        ]
        
        # Count frequency
        word_counts = Counter(filtered_words)
        
        # Get most common words
        keywords = [word for word, count in word_counts.most_common(20)]
        
        # Also extract multi-word phrases (bigrams)
        bigrams = self._extract_bigrams(combined_text)
        
        # Combine single words and bigrams
        all_keywords = keywords[:10] + bigrams[:5]
        
        return all_keywords
    
    def _extract_bigrams(self, text: str) -> List[str]:
        """
        Extract two-word phrases from text
        
        Args:
            text: Text to analyze
            
        Returns:
            List of bigrams sorted by frequency
        """
        words = re.findall(r'\b[a-z]+\b', text.lower())
        
        # Create bigrams
        bigrams = []
        for i in range(len(words) - 1):
            if (words[i] not in self.stop_words and 
                words[i+1] not in self.stop_words and
                len(words[i]) >= self.min_keyword_length and
                len(words[i+1]) >= self.min_keyword_length):
                bigrams.append(f"{words[i]} {words[i+1]}")
        
        # Count frequency
        bigram_counts = Counter(bigrams)
        
        # Return most common
        return [bigram for bigram, count in bigram_counts.most_common(10)]
    
    def _generate_title_suggestions(
        self,
        research_result,
        primary_keywords: List[str]
    ) -> List[str]:
        """
        Generate SEO-optimized title suggestions
        
        Args:
            research_result: ResearchResult object
            primary_keywords: List of primary keywords
            
        Returns:
            List of title suggestions
        """
        titles = []
        
        # ALWAYS use user's original query/topic as the primary title (first in list)
        if research_result.query:
            titles.append(research_result.query)
        
        # Use first primary keyword as base for alternative suggestions
        if primary_keywords:
            main_keyword = primary_keywords[0]
            
            # Template-based title alternatives (suggestions only, not replacements)
            templates = [
                f"The Complete Guide to {main_keyword.title()}",
                f"How to Master {main_keyword.title()}: A Comprehensive Guide",
                f"{main_keyword.title()}: Everything You Need to Know",
                f"Understanding {main_keyword.title()} in 2024",
                f"Top 10 Tips for {main_keyword.title()}"
            ]
            
            titles.extend(templates)
        
        # Use key points as title inspiration
        for key_point in research_result.key_points[:3]:
            # Truncate to max length
            if len(key_point) <= self.max_title_length:
                titles.append(key_point)
            else:
                titles.append(key_point[:self.max_title_length-3] + "...")
        
        # Return unique titles, limited to 5
        unique_titles = []
        for title in titles:
            if title not in unique_titles:
                unique_titles.append(title)
            if len(unique_titles) >= 5:
                break
        
        return unique_titles
    
    def _generate_meta_description(
        self,
        research_result,
        primary_keywords: List[str]
    ) -> str:
        """
        Generate SEO-optimized meta description
        
        Args:
            research_result: ResearchResult object
            primary_keywords: List of primary keywords
            
        Returns:
            Meta description string
        """
        # Start with first insight or key point
        if research_result.insights:
            base_text = research_result.insights[0]
        elif research_result.key_points:
            base_text = research_result.key_points[0]
        else:
            base_text = f"Learn about {', '.join(primary_keywords[:2])}"
        
        # Ensure it includes primary keyword
        if primary_keywords and primary_keywords[0] not in base_text.lower():
            base_text = f"{primary_keywords[0].title()}: {base_text}"
        
        # Truncate to max length
        if len(base_text) > self.max_meta_description_length:
            base_text = base_text[:self.max_meta_description_length-3] + "..."
        
        return base_text
    
    def _suggest_heading_structure(
        self,
        research_result,
        primary_keywords: List[str],
        secondary_keywords: List[str]
    ) -> List[Dict[str, str]]:
        """
        Suggest heading structure for article
        
        Args:
            research_result: ResearchResult object
            primary_keywords: List of primary keywords
            secondary_keywords: List of secondary keywords
            
        Returns:
            List of heading suggestions with levels
        """
        headings = []
        
        # H1 - Main title (use first primary keyword)
        if primary_keywords:
            headings.append({
                'level': 'H1',
                'text': f"Understanding {primary_keywords[0].title()}",
                'keyword': primary_keywords[0]
            })
        
        # H2 - Major sections (use key points)
        for i, key_point in enumerate(research_result.key_points[:4]):
            # Try to incorporate keywords
            keyword = secondary_keywords[i] if i < len(secondary_keywords) else None
            headings.append({
                'level': 'H2',
                'text': key_point[:80],  # Limit length
                'keyword': keyword
            })
        
        # H3 - Subsections (use secondary keywords)
        for keyword in secondary_keywords[:3]:
            headings.append({
                'level': 'H3',
                'text': f"Key Aspects of {keyword.title()}",
                'keyword': keyword
            })
        
        return headings
    
    def _calculate_keyword_density(
        self,
        primary_keywords: List[str],
        secondary_keywords: List[str]
    ) -> Dict[str, float]:
        """
        Calculate recommended keyword density
        
        Args:
            primary_keywords: List of primary keywords
            secondary_keywords: List of secondary keywords
            
        Returns:
            Dictionary mapping keywords to recommended density
        """
        density = {}
        
        # Primary keywords should appear more frequently
        for keyword in primary_keywords:
            density[keyword] = self.target_keyword_density
        
        # Secondary keywords should appear less frequently
        for keyword in secondary_keywords:
            density[keyword] = self.target_keyword_density * 0.5
        
        return density
    
    def validate_keyword_usage(
        self,
        content: str,
        seo_result: SEOResult
    ) -> Dict[str, Any]:
        """
        Validate keyword usage in content
        
        Args:
            content: Article content to validate
            seo_result: SEO result with keyword recommendations
            
        Returns:
            Dictionary with validation results
        """
        content_lower = content.lower()
        word_count = len(content.split())
        
        validation = {
            'word_count': word_count,
            'keyword_usage': {},
            'recommendations': []
        }
        
        # Check each keyword
        all_keywords = seo_result.primary_keywords + seo_result.secondary_keywords
        
        for keyword in all_keywords:
            count = content_lower.count(keyword.lower())
            actual_density = count / word_count if word_count > 0 else 0
            target_density = seo_result.keyword_density.get(keyword, 0)
            
            validation['keyword_usage'][keyword] = {
                'count': count,
                'actual_density': round(actual_density, 4),
                'target_density': round(target_density, 4),
                'status': 'good' if abs(actual_density - target_density) < 0.01 else 'needs_adjustment'
            }
            
            # Add recommendations
            if actual_density < target_density * 0.5:
                validation['recommendations'].append(
                    f"Increase usage of '{keyword}' (currently {count} times)"
                )
            elif actual_density > target_density * 2:
                validation['recommendations'].append(
                    f"Reduce usage of '{keyword}' (currently {count} times)"
                )
        
        return validation

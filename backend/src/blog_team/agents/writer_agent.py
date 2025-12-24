"""
Content Writing Agent for Blog Writing Team
Uses OpenAI GPT to write blog articles based on research and SEO data
Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
"""
import os
import json
import re
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from openai import AsyncOpenAI


@dataclass
class ArticleSection:
    """Represents a section of the article"""
    heading: str
    content: str
    
    def word_count(self) -> int:
        """Get word count for this section"""
        return len(self.content.split())


@dataclass
class ArticleDraft:
    """Draft article from writer agent"""
    title: str
    introduction: str
    sections: List[ArticleSection]
    conclusion: str
    word_count: int
    seo_keywords_used: Dict[str, int]
    tone: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'title': self.title,
            'introduction': self.introduction,
            'sections': [
                {'heading': s.heading, 'content': s.content}
                for s in self.sections
            ],
            'conclusion': self.conclusion,
            'word_count': self.word_count,
            'seo_keywords_used': self.seo_keywords_used,
            'tone': self.tone
        }


class WriterAgentError(Exception):
    """Base exception for writer agent errors"""
    pass


class OpenAIAPIError(WriterAgentError):
    """Raised when OpenAI API fails"""
    pass


class WriterAgent:
    """
    Content writing agent using OpenAI GPT
    Writes blog articles based on research and SEO recommendations
    """
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-3.5-turbo-16k"):
        """
        Initialize writer agent
        
        Args:
            api_key: OpenAI API key. If None, reads from OPENAI_API_KEY env var
            model: OpenAI model to use (default: gpt-3.5-turbo-16k)
            
        Raises:
            WriterAgentError: If API key is not provided or found
        """
        if api_key is None:
            api_key = os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            raise WriterAgentError(
                "OpenAI API key not found. Set OPENAI_API_KEY environment variable or pass key to constructor."
            )
        
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
        self.temperature = 0.7
        self.max_tokens = 4000
        
        # Length targets (word counts)
        self.length_targets = {
            'short': (500, 800),
            'medium': (1000, 1500),
            'long': (2000, 3000)
        }
    
    async def execute(
        self,
        research_result,
        seo_result,
        blog_request
    ) -> ArticleDraft:
        """
        Write blog article based on research and SEO data
        
        Args:
            research_result: ResearchResult from research agent
            seo_result: SEOResult from SEO agent
            blog_request: BlogRequest with user preferences
            
        Returns:
            ArticleDraft with complete article
            
        Raises:
            WriterAgentError: If writing fails
            OpenAIAPIError: If OpenAI API call fails
        """
        try:
            # Build writing prompt
            prompt = self._build_writing_prompt(
                research_result,
                seo_result,
                blog_request
            )
            
            # Get system prompt for tone
            system_prompt = self._get_system_prompt(blog_request.tone)
            
            # Generate article with GPT
            article_text = await self._generate_with_gpt(system_prompt, prompt)
            
            # Parse structured article
            structured_article = self._parse_article(article_text)
            
            # Count keyword usage
            keyword_usage = self._count_keyword_usage(
                article_text,
                seo_result.primary_keywords + seo_result.secondary_keywords
            )
            
            # Calculate word count
            word_count = len(article_text.split())
            
            return ArticleDraft(
                title=structured_article['title'],
                introduction=structured_article['introduction'],
                sections=structured_article['sections'],
                conclusion=structured_article['conclusion'],
                word_count=word_count,
                seo_keywords_used=keyword_usage,
                tone=blog_request.tone
            )
            
        except Exception as e:
            if isinstance(e, (WriterAgentError, OpenAIAPIError)):
                raise
            raise WriterAgentError(f"Article writing failed: {e}")
    
    def _build_writing_prompt(
        self,
        research_result,
        seo_result,
        blog_request
    ) -> str:
        """
        Build writing prompt from research and SEO data
        
        Args:
            research_result: Research data
            seo_result: SEO recommendations
            blog_request: User request
            
        Returns:
            Formatted prompt string
        """
        # Get length target
        length = blog_request.length or 'medium'
        min_words, max_words = self.length_targets.get(length, (1000, 1500))
        
        # Build prompt
        prompt_parts = []
        
        # Title and length requirements
        prompt_parts.append(f"Write a comprehensive blog article about: {research_result.query}")
        prompt_parts.append(f"\nTarget length: {min_words}-{max_words} words")
        
        # SEO requirements
        if seo_result.primary_keywords:
            prompt_parts.append(f"\nPrimary keywords to include: {', '.join(seo_result.primary_keywords)}")
        
        if seo_result.title_suggestions:
            prompt_parts.append(f"\nSuggested title: {seo_result.title_suggestions[0]}")
        
        # Research insights
        prompt_parts.append("\n\nKey insights from research:")
        for i, insight in enumerate(research_result.insights[:5], 1):
            prompt_parts.append(f"{i}. {insight[:200]}...")
        
        # Key points to cover
        prompt_parts.append("\n\nKey points to cover:")
        for i, point in enumerate(research_result.key_points[:5], 1):
            prompt_parts.append(f"{i}. {point}")
        
        # Heading structure
        if seo_result.heading_structure:
            prompt_parts.append("\n\nSuggested heading structure:")
            for heading in seo_result.heading_structure[:6]:
                prompt_parts.append(f"- {heading['level']}: {heading['text']}")
        
        # Format requirements
        prompt_parts.append("\n\nFormat the article with:")
        prompt_parts.append("- A compelling title")
        prompt_parts.append("- An engaging introduction (2-3 paragraphs)")
        prompt_parts.append("- 3-5 main sections with clear headings")
        prompt_parts.append("- A strong conclusion")
        prompt_parts.append("\nUse markdown formatting for headings (# for title, ## for sections).")
        
        return "\n".join(prompt_parts)
    
    def _get_system_prompt(self, tone: str) -> str:
        """
        Get system prompt based on tone
        
        Args:
            tone: Desired tone (professional, casual, technical, friendly)
            
        Returns:
            System prompt string
        """
        tone_prompts = {
            'professional': (
                "You are a professional blog writer who creates well-researched, "
                "authoritative content. Write in a clear, formal tone suitable for "
                "business and professional audiences. Use industry terminology appropriately."
            ),
            'casual': (
                "You are a friendly blog writer who creates engaging, conversational content. "
                "Write in a relaxed, approachable tone. Use everyday language and connect "
                "with readers personally."
            ),
            'technical': (
                "You are a technical writer who creates detailed, precise content for "
                "expert audiences. Use technical terminology, provide in-depth explanations, "
                "and include specific details and examples."
            ),
            'friendly': (
                "You are an enthusiastic blog writer who creates warm, welcoming content. "
                "Write in an encouraging, supportive tone. Make complex topics accessible "
                "and engaging for all readers."
            )
        }
        
        return tone_prompts.get(tone, tone_prompts['professional'])
    
    async def _generate_with_gpt(self, system_prompt: str, user_prompt: str) -> str:
        """
        Generate article using OpenAI GPT
        
        Args:
            system_prompt: System message for tone
            user_prompt: User message with requirements
            
        Returns:
            Generated article text
            
        Raises:
            OpenAIAPIError: If API call fails
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise OpenAIAPIError(f"OpenAI API call failed: {e}")
    
    def _parse_article(self, article_text: str) -> Dict[str, Any]:
        """
        Parse structured article from GPT response
        
        Args:
            article_text: Raw article text from GPT
            
        Returns:
            Dictionary with structured article components
        """
        lines = article_text.strip().split('\n')
        
        # Extract title (first # heading)
        title = "Untitled Article"
        for line in lines:
            if line.startswith('# '):
                title = line[2:].strip()
                break
        
        # Split into sections
        sections = []
        current_section = None
        introduction = ""
        conclusion = ""
        in_intro = True
        
        for line in lines:
            # Skip title line
            if line.startswith('# '):
                in_intro = False
                continue
            
            # Section heading (##)
            if line.startswith('## '):
                # Save previous section
                if current_section:
                    sections.append(current_section)
                
                # Start new section
                heading = line[3:].strip()
                current_section = ArticleSection(heading=heading, content="")
                in_intro = False
                
            # Content line
            elif line.strip():
                if in_intro and not current_section:
                    # Still in introduction
                    introduction += line + "\n"
                elif current_section:
                    # Add to current section
                    current_section.content += line + "\n"
        
        # Save last section
        if current_section:
            # Check if last section is conclusion
            if 'conclusion' in current_section.heading.lower():
                conclusion = current_section.content
            else:
                sections.append(current_section)
        
        # If no explicit conclusion, use last paragraph
        if not conclusion and sections:
            last_section = sections[-1]
            paragraphs = last_section.content.strip().split('\n\n')
            if len(paragraphs) > 1:
                conclusion = paragraphs[-1]
                last_section.content = '\n\n'.join(paragraphs[:-1])
        
        return {
            'title': title,
            'introduction': introduction.strip(),
            'sections': sections,
            'conclusion': conclusion.strip()
        }
    
    def _count_keyword_usage(self, text: str, keywords: List[str]) -> Dict[str, int]:
        """
        Count keyword usage in article
        
        Args:
            text: Article text
            keywords: List of keywords to count
            
        Returns:
            Dictionary mapping keywords to usage count
        """
        text_lower = text.lower()
        usage = {}
        
        for keyword in keywords:
            count = text_lower.count(keyword.lower())
            if count > 0:
                usage[keyword] = count
        
        return usage
    
    def validate_article_length(
        self,
        article: ArticleDraft,
        target_length: str
    ) -> Dict[str, Any]:
        """
        Validate article meets length requirements
        
        Args:
            article: Article draft to validate
            target_length: Target length (short, medium, long)
            
        Returns:
            Validation result dictionary
        """
        min_words, max_words = self.length_targets.get(target_length, (1000, 1500))
        
        within_range = min_words <= article.word_count <= max_words
        
        return {
            'target_length': target_length,
            'min_words': min_words,
            'max_words': max_words,
            'actual_words': article.word_count,
            'within_range': within_range,
            'percentage_of_target': (article.word_count / ((min_words + max_words) / 2)) * 100
        }
    
    def get_article_statistics(self, article: ArticleDraft) -> Dict[str, Any]:
        """
        Get detailed statistics about the article
        
        Args:
            article: Article draft
            
        Returns:
            Statistics dictionary
        """
        return {
            'word_count': article.word_count,
            'section_count': len(article.sections),
            'avg_section_length': sum(s.word_count() for s in article.sections) / len(article.sections) if article.sections else 0,
            'introduction_length': len(article.introduction.split()),
            'conclusion_length': len(article.conclusion.split()),
            'keywords_used': len(article.seo_keywords_used),
            'total_keyword_mentions': sum(article.seo_keywords_used.values()),
            'tone': article.tone
        }

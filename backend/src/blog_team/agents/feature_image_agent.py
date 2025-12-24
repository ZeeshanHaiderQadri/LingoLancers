"""
Feature Image Generation Agent for Blog Writing Team
Uses Azure FLUX API to generate feature images for blog articles
Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
"""
import os
import httpx
from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class ImageResult:
    """Result from image generation"""
    image_url: str
    alt_text: str
    prompt_used: str
    size: str = "1024x1024"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'image_url': self.image_url,
            'alt_text': self.alt_text,
            'prompt_used': self.prompt_used,
            'size': self.size
        }


class FeatureImageAgentError(Exception):
    """Base exception for feature image agent errors"""
    pass


class AzureFluxAPIError(FeatureImageAgentError):
    """Raised when Azure FLUX API fails"""
    pass


class FeatureImageAgent:
    """
    Feature image generation agent using Azure FLUX
    Generates feature images for blog articles
    """
    
    def __init__(
        self,
        endpoint: Optional[str] = None,
        api_key: Optional[str] = None,
        api_version: Optional[str] = None
    ):
        """
        Initialize feature image agent
        
        Args:
            endpoint: Azure FLUX endpoint URL
            api_key: Azure FLUX API key
            api_version: API version
            
        Raises:
            FeatureImageAgentError: If configuration is missing
        """
        self.endpoint = endpoint or os.getenv("AZURE_FLUX_ENDPOINT")
        self.api_key = api_key or os.getenv("AZURE_FLUX_API_KEY")
        self.api_version = api_version or os.getenv("AZURE_FLUX_API_VERSION", "2024-02-01")
        
        if not self.endpoint:
            raise FeatureImageAgentError(
                "Azure FLUX endpoint not found. Set AZURE_FLUX_ENDPOINT environment variable."
            )
        
        if not self.api_key:
            raise FeatureImageAgentError(
                "Azure FLUX API key not found. Set AZURE_FLUX_API_KEY environment variable."
            )
        
        self.default_size = "1024x1024"
        self.default_quality = "standard"
        self.timeout = 60.0  # 60 seconds for image generation
    
    async def execute(self, article_draft) -> ImageResult:
        """
        Generate feature image for article
        
        Args:
            article_draft: ArticleDraft from writer agent
            
        Returns:
            ImageResult with image URL and metadata
            
        Raises:
            FeatureImageAgentError: If generation fails
            AzureFluxAPIError: If API call fails
        """
        try:
            # Create image prompt from article
            prompt = self._create_image_prompt(article_draft)
            
            # Generate image with Azure FLUX
            image_url = await self._generate_with_flux(prompt)
            
            # Generate alt text for accessibility
            alt_text = self._generate_alt_text(article_draft)
            
            return ImageResult(
                image_url=image_url,
                alt_text=alt_text,
                prompt_used=prompt,
                size=self.default_size
            )
            
        except Exception as e:
            if isinstance(e, (FeatureImageAgentError, AzureFluxAPIError)):
                raise
            raise FeatureImageAgentError(f"Feature image generation failed: {e}")
    
    def _create_image_prompt(self, article_draft) -> str:
        """
        Create image generation prompt from article
        
        Args:
            article_draft: Article draft
            
        Returns:
            Image generation prompt
        """
        # Extract key themes from title and introduction
        title = article_draft.title
        intro = article_draft.introduction[:200] if article_draft.introduction else ""
        
        # Build prompt focusing on visual representation
        prompt_parts = []
        
        # Main subject from title
        prompt_parts.append(f"A professional, high-quality feature image representing: {title}.")
        
        # Add context from introduction
        if intro:
            # Extract key visual concepts
            prompt_parts.append(f"Visual theme: {intro}")
        
        # Style guidelines
        prompt_parts.append("Style: modern, clean, professional, suitable for blog article.")
        prompt_parts.append("High resolution, vibrant colors, engaging composition.")
        
        # Combine into single prompt
        full_prompt = " ".join(prompt_parts)
        
        # Limit prompt length (FLUX typically handles up to 1000 chars well)
        if len(full_prompt) > 800:
            full_prompt = full_prompt[:800] + "..."
        
        return full_prompt
    
    async def _generate_with_flux(self, prompt: str) -> str:
        """
        Generate image using Azure FLUX API
        
        Args:
            prompt: Image generation prompt
            
        Returns:
            Image URL
            
        Raises:
            AzureFluxAPIError: If API call fails
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "api-key": self.api_key
            }
            
            payload = {
                "prompt": prompt,
                "size": self.default_size,
                "n": 1,
                "quality": self.default_quality,
                "response_format": "b64_json"
            }
            
            params = {
                "api-version": self.api_version
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.endpoint,
                    headers=headers,
                    json=payload,
                    params=params
                )
                
                response.raise_for_status()
                
                result = response.json()
                
                # Extract base64 image data from response
                if 'data' in result and len(result['data']) > 0:
                    # Azure FLUX returns base64 encoded image
                    b64_data = result['data'][0].get('b64_json')
                    if b64_data:
                        # Return as data URL for immediate use
                        return f"data:image/png;base64,{b64_data}"
                    else:
                        raise AzureFluxAPIError("No b64_json data in API response")
                else:
                    raise AzureFluxAPIError("No image data in API response")
                    
        except httpx.HTTPStatusError as e:
            raise AzureFluxAPIError(f"Azure FLUX API HTTP error: {e.response.status_code} - {e.response.text}")
        except httpx.TimeoutException:
            raise AzureFluxAPIError("Azure FLUX API request timed out")
        except Exception as e:
            raise AzureFluxAPIError(f"Azure FLUX API call failed: {e}")
    
    def _generate_alt_text(self, article_draft) -> str:
        """
        Generate alt text for accessibility
        
        Args:
            article_draft: Article draft
            
        Returns:
            Alt text description
        """
        # Create descriptive alt text from title
        title = article_draft.title
        
        # Format as descriptive alt text
        alt_text = f"Feature image for article: {title}"
        
        # Limit length (alt text should be concise, typically under 125 chars)
        if len(alt_text) > 125:
            alt_text = alt_text[:122] + "..."
        
        return alt_text
    
    def create_fallback_image_url(self, article_draft) -> ImageResult:
        """
        Create fallback image result when generation fails
        
        Args:
            article_draft: Article draft
            
        Returns:
            ImageResult with placeholder
        """
        # Use a placeholder service
        title_encoded = article_draft.title.replace(' ', '+')[:50]
        placeholder_url = f"https://via.placeholder.com/1024x1024.png?text={title_encoded}"
        
        return ImageResult(
            image_url=placeholder_url,
            alt_text=self._generate_alt_text(article_draft),
            prompt_used="Fallback placeholder",
            size="1024x1024"
        )
    
    def validate_image_url(self, image_url: str) -> bool:
        """
        Validate image URL format
        
        Args:
            image_url: URL to validate
            
        Returns:
            True if valid
        """
        if not image_url:
            return False
        
        # Check if it's a valid URL
        return image_url.startswith(('http://', 'https://'))
    
    async def test_connection(self) -> bool:
        """
        Test Azure FLUX API connection
        
        Returns:
            True if connection successful
        """
        try:
            # Try a simple generation with minimal prompt
            test_prompt = "A simple test image"
            await self._generate_with_flux(test_prompt)
            return True
        except Exception:
            return False

"""
Image Finder Agent for Blog Writing Team
Uses Unsplash API to find supporting images for blog articles
Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
"""
import os
import httpx
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class SupportingImage:
    """Supporting image for article section"""
    section_heading: str
    image_url: str
    thumbnail_url: str
    alt_text: str
    attribution: Dict[str, str]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'section_heading': self.section_heading,
            'image_url': self.image_url,
            'thumbnail_url': self.thumbnail_url,
            'alt_text': self.alt_text,
            'attribution': self.attribution
        }


@dataclass
class SupportingImagesResult:
    """Result from image finder agent"""
    images: List[SupportingImage]
    total_found: int
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'images': [img.to_dict() for img in self.images],
            'total_found': self.total_found
        }


class ImageFinderAgentError(Exception):
    """Base exception for image finder agent errors"""
    pass


class UnsplashAPIError(ImageFinderAgentError):
    """Raised when Unsplash API fails"""
    pass


class ImageFinderAgent:
    """
    Image finder agent using Unsplash API
    Finds supporting images for blog article sections
    """
    
    def __init__(
        self, 
        unsplash_key: Optional[str] = None,
        pexels_key: Optional[str] = None
    ):
        """
        Initialize image finder agent with multiple sources
        
        Args:
            unsplash_key: Unsplash API access key
            pexels_key: Pexels API key
            
        Raises:
            ImageFinderAgentError: If no API keys are provided
        """
        self.unsplash_key = unsplash_key or os.getenv("UNSPLASH_ACCESS_KEY")
        self.pexels_key = pexels_key or os.getenv("PEXELS_API_KEY")
        
        if not self.unsplash_key and not self.pexels_key:
            raise ImageFinderAgentError(
                "No image API keys found. Set UNSPLASH_ACCESS_KEY or PEXELS_API_KEY environment variable."
            )
        
        self.unsplash_url = "https://api.unsplash.com"
        self.pexels_url = "https://api.pexels.com/v1"
        self.per_page = 3  # Get top 3 results per search
        self.timeout = 30.0
    
    async def execute(self, article_draft) -> SupportingImagesResult:
        """
        Find supporting images for article sections
        
        Args:
            article_draft: ArticleDraft from writer agent
            
        Returns:
            SupportingImagesResult with images for sections
            
        Raises:
            ImageFinderAgentError: If image finding fails
        """
        try:
            # Identify key sections needing images (2-3 sections)
            key_sections = self._identify_key_sections(article_draft)
            
            # Search for images for each section
            images = []
            for section in key_sections:
                try:
                    image = await self._search_image_for_section(section)
                    if image:
                        images.append(image)
                except Exception as e:
                    print(f"Warning: Failed to find image for section '{section.heading}': {e}")
                    continue
            
            return SupportingImagesResult(
                images=images,
                total_found=len(images)
            )
            
        except Exception as e:
            if isinstance(e, ImageFinderAgentError):
                raise
            raise ImageFinderAgentError(f"Image finding failed: {e}")
    
    def _identify_key_sections(self, article_draft) -> List[Any]:
        """
        Identify 2-3 key sections that need images
        
        Args:
            article_draft: Article draft
            
        Returns:
            List of key sections
        """
        sections = article_draft.sections
        
        # Select first 2-3 sections (typically most important)
        key_sections = sections[:min(3, len(sections))]
        
        return key_sections
    
    async def _search_image_for_section(self, section) -> Optional[SupportingImage]:
        """
        Search for image for a specific section using multiple sources
        
        Args:
            section: Article section
            
        Returns:
            SupportingImage or None
        """
        # Create search query from section heading
        query = self._create_search_query(section.heading)
        
        # Try Unsplash first if available
        if self.unsplash_key:
            try:
                results = await self._search_unsplash(query)
                if results and len(results) > 0:
                    return self._create_image_from_unsplash(results[0], section.heading)
            except Exception as e:
                print(f"Unsplash search failed, trying Pexels: {e}")
        
        # Try Pexels as fallback or primary if Unsplash not available
        if self.pexels_key:
            try:
                results = await self._search_pexels(query)
                if results and len(results) > 0:
                    return self._create_image_from_pexels(results[0], section.heading)
            except Exception as e:
                print(f"Pexels search failed: {e}")
        
        return None
    
    def _create_image_from_unsplash(self, photo: Dict[str, Any], heading: str) -> SupportingImage:
        """Create SupportingImage from Unsplash result"""
        return SupportingImage(
            section_heading=heading,
            image_url=photo['urls']['regular'],
            thumbnail_url=photo['urls']['thumb'],
            alt_text=photo.get('alt_description') or photo.get('description') or heading,
            attribution={
                'photographer_name': photo['user']['name'],
                'photographer_url': photo['user']['links']['html'],
                'photo_url': photo['links']['html'],
                'platform': 'Unsplash'
            }
        )
    
    def _create_image_from_pexels(self, photo: Dict[str, Any], heading: str) -> SupportingImage:
        """Create SupportingImage from Pexels result"""
        return SupportingImage(
            section_heading=heading,
            image_url=photo['src']['large'],
            thumbnail_url=photo['src']['small'],
            alt_text=photo.get('alt') or heading,
            attribution={
                'photographer_name': photo['photographer'],
                'photographer_url': photo['photographer_url'],
                'photo_url': photo['url'],
                'platform': 'Pexels'
            }
        )
    
    def _create_search_query(self, heading: str) -> str:
        """
        Create search query from section heading
        
        Args:
            heading: Section heading
            
        Returns:
            Search query string
        """
        # Remove common words and clean up
        query = heading.lower()
        
        # Remove question marks, colons, etc.
        query = query.replace('?', '').replace(':', '').replace('-', ' ')
        
        # Limit length
        words = query.split()[:5]  # First 5 words
        
        return ' '.join(words)
    
    async def _search_unsplash(self, query: str) -> List[Dict[str, Any]]:
        """
        Search Unsplash API
        
        Args:
            query: Search query
            
        Returns:
            List of photo results
            
        Raises:
            UnsplashAPIError: If API call fails
        """
        try:
            headers = {
                "Authorization": f"Client-ID {self.unsplash_key}"
            }
            
            params = {
                "query": query,
                "per_page": self.per_page,
                "orientation": "landscape"  # Prefer landscape for blog images
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.unsplash_url}/search/photos",
                    headers=headers,
                    params=params
                )
                
                response.raise_for_status()
                
                result = response.json()
                
                return result.get('results', [])
                
        except httpx.HTTPStatusError as e:
            raise UnsplashAPIError(f"Unsplash API HTTP error: {e.response.status_code}")
        except httpx.TimeoutException:
            raise UnsplashAPIError("Unsplash API request timed out")
        except Exception as e:
            raise UnsplashAPIError(f"Unsplash API call failed: {e}")
    
    async def _search_pexels(self, query: str) -> List[Dict[str, Any]]:
        """
        Search Pexels API
        
        Args:
            query: Search query
            
        Returns:
            List of photo results
            
        Raises:
            UnsplashAPIError: If API call fails
        """
        try:
            headers = {
                "Authorization": self.pexels_key
            }
            
            params = {
                "query": query,
                "per_page": self.per_page,
                "orientation": "landscape"
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.pexels_url}/search",
                    headers=headers,
                    params=params
                )
                
                response.raise_for_status()
                
                result = response.json()
                
                return result.get('photos', [])
                
        except httpx.HTTPStatusError as e:
            raise UnsplashAPIError(f"Pexels API HTTP error: {e.response.status_code}")
        except httpx.TimeoutException:
            raise UnsplashAPIError("Pexels API request timed out")
        except Exception as e:
            raise UnsplashAPIError(f"Pexels API call failed: {e}")
    
    def format_attribution(self, image: SupportingImage) -> str:
        """
        Format attribution text for image
        
        Args:
            image: Supporting image
            
        Returns:
            Formatted attribution string
        """
        attr = image.attribution
        return (
            f"Photo by {attr['photographer_name']} on {attr['platform']} "
            f"({attr['photo_url']})"
        )
    
    async def test_connection(self) -> Dict[str, bool]:
        """
        Test image API connections
        
        Returns:
            Dictionary with connection status for each API
        """
        status = {}
        
        if self.unsplash_key:
            try:
                await self._search_unsplash("test")
                status['unsplash'] = True
            except Exception:
                status['unsplash'] = False
        
        if self.pexels_key:
            try:
                await self._search_pexels("test")
                status['pexels'] = True
            except Exception:
                status['pexels'] = False
        
        return status

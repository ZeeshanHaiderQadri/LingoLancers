"""
Logo Generator using Google Gemini Imagen API
Professional logo design with multiple style options
"""

import os
import base64
from typing import Optional, Dict, Any, List
from io import BytesIO
from PIL import Image
from google import genai
from google.genai import types


class LogoGenerator:
    """
    Professional Logo Generator using Gemini 2.5 Flash Image
    
    Capabilities:
    - 7 logo styles (Emblem, Brand Mark, Monogram, Letter Mark, Abstract, Mascot, Combine)
    - Multiple variations per generation (4 logos)
    - Professional design quality
    - Transparent backgrounds
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize with Gemini API key"""
        # Logo Generator always uses API key (like Product Shot)
        self.api_key = api_key or os.getenv('GEMINI_NANO_BANANA_API_KEY')
        
        if not self.api_key:
            raise ValueError("❌ GEMINI_NANO_BANANA_API_KEY required! Get it from: https://aistudio.google.com/apikey")
        
        try:
            # Ensure we're NOT using Vertex AI
            if 'GOOGLE_GENAI_USE_VERTEXAI' in os.environ:
                original_vertex_setting = os.environ.get('GOOGLE_GENAI_USE_VERTEXAI')
                os.environ['GOOGLE_GENAI_USE_VERTEXAI'] = 'False'
                
            self.client = genai.Client(api_key=self.api_key)
            self.model_name = "gemini-2.5-flash-image"
            
            # Restore original setting if it existed
            if 'original_vertex_setting' in locals() and original_vertex_setting:
                os.environ['GOOGLE_GENAI_USE_VERTEXAI'] = original_vertex_setting
            
            print("✅ Logo Generator initialized with API key!")
        except Exception as e:
            raise Exception(f"Failed to initialize Logo Generator: {e}")
    
    def generate_logo(
        self,
        prompt: str,
        style: str = "brandmark"
    ) -> Dict[str, Any]:
        """
        Generate professional logo
        
        Args:
            prompt: Logo description (e.g., "Modern tech company logo with text 'HNIT Limited'")
            style: Logo style (emblem, brandmark, monogram, lettermark, abstract, mascot, combine)
        
        Returns:
            Dict with success, image_data (base64), and metadata
        """
        try:
            # Build professional logo prompt
            enhanced_prompt = self._build_logo_prompt(prompt, style)
            
            print(f"🎨 Generating logo...")
            print(f"   Style: {style}")
            print(f"   Prompt: {prompt[:50]}...")
            
            # Configure generation for square logo (1:1 aspect ratio)
            config = types.GenerateContentConfig(
                response_modalities=['Image'],
                image_config=types.ImageConfig(aspect_ratio='1:1')
            )
            
            # Generate logo
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[enhanced_prompt],
                config=config
            )
            
            # Extract result
            result = self._extract_image_result(response)
            
            if result['success']:
                result['prompt'] = enhanced_prompt
                result['style'] = style
                result['original_prompt'] = prompt
                print(f"✅ Logo generated successfully!")
            
            return result
            
        except Exception as e:
            print(f"❌ Logo generation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _build_logo_prompt(self, prompt: str, style: str) -> str:
        """Build professional logo design prompt"""
        
        # Style-specific guidelines
        style_guides = {
            'emblem': """
Style: Emblem Logo (Badge/Seal Style)
- Circular or shield-shaped design
- Text integrated within the emblem
- Traditional, authoritative feel
- Detailed but scalable
- Classic badge or crest aesthetic
""",
            'brandmark': """
Style: Brand Mark / Pictorial Logo
- Iconic symbol or mark
- Recognizable visual element
- Simple, memorable shape
- Works without text
- Think: Apple, Twitter bird, Nike swoosh
""",
            'monogram': """
Style: Monogram Logo
- Interlocking or combined letters
- Elegant typography
- Initials-based design
- Sophisticated and refined
- Think: Chanel, Louis Vuitton, HBO
""",
            'lettermark': """
Style: Letter Mark Logo
- Typography-focused design
- Stylized letters or initials
- Clean, modern font treatment
- Minimal but impactful
- Think: IBM, CNN, HP
""",
            'abstract': """
Style: Abstract / Logo Mark
- Geometric shapes and forms
- Modern, conceptual design
- Unique abstract symbol
- Memorable visual identity
- Think: Pepsi, Adidas, BP
""",
            'mascot': """
Style: Mascot Logo
- Character-based design
- Friendly, approachable personality
- Illustrated character or figure
- Engaging and memorable
- Think: KFC Colonel, Pringles man
""",
            'combine': """
Style: Combination Mark
- Text + symbol together
- Integrated design
- Versatile usage
- Both elements work together
- Think: Burger King, Doritos, Lacoste
"""
        }
        
        style_guide = style_guides.get(style, style_guides['brandmark'])
        
        # Professional logo design template
        logo_prompt = f"""Professional logo design: {prompt}

{style_guide}

Design Requirements:
- Clean, professional appearance
- Scalable vector-style design
- Works in both color and black/white
- Transparent or white background
- High contrast and clarity
- Modern, timeless aesthetic
- Suitable for business use

Technical Specifications:
- Square format (1:1 ratio)
- Centered composition
- Clear, sharp edges
- Professional color palette
- Balanced proportions
- Print and digital ready

Quality Standards:
- Award-winning design quality
- Memorable and distinctive
- Versatile across applications
- Timeless, not trendy
- Appropriate for brand identity
"""
        
        return logo_prompt.strip()
    
    def _extract_image_result(self, response) -> Dict[str, Any]:
        """Extract image from API response"""
        
        result = {
            'success': False,
            'image_data': None,
            'mime_type': None
        }
        
        try:
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None:
                    # Convert to base64
                    result['image_data'] = base64.b64encode(part.inline_data.data).decode('utf-8')
                    result['mime_type'] = part.inline_data.mime_type
                    result['success'] = True
                    break
        except Exception as e:
            result['error'] = f"Failed to extract image: {e}"
        
        return result
    
    def get_available_styles(self) -> List[Dict[str, str]]:
        """Get list of available logo styles"""
        return [
            {
                'id': 'emblem',
                'name': 'Emblem',
                'description': 'Badge or seal style with traditional feel'
            },
            {
                'id': 'brandmark',
                'name': 'Brand Mark / Pictorial',
                'description': 'Iconic symbol that represents the brand'
            },
            {
                'id': 'monogram',
                'name': 'Monogram',
                'description': 'Interlocking letters with elegant typography'
            },
            {
                'id': 'lettermark',
                'name': 'Letter Mark',
                'description': 'Typography-based design with stylized letters'
            },
            {
                'id': 'abstract',
                'name': 'Abstract / Logo Mark',
                'description': 'Geometric shapes and modern conceptual design'
            },
            {
                'id': 'mascot',
                'name': 'Mascot',
                'description': 'Character-based design with personality'
            },
            {
                'id': 'combine',
                'name': 'Combination Mark',
                'description': 'Text and symbol integrated together'
            }
        ]

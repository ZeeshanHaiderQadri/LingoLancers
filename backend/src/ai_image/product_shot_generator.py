"""
Real Product Shot Generator using Google Gemini Imagen API
Based on Nano Banana's proven implementation
"""

import os
import base64
from typing import Optional, Dict, Any, List
from io import BytesIO
from PIL import Image
from google import genai
from google.genai import types


class ProductShotGenerator:
    """
    Professional Product Photography Generator using Gemini 2.5 Flash Image
    
    Capabilities:
    1. Text-to-Image: Generate product photos from descriptions
    2. Image-to-Image: Enhance existing product photos
    3. Platform Optimization: Tailored for e-commerce platforms
    4. Style Presets: Professional photography styles
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize with Gemini API key (always uses API key, not Vertex AI)"""
        # Product Shot always uses API key authentication (like Nano Banana)
        # This is separate from Virtual Try-On which uses Vertex AI
        self.api_key = api_key or os.getenv('GEMINI_NANO_BANANA_API_KEY')
        
        if not self.api_key:
            raise ValueError("❌ GEMINI_NANO_BANANA_API_KEY required! Get it from: https://aistudio.google.com/apikey")
        
        try:
            # Ensure we're NOT using Vertex AI for this feature
            if 'GOOGLE_GENAI_USE_VERTEXAI' in os.environ:
                # Temporarily disable Vertex AI for this client
                original_vertex_setting = os.environ.get('GOOGLE_GENAI_USE_VERTEXAI')
                os.environ['GOOGLE_GENAI_USE_VERTEXAI'] = 'False'
                
            self.client = genai.Client(api_key=self.api_key)
            self.model_name = "gemini-2.5-flash-image"
            
            # Restore original setting if it existed
            if 'original_vertex_setting' in locals() and original_vertex_setting:
                os.environ['GOOGLE_GENAI_USE_VERTEXAI'] = original_vertex_setting
            
            print("✅ Product Shot Generator initialized with API key!")
        except Exception as e:
            raise Exception(f"Failed to initialize: {e}")
    
    def generate_from_text(
        self,
        prompt: str,
        platform: str = "shopify",
        style: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate product shot from text description
        
        Args:
            prompt: Product description
            platform: Target platform (shopify, amazon, etsy, instagram, facebook)
            style: Photography style preset
        
        Returns:
            Dict with success, image_data (base64), and metadata
        """
        try:
            # Get platform-specific configuration
            aspect_ratio = self._get_platform_aspect_ratio(platform)
            
            # Build professional product photography prompt
            enhanced_prompt = self._build_product_prompt(prompt, platform, style)
            
            print(f"🎨 Generating product shot from text...")
            print(f"   Platform: {platform} ({aspect_ratio})")
            print(f"   Style: {style or 'default'}")
            
            # Configure generation
            config = types.GenerateContentConfig(
                response_modalities=['Image'],
                image_config=types.ImageConfig(aspect_ratio=aspect_ratio)
            )
            
            # Generate image
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[enhanced_prompt],
                config=config
            )
            
            # Extract result
            result = self._extract_image_result(response)
            
            if result['success']:
                result['prompt'] = enhanced_prompt
                result['platform'] = platform
                result['style'] = style
                result['mode'] = 'text-to-image'
                print(f"✅ Product shot generated successfully!")
            
            return result
            
        except Exception as e:
            print(f"❌ Generation error: {e}")
            return {
                'success': False,
                'error': str(e),
                'mode': 'text-to-image'
            }
    
    def generate_from_image(
        self,
        prompt: str,
        image_data: bytes,
        platform: str = "shopify",
        style: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate product shot from existing image
        
        Args:
            prompt: Enhancement instructions
            image_data: Source image bytes
            platform: Target platform
            style: Photography style preset
        
        Returns:
            Dict with success, image_data (base64), and metadata
        """
        try:
            # Load source image
            source_image = Image.open(BytesIO(image_data))
            
            # Get platform-specific configuration
            aspect_ratio = self._get_platform_aspect_ratio(platform)
            
            # Build enhancement prompt
            enhanced_prompt = self._build_enhancement_prompt(prompt, platform, style)
            
            print(f"🎨 Enhancing product shot from image...")
            print(f"   Source: {source_image.size} {source_image.mode}")
            print(f"   Platform: {platform} ({aspect_ratio})")
            
            # Configure generation
            config = types.GenerateContentConfig(
                response_modalities=['Image'],
                image_config=types.ImageConfig(aspect_ratio=aspect_ratio)
            )
            
            # Generate enhanced image
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[source_image, enhanced_prompt],
                config=config
            )
            
            # Extract result
            result = self._extract_image_result(response)
            
            if result['success']:
                result['prompt'] = enhanced_prompt
                result['platform'] = platform
                result['style'] = style
                result['mode'] = 'image-to-image'
                print(f"✅ Product shot enhanced successfully!")
            
            return result
            
        except Exception as e:
            print(f"❌ Enhancement error: {e}")
            return {
                'success': False,
                'error': str(e),
                'mode': 'image-to-image'
            }
    
    def _get_platform_aspect_ratio(self, platform: str) -> str:
        """Get optimal aspect ratio for platform"""
        platform_ratios = {
            'shopify': '1:1',
            'amazon': '1:1',
            'etsy': '1:1',
            'instagram': '1:1',
            'facebook': '1:1',
            'pinterest': '2:3',
            'twitter': '16:9'
        }
        return platform_ratios.get(platform.lower(), '1:1')
    
    def _build_product_prompt(
        self,
        prompt: str,
        platform: str,
        style: Optional[str]
    ) -> str:
        """Build professional product photography prompt"""
        
        # Base professional photography template
        base_template = f"""Professional commercial product photography: {prompt}

Photography Requirements:
- Studio quality lighting with soft shadows
- Clean, neutral background (white or light gray)
- Sharp focus on product with proper depth of field
- High resolution, commercial-grade quality
- Professional color grading and exposure
- Optimized for {platform} marketplace

Technical Specifications:
- Professional DSLR camera quality
- Proper white balance and color accuracy
- Minimal post-processing artifacts
- E-commerce ready presentation
"""
        
        # Add style-specific enhancements
        if style:
            style_enhancements = self._get_style_enhancement(style)
            base_template += f"\n{style_enhancements}"
        
        return base_template.strip()
    
    def _build_enhancement_prompt(
        self,
        prompt: str,
        platform: str,
        style: Optional[str]
    ) -> str:
        """Build image enhancement prompt"""
        
        enhancement_template = f"""Transform this product image into professional commercial photography: {prompt}

Enhancement Requirements:
- Improve lighting and exposure
- Clean up background (make it professional)
- Enhance product details and sharpness
- Optimize colors and white balance
- Add professional studio lighting effects
- Ensure {platform} marketplace standards

Maintain:
- Original product identity and features
- Natural product proportions
- Authentic product appearance
"""
        
        if style:
            style_enhancements = self._get_style_enhancement(style)
            enhancement_template += f"\n{style_enhancements}"
        
        return enhancement_template.strip()
    
    def _get_style_enhancement(self, style: str) -> str:
        """Get style-specific prompt enhancements"""
        
        style_templates = {
            'minimal': """
Style: Minimalist Product Photography
- Ultra-clean white background
- Minimal shadows
- Centered composition
- Modern, clean aesthetic
- Apple-style product presentation
""",
            'lifestyle': """
Style: Lifestyle Product Photography
- Natural environment setting
- Contextual props and styling
- Warm, inviting atmosphere
- Real-world usage scenario
- Authentic, relatable presentation
""",
            'luxury': """
Style: Luxury Product Photography
- Premium, high-end presentation
- Dramatic lighting with highlights
- Rich, deep colors
- Elegant composition
- Sophisticated, aspirational feel
""",
            'flat_lay': """
Style: Flat Lay Product Photography
- Top-down perspective
- Organized, aesthetic arrangement
- Complementary props and styling
- Instagram-worthy composition
- Clean, modern presentation
""",
            'studio': """
Style: Classic Studio Product Photography
- Professional three-point lighting
- Neutral gray or white background
- Technical precision
- Catalog-quality presentation
- Traditional commercial photography
""",
            'editorial': """
Style: Editorial Product Photography
- Creative, artistic composition
- Dynamic angles and perspectives
- Magazine-quality presentation
- Story-driven imagery
- High-fashion aesthetic
"""
        }
        
        return style_templates.get(style, "")
    
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
        """Get list of available photography styles"""
        return [
            {
                'id': 'minimal',
                'name': 'Minimal',
                'description': 'Clean, modern, Apple-style presentation'
            },
            {
                'id': 'lifestyle',
                'name': 'Lifestyle',
                'description': 'Natural setting with contextual props'
            },
            {
                'id': 'luxury',
                'name': 'Luxury',
                'description': 'Premium, high-end presentation'
            },
            {
                'id': 'flat_lay',
                'name': 'Flat Lay',
                'description': 'Top-down, Instagram-worthy composition'
            },
            {
                'id': 'studio',
                'name': 'Studio',
                'description': 'Classic professional studio photography'
            },
            {
                'id': 'editorial',
                'name': 'Editorial',
                'description': 'Creative, magazine-quality presentation'
            }
        ]
    
    def get_supported_platforms(self) -> List[Dict[str, str]]:
        """Get list of supported e-commerce platforms"""
        return [
            {
                'id': 'shopify',
                'name': 'Shopify',
                'size': '2048×2048',
                'aspect_ratio': '1:1'
            },
            {
                'id': 'amazon',
                'name': 'Amazon',
                'size': '2000×2000',
                'aspect_ratio': '1:1'
            },
            {
                'id': 'etsy',
                'name': 'Etsy',
                'size': '2000×2000',
                'aspect_ratio': '1:1'
            },
            {
                'id': 'instagram',
                'name': 'Instagram',
                'size': '1080×1080',
                'aspect_ratio': '1:1'
            },
            {
                'id': 'facebook',
                'name': 'Facebook',
                'size': '1200×1200',
                'aspect_ratio': '1:1'
            },
            {
                'id': 'pinterest',
                'name': 'Pinterest',
                'size': '1000×1500',
                'aspect_ratio': '2:3'
            }
        ]

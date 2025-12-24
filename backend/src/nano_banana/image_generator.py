"""
Gemini Nano Banana Image Generation Service
State-of-the-art AI image generation and editing
"""

import os
import base64
from typing import Optional, List, Dict, Any
from io import BytesIO
from PIL import Image
from google import genai
from google.genai import types


class NanoBananaImageGenerator:
    """Gemini 2.0 Flash Image Generation (Nano Banana)"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('GEMINI_NANO_BANANA_API_KEY')
        
        if not self.api_key:
            raise ValueError("❌ Gemini Nano Banana API key required!")
        
        try:
            self.client = genai.Client(api_key=self.api_key)
            # Use Gemini 2.5 Flash Image (Nano Banana) for image generation
            self.model_name = "gemini-2.5-flash-image"
            print("✅ Nano Banana (gemini-2.5-flash-image) initialized successfully!")
        except Exception as e:
            raise Exception(f"Failed to initialize Nano Banana: {e}")
    
    def generate_image(
        self,
        prompt: str,
        style: Optional[str] = None,
        aspect_ratio: str = "1:1",
        response_modality: List[str] = ['Image']
    ) -> Dict[str, Any]:
        """
        Generate image from text prompt
        
        Args:
            prompt: Text description of desired image
            style: Optional style preset (photorealistic, kawaii, minimalist, etc.)
            aspect_ratio: Image aspect ratio (1:1, 16:9, 9:16, 4:3, 3:4, etc.)
            response_modality: ['Image'] for image only, ['Text', 'Image'] for both
        
        Returns:
            Dict with image_data (base64), text_response, and metadata
        """
        try:
            # Apply style template if provided
            enhanced_prompt = self._apply_style_template(prompt, style)
            
            # Configure generation
            config = types.GenerateContentConfig(
                response_modalities=response_modality,
                image_config=types.ImageConfig(aspect_ratio=aspect_ratio)
            )
            
            # Generate
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[enhanced_prompt],
                config=config
            )
            
            # Extract results
            result = {
                'success': True,
                'image_data': None,
                'text_response': None,
                'prompt': enhanced_prompt,
                'style': style,
                'aspect_ratio': aspect_ratio
            }
            
            for part in response.candidates[0].content.parts:
                if part.text is not None:
                    result['text_response'] = part.text
                elif part.inline_data is not None:
                    # Convert to base64
                    result['image_data'] = base64.b64encode(part.inline_data.data).decode('utf-8')
                    result['mime_type'] = part.inline_data.mime_type
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'prompt': prompt
            }
    
    def edit_image(
        self,
        prompt: str,
        image_path: Optional[str] = None,
        image_data: Optional[bytes] = None,
        aspect_ratio: str = "1:1"
    ) -> Dict[str, Any]:
        """
        Edit existing image based on text prompt
        
        Following official Gemini documentation pattern:
        contents=[text_prompt, image] or contents=[image, text_prompt]
        
        Args:
            prompt: Description of desired edits
            image_path: Path to image file
            image_data: Raw image bytes
            aspect_ratio: Output aspect ratio
        
        Returns:
            Dict with edited image data and metadata
        """
        try:
            # Load image as PIL Image object
            if image_path:
                image_input = Image.open(image_path)
            elif image_data:
                image_input = Image.open(BytesIO(image_data))
            else:
                raise ValueError("Either image_path or image_data required")
            
            # Configure - return only images for editing
            config = types.GenerateContentConfig(
                response_modalities=['Image'],
                image_config=types.ImageConfig(aspect_ratio=aspect_ratio)
            )
            
            # CRITICAL: Pass contents as [text, image] array
            # This is the official Gemini 2.5 Flash Image editing pattern
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[prompt, image_input],  # Text first, then image
                config=config
            )
            
            # Extract result
            result = {
                'success': True,
                'image_data': None,
                'prompt': prompt,
                'aspect_ratio': aspect_ratio
            }
            
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None:
                    result['image_data'] = base64.b64encode(part.inline_data.data).decode('utf-8')
                    result['mime_type'] = part.inline_data.mime_type
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'prompt': prompt
            }
    
    def _apply_style_template(self, prompt: str, style: Optional[str]) -> str:
        """Apply style-specific prompt templates"""
        
        if not style or style == 'default':
            return prompt
        
        style_templates = {
            'photorealistic': f"A photorealistic, high-resolution photograph of {prompt}. Professional photography, sharp focus, natural lighting, ultra-detailed.",
            
            'kawaii': f"A kawaii-style, cute illustration of {prompt}. Bold outlines, pastel colors, simple cel-shading, adorable aesthetic.",
            
            'minimalist': f"A minimalist, clean design featuring {prompt}. Simple composition, negative space, modern aesthetic, limited color palette.",
            
            'vintage': f"A vintage-style image of {prompt}. Retro aesthetic, aged paper texture, muted colors, nostalgic feel.",
            
            'comic': f"A comic book style illustration of {prompt}. Bold lines, dynamic composition, vibrant colors, halftone shading.",
            
            'oil_painting': f"An oil painting of {prompt}. Rich textures, visible brushstrokes, classical art style, museum quality.",
            
            'watercolor': f"A watercolor painting of {prompt}. Soft edges, translucent colors, artistic paper texture, flowing style.",
            
            '3d_render': f"A 3D rendered image of {prompt}. Photorealistic CGI, perfect lighting, smooth surfaces, professional 3D modeling.",
            
            'anime': f"An anime-style illustration of {prompt}. Japanese animation aesthetic, expressive eyes, vibrant colors, clean linework.",
            
            'sketch': f"A pencil sketch of {prompt}. Hand-drawn aesthetic, graphite shading, artistic linework, sketch paper texture.",
            
            'neon': f"A neon-lit, cyberpunk style image of {prompt}. Glowing neon lights, dark background, futuristic aesthetic, vibrant colors.",
            
            'sticker': f"A sticker design of {prompt}. Bold outlines, flat colors, white background, die-cut ready, vibrant and eye-catching."
        }
        
        return style_templates.get(style, prompt)
    
    def get_available_styles(self) -> List[Dict[str, str]]:
        """Get list of available style presets"""
        return [
            {'id': 'default', 'name': 'Default', 'description': 'No style applied'},
            {'id': 'photorealistic', 'name': 'Photorealistic', 'description': 'Professional photography style'},
            {'id': 'kawaii', 'name': 'Kawaii', 'description': 'Cute Japanese style'},
            {'id': 'minimalist', 'name': 'Minimalist', 'description': 'Clean and simple'},
            {'id': 'vintage', 'name': 'Vintage', 'description': 'Retro aesthetic'},
            {'id': 'comic', 'name': 'Comic Book', 'description': 'Bold comic style'},
            {'id': 'oil_painting', 'name': 'Oil Painting', 'description': 'Classical art'},
            {'id': 'watercolor', 'name': 'Watercolor', 'description': 'Soft painting style'},
            {'id': '3d_render', 'name': '3D Render', 'description': 'CGI photorealism'},
            {'id': 'anime', 'name': 'Anime', 'description': 'Japanese animation'},
            {'id': 'sketch', 'name': 'Sketch', 'description': 'Hand-drawn pencil'},
            {'id': 'neon', 'name': 'Neon Cyberpunk', 'description': 'Futuristic neon'},
            {'id': 'sticker', 'name': 'Sticker', 'description': 'Bold sticker design'}
        ]
    
    def get_aspect_ratios(self) -> List[Dict[str, str]]:
        """Get available aspect ratios"""
        return [
            {'id': '1:1', 'name': 'Square', 'resolution': '1024x1024'},
            {'id': '16:9', 'name': 'Landscape', 'resolution': '1344x768'},
            {'id': '9:16', 'name': 'Portrait', 'resolution': '768x1344'},
            {'id': '4:3', 'name': 'Standard', 'resolution': '1184x864'},
            {'id': '3:4', 'name': 'Portrait Standard', 'resolution': '864x1184'},
            {'id': '21:9', 'name': 'Ultrawide', 'resolution': '1536x672'},
            {'id': '2:3', 'name': 'Photo Portrait', 'resolution': '832x1248'},
            {'id': '3:2', 'name': 'Photo Landscape', 'resolution': '1248x832'}
        ]

    def enhance_prompt_with_llm(
        self,
        prompt: str,
        system_prompt: str,
        user_message: str
    ) -> Optional[str]:
        """
        Enhance user prompt using Gemini LLM
        
        Args:
            prompt: Original user prompt
            system_prompt: System instructions for enhancement
            user_message: User message with context
        
        Returns:
            Enhanced prompt string or None if failed
        """
        try:
            # Use Gemini 2.0 Flash for text generation (fast and efficient)
            text_model = "gemini-2.0-flash-exp"
            
            # Combine system prompt and user message
            full_prompt = f"{system_prompt}\n\n{user_message}"
            
            # Generate enhanced prompt
            response = self.client.models.generate_content(
                model=text_model,
                contents=[full_prompt]
            )
            
            # Extract text response
            if response.candidates and len(response.candidates) > 0:
                enhanced = response.candidates[0].content.parts[0].text.strip()
                
                # Clean up the response (remove quotes, extra whitespace)
                enhanced = enhanced.strip('"').strip("'").strip()
                
                print(f"✨ Prompt enhanced: {prompt[:50]}... → {enhanced[:50]}...")
                return enhanced
            
            return None
            
        except Exception as e:
            print(f"❌ LLM enhancement failed: {e}")
            return None

"""
Vertex AI Image Generation Service
For use with Google Cloud Vertex AI (enterprise)
"""

import os
import base64
import requests
from typing import Optional, Dict, Any
from PIL import Image
from io import BytesIO


class VertexAIImageGenerator:
    """Vertex AI Image Generation using Imagen"""
    
    def __init__(self, api_key: Optional[str] = None, project_id: str = "lingolancers-451100"):
        self.api_key = api_key or os.getenv('GEMINI_NANO_BANANA_API_KEY')
        self.project_id = project_id
        self.base_url = "https://aiplatform.googleapis.com/v1"
        
        if not self.api_key:
            raise ValueError("❌ Vertex AI API key required!")
        
        print(f"✅ Vertex AI initialized for project: {project_id}")
    
    def generate_image(
        self,
        prompt: str,
        style: Optional[str] = None,
        aspect_ratio: str = "1:1",
        number_of_images: int = 1
    ) -> Dict[str, Any]:
        """
        Generate image using Vertex AI Imagen
        
        Args:
            prompt: Text description
            style: Optional style preset
            aspect_ratio: Image aspect ratio
            number_of_images: Number of images to generate (1-4)
        
        Returns:
            Dict with image_data and metadata
        """
        try:
            # Apply style template
            enhanced_prompt = self._apply_style_template(prompt, style)
            
            # Map aspect ratio to Imagen format
            aspect_ratio_map = {
                "1:1": "1:1",
                "16:9": "16:9",
                "9:16": "9:16",
                "4:3": "4:3",
                "3:4": "3:4"
            }
            
            imagen_aspect_ratio = aspect_ratio_map.get(aspect_ratio, "1:1")
            
            # Vertex AI Imagen endpoint
            endpoint = f"{self.base_url}/projects/{self.project_id}/locations/us-central1/publishers/google/models/imagegeneration@006:predict"
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "instances": [
                    {
                        "prompt": enhanced_prompt
                    }
                ],
                "parameters": {
                    "sampleCount": number_of_images,
                    "aspectRatio": imagen_aspect_ratio,
                    "safetyFilterLevel": "block_some",
                    "personGeneration": "allow_adult"
                }
            }
            
            response = requests.post(endpoint, headers=headers, json=payload, timeout=60)
            
            if response.status_code != 200:
                return {
                    'success': False,
                    'error': f"Vertex AI error: {response.text}",
                    'prompt': prompt
                }
            
            result_data = response.json()
            
            # Extract image data
            predictions = result_data.get('predictions', [])
            if not predictions:
                return {
                    'success': False,
                    'error': 'No images generated',
                    'prompt': prompt
                }
            
            # Get first image
            image_bytes = predictions[0].get('bytesBase64Encoded', '')
            
            return {
                'success': True,
                'image_data': image_bytes,
                'mime_type': 'image/png',
                'prompt': enhanced_prompt,
                'style': style,
                'aspect_ratio': aspect_ratio
            }
            
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
        Edit image using Vertex AI
        
        Note: Imagen editing requires different endpoint
        """
        try:
            # Load and encode image
            if image_path:
                with open(image_path, 'rb') as f:
                    img_bytes = f.read()
            elif image_data:
                img_bytes = image_data
            else:
                raise ValueError("Either image_path or image_data required")
            
            base64_image = base64.b64encode(img_bytes).decode('utf-8')
            
            # Vertex AI Image editing endpoint
            endpoint = f"{self.base_url}/projects/{self.project_id}/locations/us-central1/publishers/google/models/imagegeneration@006:predict"
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "instances": [
                    {
                        "prompt": prompt,
                        "image": {
                            "bytesBase64Encoded": base64_image
                        }
                    }
                ],
                "parameters": {
                    "sampleCount": 1,
                    "mode": "edit"
                }
            }
            
            response = requests.post(endpoint, headers=headers, json=payload, timeout=60)
            
            if response.status_code != 200:
                return {
                    'success': False,
                    'error': f"Vertex AI error: {response.text}",
                    'prompt': prompt
                }
            
            result_data = response.json()
            predictions = result_data.get('predictions', [])
            
            if not predictions:
                return {
                    'success': False,
                    'error': 'No edited image generated',
                    'prompt': prompt
                }
            
            image_bytes = predictions[0].get('bytesBase64Encoded', '')
            
            return {
                'success': True,
                'image_data': image_bytes,
                'mime_type': 'image/png',
                'prompt': prompt,
                'aspect_ratio': aspect_ratio
            }
            
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
    
    def get_available_styles(self):
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

"""
Complete Gemini 2.5 Flash Image (Nano Banana) Implementation
All capabilities: Generation, Editing, Inpainting, Style Transfer, Multi-Image, Conversational
"""

import os
import base64
from typing import Optional, List, Dict, Any
from io import BytesIO
from PIL import Image
from google import genai
from google.genai import types


class CompletNanoBananaGenerator:
    """
    Complete Nano Banana Implementation with ALL capabilities:
    
    1. Text-to-Image Generation
    2. Image Editing (Add/Remove Elements)
    3. Inpainting (Semantic Masking - edit specific parts only)
    4. Style Transfer (Transform artistic styles)
    5. Multi-Image Composition (Combine multiple images)
    6. Conversational Editing (Multi-turn refinement)
    """
    
    def __init__(self, api_key: Optional[str] = None):
        # Check if we should use Vertex AI or API key
        use_vertex_ai = os.getenv('GOOGLE_GENAI_USE_VERTEXAI', '').lower() == 'true'
        
        if use_vertex_ai:
            # Use Vertex AI authentication (same as Virtual Try-On)
            self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
            self.location = os.getenv('GOOGLE_CLOUD_LOCATION', 'global')
            
            if not self.project_id:
                raise ValueError("❌ GOOGLE_CLOUD_PROJECT environment variable required for Vertex AI!")
            
            # Set environment variable for Vertex AI
            os.environ['GOOGLE_GENAI_USE_VERTEXAI'] = 'True'
            
            try:
                self.client = genai.Client()
                self.model_name = "gemini-2.5-flash-image"
                print(f"✅ Complete Nano Banana initialized with Vertex AI (Project: {self.project_id})")
            except Exception as e:
                raise Exception(f"Failed to initialize Nano Banana with Vertex AI: {e}")
        else:
            # Use API key authentication (Google AI Studio)
            self.api_key = api_key or os.getenv('GEMINI_NANO_BANANA_API_KEY')
            
            if not self.api_key:
                raise ValueError("❌ Gemini Nano Banana API key required!")
            
            try:
                self.client = genai.Client(api_key=self.api_key)
                self.model_name = "gemini-2.5-flash-image"
                print("✅ Complete Nano Banana initialized with API key!")
            except Exception as e:
                raise Exception(f"Failed to initialize Nano Banana: {e}")
    
    # ========== 1. TEXT-TO-IMAGE GENERATION ==========
    def generate_image(
        self,
        prompt: str,
        style: Optional[str] = None,
        aspect_ratio: str = "1:1"
    ) -> Dict[str, Any]:
        """Generate image from text description"""
        try:
            enhanced_prompt = self._apply_style_template(prompt, style)
            
            config = types.GenerateContentConfig(
                response_modalities=['Image'],
                image_config=types.ImageConfig(aspect_ratio=aspect_ratio)
            )
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[enhanced_prompt],
                config=config
            )
            
            return self._extract_image_result(response, enhanced_prompt, aspect_ratio, 'generate')
            
        except Exception as e:
            return {'success': False, 'error': str(e), 'operation': 'generate'}
    
    # ========== 2. IMAGE EDITING ==========
    def edit_image(
        self,
        prompt: str,
        image_data: bytes,
        aspect_ratio: str = "1:1"
    ) -> Dict[str, Any]:
        """
        Edit image - Add, remove, or modify elements
        
        Example: "Add a wizard hat to the person" or "Remove the background"
        """
        try:
            image_input = Image.open(BytesIO(image_data))
            
            config = types.GenerateContentConfig(
                response_modalities=['Image'],
                image_config=types.ImageConfig(aspect_ratio=aspect_ratio)
            )
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[prompt, image_input],
                config=config
            )
            
            return self._extract_image_result(response, prompt, aspect_ratio, 'edit')
            
        except Exception as e:
            return {'success': False, 'error': str(e), 'operation': 'edit'}
    
    # ========== 3. INPAINTING (SEMANTIC MASKING) ==========
    def inpaint_image(
        self,
        prompt: str,
        image_data: bytes,
        aspect_ratio: str = "1:1"
    ) -> Dict[str, Any]:
        """
        Inpainting - Edit ONLY specific parts, preserve everything else
        
        Template: "Using the provided image, change only the [element] to [new]. 
        Keep everything else exactly the same."
        
        Example: "Using the provided image, change only the blue sofa to a brown 
        leather chesterfield. Keep everything else unchanged."
        """
        try:
            image_input = Image.open(BytesIO(image_data))
            
            # Enhanced prompt for precise inpainting
            inpaint_prompt = f"Using the provided image, {prompt}. Keep everything else in the image exactly the same, preserving the original style, lighting, and composition."
            
            config = types.GenerateContentConfig(
                response_modalities=['Image'],
                image_config=types.ImageConfig(aspect_ratio=aspect_ratio)
            )
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[image_input, inpaint_prompt],  # Image first for inpainting
                config=config
            )
            
            return self._extract_image_result(response, inpaint_prompt, aspect_ratio, 'inpaint')
            
        except Exception as e:
            return {'success': False, 'error': str(e), 'operation': 'inpaint'}
    
    # ========== 4. STYLE TRANSFER ==========
    def style_transfer(
        self,
        prompt: str,
        image_data: bytes,
        aspect_ratio: str = "1:1"
    ) -> Dict[str, Any]:
        """
        Style Transfer - Transform into different artistic styles
        
        Template: "Transform the provided image into the style of [artist/style]. 
        Preserve composition but apply new artistic style."
        
        Example: "Transform this photo into Van Gogh's Starry Night style with 
        swirling brushstrokes and vibrant blues and yellows."
        """
        try:
            image_input = Image.open(BytesIO(image_data))
            
            style_prompt = f"Transform the provided image {prompt}. Preserve the original composition but apply the new artistic style throughout."
            
            config = types.GenerateContentConfig(
                response_modalities=['Image'],
                image_config=types.ImageConfig(aspect_ratio=aspect_ratio)
            )
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[image_input, style_prompt],
                config=config
            )
            
            return self._extract_image_result(response, style_prompt, aspect_ratio, 'style_transfer')
            
        except Exception as e:
            return {'success': False, 'error': str(e), 'operation': 'style_transfer'}
    
    # ========== 5. MULTI-IMAGE COMPOSITION ==========
    def compose_images(
        self,
        prompt: str,
        images_data: List[bytes],
        aspect_ratio: str = "1:1"
    ) -> Dict[str, Any]:
        """
        Multi-Image Composition - Combine elements from multiple images
        
        Template: "Using the provided images, place [element from image 2] onto 
        [element from image 1]. Ensure natural integration."
        
        Example: "Take the woman from the first image and add the logo from the 
        second image onto her t-shirt. Make it look naturally printed."
        """
        try:
            if len(images_data) < 2:
                raise ValueError("At least 2 images required for composition")
            
            # Load all images
            image_inputs = [Image.open(BytesIO(img_data)) for img_data in images_data]
            
            composition_prompt = f"Using the provided images, {prompt}. Ensure natural integration and preserve important details."
            
            config = types.GenerateContentConfig(
                response_modalities=['Image'],
                image_config=types.ImageConfig(aspect_ratio=aspect_ratio)
            )
            
            # Contents: all images + prompt
            contents = image_inputs + [composition_prompt]
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config
            )
            
            result = self._extract_image_result(response, composition_prompt, aspect_ratio, 'compose')
            result['input_count'] = len(images_data)
            return result
            
        except Exception as e:
            return {'success': False, 'error': str(e), 'operation': 'compose'}
    
    # ========== 6. CONVERSATIONAL EDITING ==========
    def conversational_edit(
        self,
        prompt: str,
        current_image_data: bytes,
        conversation_history: List[str],
        aspect_ratio: str = "1:1"
    ) -> Dict[str, Any]:
        """
        Multi-turn Conversational Editing - Keep refining iteratively
        
        Example conversation:
        1. "Turn this car into a convertible"
        2. "Now make it yellow"
        3. "Add racing stripes"
        """
        try:
            current_image = Image.open(BytesIO(current_image_data))
            
            # Build context from conversation
            if conversation_history:
                recent = ' -> '.join(conversation_history[-3:])
                context_prompt = f"Previous edits: {recent}. Now: {prompt}"
            else:
                context_prompt = prompt
            
            config = types.GenerateContentConfig(
                response_modalities=['Image'],
                image_config=types.ImageConfig(aspect_ratio=aspect_ratio)
            )
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[current_image, context_prompt],
                config=config
            )
            
            result = self._extract_image_result(response, context_prompt, aspect_ratio, 'conversational')
            result['conversation_turn'] = len(conversation_history) + 1
            return result
            
        except Exception as e:
            return {'success': False, 'error': str(e), 'operation': 'conversational'}
    
    # ========== HELPER METHODS ==========
    def _extract_image_result(self, response, prompt, aspect_ratio, operation):
        """Extract image from API response"""
        result = {
            'success': True,
            'image_data': None,
            'prompt': prompt,
            'aspect_ratio': aspect_ratio,
            'operation': operation
        }
        
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                result['image_data'] = base64.b64encode(part.inline_data.data).decode('utf-8')
                result['mime_type'] = part.inline_data.mime_type
        
        return result
    
    def _apply_style_template(self, prompt: str, style: Optional[str]) -> str:
        """Apply style templates for generation"""
        if not style or style == 'default':
            return prompt
        
        templates = {
            'photorealistic': f"A photorealistic, high-resolution photograph of {prompt}. Professional photography, sharp focus, natural lighting.",
            'kawaii': f"A kawaii-style, cute illustration of {prompt}. Bold outlines, pastel colors, adorable aesthetic.",
            'minimalist': f"A minimalist, clean design of {prompt}. Simple composition, negative space, modern aesthetic.",
            'anime': f"An anime-style illustration of {prompt}. Japanese animation aesthetic, vibrant colors, expressive.",
            'comic': f"A comic book style illustration of {prompt}. Bold lines, dynamic composition, vibrant colors.",
            'oil_painting': f"An oil painting of {prompt}. Rich textures, visible brushstrokes, classical art style.",
            'watercolor': f"A watercolor painting of {prompt}. Soft edges, translucent colors, flowing style.",
            '3d_render': f"A 3D rendered image of {prompt}. Photorealistic CGI, perfect lighting, professional.",
            'sketch': f"A pencil sketch of {prompt}. Hand-drawn aesthetic, graphite shading, artistic linework.",
            'neon': f"A neon-lit, cyberpunk style image of {prompt}. Glowing neon lights, futuristic aesthetic.",
            'sticker': f"A sticker design of {prompt}. Bold outlines, flat colors, vibrant and eye-catching."
        }
        
        return templates.get(style, prompt)
    
    def get_capabilities(self) -> List[Dict[str, str]]:
        """Get all available capabilities"""
        return [
            {
                'id': 'generate',
                'name': 'Text-to-Image',
                'description': 'Generate images from text descriptions',
                'icon': 'sparkles'
            },
            {
                'id': 'edit',
                'name': 'Image Editing',
                'description': 'Add, remove, or modify elements',
                'icon': 'edit'
            },
            {
                'id': 'inpaint',
                'name': 'Inpainting',
                'description': 'Edit specific parts only, preserve rest',
                'icon': 'wand'
            },
            {
                'id': 'style_transfer',
                'name': 'Style Transfer',
                'description': 'Transform into different artistic styles',
                'icon': 'palette'
            },
            {
                'id': 'compose',
                'name': 'Multi-Image Composition',
                'description': 'Combine elements from multiple images',
                'icon': 'layers'
            },
            {
                'id': 'conversational',
                'name': 'Conversational Editing',
                'description': 'Multi-turn iterative refinement',
                'icon': 'message-circle'
            }
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

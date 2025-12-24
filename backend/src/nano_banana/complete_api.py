"""Complete Nano Banana API with ALL capabilities"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
import base64

from .complete_generator import CompletNanoBananaGenerator
from .models import NanoBananaDB

router = APIRouter(prefix="/api/nano-banana", tags=["Nano Banana"])

# Initialize
try:
    generator = CompletNanoBananaGenerator()
    db = NanoBananaDB()
    print("✅ Complete Nano Banana API ready with ALL capabilities")
except Exception as e:
    print(f"⚠️  Nano Banana initialization failed: {e}")
    generator = None
    db = None


# ========== REQUEST MODELS ==========
class GenerateRequest(BaseModel):
    prompt: str
    style: Optional[str] = None
    aspect_ratio: str = "1:1"
    user_id: str = "default_user"


class EditRequest(BaseModel):
    prompt: str
    image_data: str  # Base64
    aspect_ratio: str = "1:1"
    user_id: str = "default_user"


class InpaintRequest(BaseModel):
    prompt: str
    image_data: str
    aspect_ratio: str = "1:1"
    user_id: str = "default_user"


class StyleTransferRequest(BaseModel):
    prompt: str
    image_data: str
    aspect_ratio: str = "1:1"
    user_id: str = "default_user"


class ComposeRequest(BaseModel):
    prompt: str
    images_data: List[str]  # List of base64 images
    aspect_ratio: str = "1:1"
    user_id: str = "default_user"


class ConversationalRequest(BaseModel):
    prompt: str
    current_image_data: str
    conversation_history: List[str] = []
    aspect_ratio: str = "1:1"
    user_id: str = "default_user"


class ImageResponse(BaseModel):
    success: bool
    image_id: Optional[int] = None
    image_data: Optional[str] = None
    prompt: str
    aspect_ratio: str
    operation: str
    error: Optional[str] = None


class EnhancePromptRequest(BaseModel):
    prompt: str
    guidelines: Optional[dict] = None


class EnhancePromptResponse(BaseModel):
    success: bool
    enhanced_prompt: Optional[str] = None
    original_prompt: str
    error: Optional[str] = None


# ========== ENDPOINTS ==========

@router.post("/enhance-prompt", response_model=EnhancePromptResponse)
async def enhance_prompt(request: EnhancePromptRequest):
    """Enhance user prompt using LLM following Nano Banana guidelines"""
    
    if not generator:
        raise HTTPException(status_code=503, detail="Nano Banana service not available")
    
    try:
        # Get guidelines from request or use defaults
        style = request.guidelines.get('style', 'default') if request.guidelines else 'default'
        operation = request.guidelines.get('operation', 'generate') if request.guidelines else 'generate'
        
        # Build enhancement system prompt based on Nano Banana guidelines
        system_prompt = """You are an expert prompt engineer for Nano Banana image generation AI.

Your task is to enhance user prompts to generate better, more detailed images.

CRITICAL RULES:
1. **Be Specific & Varied**: Use diverse, contextual descriptors - NOT generic phrases
2. **Avoid Repetition**: NEVER use the same enhancement patterns repeatedly
3. **Context-Aware**: Tailor enhancements to the actual subject matter
4. **Natural Language**: Write like describing a real scene, not listing keywords
5. **Subject-First**: Start with the main subject, then add relevant details

BANNED PHRASES (DO NOT USE):
- "highly detailed, professional quality, vibrant colors, perfect composition, cinematic lighting"
- "professional quality"
- "perfect composition"
- "cinematic lighting"
- Generic quality terms without context

GOOD ENHANCEMENT EXAMPLES:
- "cat" → "a fluffy orange tabby cat with bright green eyes, sitting on a sunlit windowsill"
- "mountain" → "a snow-capped mountain peak at sunrise, with pink and gold light reflecting off glaciers"
- "coffee" → "a steaming cup of dark roast coffee in a ceramic mug, morning light streaming through the window"

ENHANCEMENT STRATEGY:
1. Identify the core subject
2. Add 2-3 specific visual details (colors, textures, materials)
3. Include environmental context or setting
4. Add lighting/atmosphere ONLY if it fits naturally
5. Keep it conversational and natural

Return ONLY the enhanced prompt as a single natural sentence."""

        user_message = f"""Original prompt: "{request.prompt}"

Style: {style}
Operation: {operation}

Enhance this prompt with specific, varied details that match the subject. Be creative and avoid generic phrases:"""

        # Call LLM to enhance prompt
        enhanced = generator.enhance_prompt_with_llm(
            prompt=request.prompt,
            system_prompt=system_prompt,
            user_message=user_message
        )
        
        if enhanced:
            return EnhancePromptResponse(
                success=True,
                enhanced_prompt=enhanced,
                original_prompt=request.prompt
            )
        else:
            # Minimal fallback - just return original
            return EnhancePromptResponse(
                success=True,
                enhanced_prompt=request.prompt,
                original_prompt=request.prompt
            )
        
    except Exception as e:
        print(f"❌ Prompt enhancement error: {e}")
        # Return original on error
        return EnhancePromptResponse(
            success=True,
            enhanced_prompt=request.prompt,
            original_prompt=request.prompt
        )


@router.post("/generate", response_model=ImageResponse)
async def generate_image(request: GenerateRequest):
    """Text-to-Image Generation"""
    if not generator:
        raise HTTPException(503, "Service unavailable")
    
    try:
        result = generator.generate_image(
            prompt=request.prompt,
            style=request.style,
            aspect_ratio=request.aspect_ratio
        )
        
        if not result['success']:
            return ImageResponse(
                success=False,
                prompt=request.prompt,
                aspect_ratio=request.aspect_ratio,
                operation='generate',
                error=result.get('error')
            )
        
        # Save to DB
        image_id = None
        if db and result['image_data']:
            image_id = db.save_image(
                prompt=result['prompt'],
                image_data=result['image_data'],
                user_id=request.user_id,
                style=request.style,
                aspect_ratio=request.aspect_ratio,
                mime_type=result.get('mime_type', 'image/png')
            )
        
        return ImageResponse(
            success=True,
            image_id=image_id,
            image_data=result['image_data'],
            prompt=result['prompt'],
            aspect_ratio=request.aspect_ratio,
            operation='generate'
        )
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/edit", response_model=ImageResponse)
async def edit_image(request: EditRequest):
    """Image Editing - Add/Remove/Modify elements"""
    if not generator:
        raise HTTPException(503, "Service unavailable")
    
    try:
        image_data = base64.b64decode(request.image_data)
        
        result = generator.edit_image(
            prompt=request.prompt,
            image_data=image_data,
            aspect_ratio=request.aspect_ratio
        )
        
        if not result['success']:
            return ImageResponse(
                success=False,
                prompt=request.prompt,
                aspect_ratio=request.aspect_ratio,
                operation='edit',
                error=result.get('error')
            )
        
        image_id = None
        if db and result['image_data']:
            image_id = db.save_image(
                prompt=result['prompt'],
                image_data=result['image_data'],
                user_id=request.user_id,
                aspect_ratio=request.aspect_ratio,
                mime_type=result.get('mime_type', 'image/png'),
                is_edited=True
            )
        
        return ImageResponse(
            success=True,
            image_id=image_id,
            image_data=result['image_data'],
            prompt=result['prompt'],
            aspect_ratio=request.aspect_ratio,
            operation='edit'
        )
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/inpaint", response_model=ImageResponse)
async def inpaint_image(request: InpaintRequest):
    """Inpainting - Edit specific parts only"""
    if not generator:
        raise HTTPException(503, "Service unavailable")
    
    try:
        image_data = base64.b64decode(request.image_data)
        
        result = generator.inpaint_image(
            prompt=request.prompt,
            image_data=image_data,
            aspect_ratio=request.aspect_ratio
        )
        
        if not result['success']:
            return ImageResponse(
                success=False,
                prompt=request.prompt,
                aspect_ratio=request.aspect_ratio,
                operation='inpaint',
                error=result.get('error')
            )
        
        image_id = None
        if db and result['image_data']:
            image_id = db.save_image(
                prompt=result['prompt'],
                image_data=result['image_data'],
                user_id=request.user_id,
                aspect_ratio=request.aspect_ratio,
                mime_type=result.get('mime_type', 'image/png'),
                is_edited=True
            )
        
        return ImageResponse(
            success=True,
            image_id=image_id,
            image_data=result['image_data'],
            prompt=result['prompt'],
            aspect_ratio=request.aspect_ratio,
            operation='inpaint'
        )
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/style-transfer", response_model=ImageResponse)
async def style_transfer(request: StyleTransferRequest):
    """Style Transfer - Transform artistic styles"""
    if not generator:
        raise HTTPException(503, "Service unavailable")
    
    try:
        image_data = base64.b64decode(request.image_data)
        
        result = generator.style_transfer(
            prompt=request.prompt,
            image_data=image_data,
            aspect_ratio=request.aspect_ratio
        )
        
        if not result['success']:
            return ImageResponse(
                success=False,
                prompt=request.prompt,
                aspect_ratio=request.aspect_ratio,
                operation='style_transfer',
                error=result.get('error')
            )
        
        image_id = None
        if db and result['image_data']:
            image_id = db.save_image(
                prompt=result['prompt'],
                image_data=result['image_data'],
                user_id=request.user_id,
                aspect_ratio=request.aspect_ratio,
                mime_type=result.get('mime_type', 'image/png'),
                is_edited=True
            )
        
        return ImageResponse(
            success=True,
            image_id=image_id,
            image_data=result['image_data'],
            prompt=result['prompt'],
            aspect_ratio=request.aspect_ratio,
            operation='style_transfer'
        )
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/compose", response_model=ImageResponse)
async def compose_images(request: ComposeRequest):
    """Multi-Image Composition"""
    if not generator:
        raise HTTPException(503, "Service unavailable")
    
    try:
        images_data = [base64.b64decode(img) for img in request.images_data]
        
        result = generator.compose_images(
            prompt=request.prompt,
            images_data=images_data,
            aspect_ratio=request.aspect_ratio
        )
        
        if not result['success']:
            return ImageResponse(
                success=False,
                prompt=request.prompt,
                aspect_ratio=request.aspect_ratio,
                operation='compose',
                error=result.get('error')
            )
        
        image_id = None
        if db and result['image_data']:
            image_id = db.save_image(
                prompt=result['prompt'],
                image_data=result['image_data'],
                user_id=request.user_id,
                aspect_ratio=request.aspect_ratio,
                mime_type=result.get('mime_type', 'image/png'),
                is_edited=True
            )
        
        return ImageResponse(
            success=True,
            image_id=image_id,
            image_data=result['image_data'],
            prompt=result['prompt'],
            aspect_ratio=request.aspect_ratio,
            operation='compose'
        )
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/conversational", response_model=ImageResponse)
async def conversational_edit(request: ConversationalRequest):
    """Conversational Multi-turn Editing"""
    if not generator:
        raise HTTPException(503, "Service unavailable")
    
    try:
        current_image_data = base64.b64decode(request.current_image_data)
        
        result = generator.conversational_edit(
            prompt=request.prompt,
            current_image_data=current_image_data,
            conversation_history=request.conversation_history,
            aspect_ratio=request.aspect_ratio
        )
        
        if not result['success']:
            return ImageResponse(
                success=False,
                prompt=request.prompt,
                aspect_ratio=request.aspect_ratio,
                operation='conversational',
                error=result.get('error')
            )
        
        image_id = None
        if db and result['image_data']:
            image_id = db.save_image(
                prompt=result['prompt'],
                image_data=result['image_data'],
                user_id=request.user_id,
                aspect_ratio=request.aspect_ratio,
                mime_type=result.get('mime_type', 'image/png'),
                is_edited=True
            )
        
        return ImageResponse(
            success=True,
            image_id=image_id,
            image_data=result['image_data'],
            prompt=result['prompt'],
            aspect_ratio=request.aspect_ratio,
            operation='conversational'
        )
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/capabilities")
async def get_capabilities():
    """Get all Nano Banana capabilities"""
    if not generator:
        raise HTTPException(503, "Service unavailable")
    
    return {
        "success": True,
        "capabilities": generator.get_capabilities(),
        "model": "gemini-2.5-flash-image"
    }


@router.get("/history")
async def get_history(user_id: str = "default_user", limit: int = 50):
    """Get generation history"""
    if not db:
        raise HTTPException(503, "Database unavailable")
    
    try:
        images = db.get_user_images(user_id, limit, 0)
        return {"success": True, "images": images}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/health")
async def health_check():
    """Health check"""
    return {
        "success": True,
        "generator_available": generator is not None,
        "database_available": db is not None,
        "model": "gemini-2.5-flash-image",
        "capabilities_count": 6
    }

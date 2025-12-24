"""FastAPI routes for Nano Banana Image Generation"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
import base64

from .image_generator import NanoBananaImageGenerator
from .models import NanoBananaDB

router = APIRouter(prefix="/api/nano-banana", tags=["Nano Banana"])

# Initialize services
try:
    generator = NanoBananaImageGenerator()
    db = NanoBananaDB()
    print("✅ Nano Banana API initialized")
except Exception as e:
    print(f"⚠️  Nano Banana API initialization failed: {e}")
    generator = None
    db = None


# Request/Response Models
class GenerateImageRequest(BaseModel):
    prompt: str
    style: Optional[str] = None
    aspect_ratio: str = "1:1"
    user_id: str = "default_user"
    save_to_history: bool = True


class EditImageRequest(BaseModel):
    prompt: str
    image_id: Optional[int] = None
    image_data: Optional[str] = None  # Base64
    aspect_ratio: str = "1:1"
    user_id: str = "default_user"
    save_to_history: bool = True


class ImageResponse(BaseModel):
    success: bool
    image_id: Optional[int] = None
    image_data: Optional[str] = None
    text_response: Optional[str] = None
    prompt: str
    style: Optional[str] = None
    aspect_ratio: str
    error: Optional[str] = None


# Routes
@router.post("/generate", response_model=ImageResponse)
async def generate_image(request: GenerateImageRequest):
    """Generate image from text prompt"""
    
    if not generator:
        raise HTTPException(status_code=503, detail="Nano Banana service not available")
    
    try:
        # Generate image
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
                error=result.get('error', 'Generation failed')
            )
        
        # Save to database if requested
        image_id = None
        if request.save_to_history and db and result['image_data']:
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
            text_response=result.get('text_response'),
            prompt=result['prompt'],
            style=request.style,
            aspect_ratio=request.aspect_ratio
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class EnhancePromptRequest(BaseModel):
    prompt: str
    guidelines: Optional[dict] = None


class EnhancePromptResponse(BaseModel):
    success: bool
    enhanced_prompt: Optional[str] = None
    original_prompt: str
    error: Optional[str] = None


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


@router.post("/edit", response_model=ImageResponse)
async def edit_image(request: EditImageRequest):
    """Edit existing image"""
    
    if not generator:
        raise HTTPException(status_code=503, detail="Nano Banana service not available")
    
    try:
        # Get image data
        image_data = None
        parent_image_id = None
        
        if request.image_id and db:
            # Load from database
            image_record = db.get_image_by_id(request.image_id)
            if not image_record:
                raise HTTPException(status_code=404, detail="Image not found")
            image_data = base64.b64decode(image_record['image_data'])
            parent_image_id = request.image_id
        elif request.image_data:
            # Use provided base64 data
            image_data = base64.b64decode(request.image_data)
        else:
            raise HTTPException(status_code=400, detail="Either image_id or image_data required")
        
        # Edit image
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
                error=result.get('error', 'Edit failed')
            )
        
        # Save to database
        image_id = None
        if request.save_to_history and db and result['image_data']:
            image_id = db.save_image(
                prompt=result['prompt'],
                image_data=result['image_data'],
                user_id=request.user_id,
                aspect_ratio=request.aspect_ratio,
                mime_type=result.get('mime_type', 'image/png'),
                is_edited=True,
                parent_image_id=parent_image_id
            )
        
        return ImageResponse(
            success=True,
            image_id=image_id,
            image_data=result['image_data'],
            prompt=result['prompt'],
            aspect_ratio=request.aspect_ratio
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_history(user_id: str = "default_user", limit: int = 50, offset: int = 0):
    """Get user's image generation history"""
    
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        images = db.get_user_images(user_id, limit, offset)
        return {"success": True, "images": images, "count": len(images)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/image/{image_id}")
async def get_image(image_id: int):
    """Get specific image by ID"""
    
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        image = db.get_image_by_id(image_id)
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        return {"success": True, "image": image}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/image/{image_id}")
async def delete_image(image_id: int, user_id: str = "default_user"):
    """Delete image"""
    
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        deleted = db.delete_image(image_id, user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Image not found or not owned by user")
        return {"success": True, "message": "Image deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/image/{image_id}/download")
async def download_image(image_id: int):
    """Increment download counter"""
    
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        db.increment_download_count(image_id)
        return {"success": True, "message": "Download counted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/styles")
async def get_styles():
    """Get available style presets"""
    
    if not generator:
        raise HTTPException(status_code=503, detail="Nano Banana service not available")
    
    try:
        styles = generator.get_available_styles()
        return {"success": True, "styles": styles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/aspect-ratios")
async def get_aspect_ratios():
    """Get available aspect ratios"""
    
    if not generator:
        raise HTTPException(status_code=503, detail="Nano Banana service not available")
    
    try:
        ratios = generator.get_aspect_ratios()
        return {"success": True, "aspect_ratios": ratios}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Check if Nano Banana service is healthy"""
    return {
        "success": True,
        "generator_available": generator is not None,
        "database_available": db is not None,
        "model": "gemini-2.0-flash-exp"
    }

"""
AI Image Suite API Endpoints
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional
import base64
from io import BytesIO
from PIL import Image
import json
from datetime import datetime

from .models import ProcessedImage, AnalyzedImage, CombinedImage, ProductShotResult, AnalysisResult
from .processor import (
    remove_background,
    analyze_image,
    combine_images,
    generate_product_shot
)
from .database import (
    save_processed_image,
    get_processed_history,
    save_analyzed_image,
    get_analysis_history,
    save_combined_image,
    get_combination_history,
    save_product_shot,
    get_product_shot_history
)

router = APIRouter(prefix="/api/ai-image", tags=["ai-image"])


# ============================================================================
# REMOVE BACKGROUND ENDPOINTS
# ============================================================================

@router.post("/remove-background")
async def remove_background_endpoint(
    image: UploadFile = File(...),
    user_id: str = Form(...),
    prompt: str = Form("Remove the background completely and make it transparent white")
):
    """Remove background or edit image based on prompt"""
    try:
        # Read and process image
        image_data = await image.read()
        img = Image.open(BytesIO(image_data))
        
        # Process with prompt
        processed_img = remove_background(img, prompt)
        
        # Convert to base64
        buffered = BytesIO()
        processed_img.save(buffered, format="PNG")
        processed_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # Save original as base64
        original_buffered = BytesIO()
        img.save(original_buffered, format="PNG")
        original_base64 = base64.b64encode(original_buffered.getvalue()).decode()
        
        # Save to database
        result = save_processed_image(
            user_id=user_id,
            original_data=original_base64,
            processed_data=processed_base64,
            filename=image.filename or "image.png"
        )
        
        return JSONResponse({
            "success": True,
            "processed_image": processed_base64,
            "id": result["id"]
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/remove-background/history")
async def get_remove_background_history(
    user_id: str,
    limit: int = 50
):
    """Get processing history for a user"""
    try:
        history = get_processed_history(user_id, limit)
        # Ensure JSON serializable
        serializable_history = []
        for item in history:
            serializable_item = {
                "id": item.get("id"),
                "user_id": item.get("user_id"),
                "original_data": item.get("original_data"),
                "processed_data": item.get("processed_data"),
                "filename": item.get("filename"),
                "created_at": str(item.get("created_at")) if item.get("created_at") else None
            }
            serializable_history.append(serializable_item)
        
        return JSONResponse({
            "success": True,
            "images": serializable_history
        })
    except Exception as e:
        print(f"❌ History error: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e),
            "images": []
        }, status_code=500)


@router.delete("/remove-background/{image_id}")
async def delete_processed_image(image_id: int):
    """Delete a processed image from history"""
    try:
        from .database import delete_processed_image
        success = delete_processed_image(image_id)
        if success:
            return JSONResponse({
                "success": True,
                "message": "Image deleted successfully"
            })
        else:
            raise HTTPException(status_code=404, detail="Image not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# VISION (IMAGE ANALYSIS) ENDPOINTS
# ============================================================================

@router.post("/vision/analyze")
async def analyze_image_endpoint(
    image: UploadFile = File(...),
    user_id: str = Form(...)
):
    """Analyze an image and extract insights"""
    try:
        # Read and process image
        image_data = await image.read()
        img = Image.open(BytesIO(image_data))
        
        # Analyze image
        analysis = analyze_image(img)
        
        # Convert image to base64
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        image_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # Save to database
        result = save_analyzed_image(
            user_id=user_id,
            image_data=image_base64,
            analysis=analysis,
            filename=image.filename or "image.png"
        )
        
        return JSONResponse({
            "success": True,
            "analysis": analysis,
            "id": result["id"]
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/vision/history")
async def get_vision_history(
    user_id: str,
    limit: int = 50
):
    """Get analysis history for a user"""
    try:
        history = get_analysis_history(user_id, limit)
        # Ensure JSON serializable
        serializable_history = []
        for item in history:
            serializable_item = {
                "id": item.get("id"),
                "user_id": item.get("user_id"),
                "image_data": item.get("image_data"),
                "analysis": item.get("analysis"),
                "filename": item.get("filename"),
                "created_at": str(item.get("created_at")) if item.get("created_at") else None
            }
            serializable_history.append(serializable_item)
        
        return JSONResponse({
            "success": True,
            "analyses": serializable_history
        })
    except Exception as e:
        print(f"❌ History error: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e),
            "analyses": []
        }, status_code=500)


# ============================================================================
# COMBINE IMAGES ENDPOINTS
# ============================================================================

@router.post("/combine")
async def combine_images_endpoint(
    instructions: str = Form(...),
    user_id: str = Form(...),
    num_images: int = Form(...)
):
    """Combine multiple images based on instructions"""
    try:
        from fastapi import Request
        from starlette.datastructures import FormData
        
        # This will be called with FormData containing multiple images
        # For now, return a mock response
        # In production, you'd extract images from the form data
        
        # Mock combined image
        combined_img = Image.new('RGB', (800, 600), color='lightblue')
        
        # Convert to base64
        buffered = BytesIO()
        combined_img.save(buffered, format="PNG")
        combined_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # Save to database
        result = save_combined_image(
            user_id=user_id,
            result_data=combined_base64,
            source_images=[],  # Would contain source image base64 strings
            instructions=instructions
        )
        
        return JSONResponse({
            "success": True,
            "combined_image": combined_base64,
            "id": result["id"]
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/combine/history")
async def get_combine_history(
    user_id: str,
    limit: int = 50
):
    """Get combination history for a user"""
    try:
        history = get_combination_history(user_id, limit)
        # Ensure JSON serializable
        serializable_history = []
        for item in history:
            serializable_item = {
                "id": item.get("id"),
                "user_id": item.get("user_id"),
                "result_data": item.get("result_data"),
                "source_images": item.get("source_images"),
                "instructions": item.get("instructions"),
                "created_at": str(item.get("created_at")) if item.get("created_at") else None
            }
            serializable_history.append(serializable_item)
        
        return JSONResponse({
            "success": True,
            "combinations": serializable_history
        })
    except Exception as e:
        print(f"❌ History error: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e),
            "combinations": []
        }, status_code=500)


# ============================================================================
# PRODUCT SHOT ENDPOINTS
# ============================================================================

@router.post("/product-shot")
async def generate_product_shot_endpoint(
    prompt: str = Form(...),
    platform: str = Form(...),
    user_id: str = Form(...),
    style: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """Generate a professional product shot using Gemini Imagen API"""
    try:
        print(f"\n🎨 Product Shot Request:")
        print(f"   Prompt: {prompt}")
        print(f"   Platform: {platform}")
        print(f"   Style: {style or 'default'}")
        print(f"   Mode: {'image-to-image' if image else 'text-to-image'}")
        
        # Import the real generator
        from .product_shot_generator import ProductShotGenerator
        
        # Initialize generator
        generator = ProductShotGenerator()
        
        source_base64 = None
        
        if image:
            # Image-to-image mode
            image_data = await image.read()
            
            # Save source image
            buffered = BytesIO()
            source_img = Image.open(BytesIO(image_data))
            source_img.save(buffered, format="PNG")
            source_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            # Generate enhanced product shot
            result = generator.generate_from_image(
                prompt=prompt,
                image_data=image_data,
                platform=platform,
                style=style
            )
        else:
            # Text-to-image mode
            result = generator.generate_from_text(
                prompt=prompt,
                platform=platform,
                style=style
            )
        
        if not result['success']:
            raise Exception(result.get('error', 'Generation failed'))
        
        result_base64 = result['image_data']
        
        # Save to database
        db_result = save_product_shot(
            user_id=user_id,
            result_data=result_base64,
            source_image=source_base64,
            prompt=prompt,
            platform=platform
        )
        
        print(f"✅ Product shot generated successfully (ID: {db_result['id']})")
        
        return JSONResponse({
            "success": True,
            "result_image": result_base64,
            "id": db_result["id"],
            "mode": result.get('mode'),
            "style": style,
            "platform": platform
        })
        
    except Exception as e:
        print(f"❌ Product shot error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/product-shot/history")
async def get_product_shot_history_endpoint(
    user_id: str,
    limit: int = 50
):
    """Get product shot history for a user"""
    try:
        print(f"\n📜 Loading product shot history for user: {user_id}")
        history = get_product_shot_history(user_id, limit)
        print(f"   Found {len(history)} shots")
        
        # Ensure all data is JSON serializable
        serializable_history = []
        for shot in history:
            serializable_shot = {
                "id": shot.get("id"),
                "user_id": shot.get("user_id"),
                "result_data": shot.get("result_data"),
                "source_image": shot.get("source_image"),
                "prompt": shot.get("prompt"),
                "platform": shot.get("platform"),
                "created_at": str(shot.get("created_at")) if shot.get("created_at") else None
            }
            serializable_history.append(serializable_shot)
        
        print(f"✅ History loaded successfully")
        return JSONResponse({
            "success": True,
            "shots": serializable_history
        })
    except Exception as e:
        print(f"❌ History error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({
            "success": False,
            "error": str(e),
            "shots": []
        }, status_code=500)


@router.get("/product-shot/styles")
async def get_product_shot_styles():
    """Get available photography styles"""
    try:
        from .product_shot_generator import ProductShotGenerator
        generator = ProductShotGenerator()
        styles = generator.get_available_styles()
        
        return JSONResponse({
            "success": True,
            "styles": styles
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "styles": []
        }, status_code=500)


@router.get("/product-shot/platforms")
async def get_product_shot_platforms():
    """Get supported e-commerce platforms"""
    try:
        from .product_shot_generator import ProductShotGenerator
        generator = ProductShotGenerator()
        platforms = generator.get_supported_platforms()
        
        return JSONResponse({
            "success": True,
            "platforms": platforms
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "platforms": []
        }, status_code=500)



# ============================================================================
# LOGO GENERATION ENDPOINTS
# ============================================================================

@router.post("/logo-generation")
async def generate_logo_endpoint(
    prompt: str = Form(...),
    style: str = Form(...),
    user_id: str = Form(...)
):
    """Generate a professional logo using Gemini Imagen API"""
    try:
        print(f"\n🎨 Logo Generation Request:")
        print(f"   Prompt: {prompt}")
        print(f"   Style: {style}")
        print(f"   User: {user_id}")
        
        # Import the logo generator
        from .logo_generator import LogoGenerator
        
        # Initialize generator
        generator = LogoGenerator()
        
        # Generate logo
        result = generator.generate_logo(
            prompt=prompt,
            style=style
        )
        
        if not result['success']:
            raise Exception(result.get('error', 'Logo generation failed'))
        
        image_data = result['image_data']
        
        # Save to database
        from .database import save_logo
        db_result = save_logo(
            user_id=user_id,
            image_data=image_data,
            prompt=prompt,
            style=style
        )
        
        print(f"✅ Logo generated successfully (ID: {db_result['id']})")
        
        return JSONResponse({
            "success": True,
            "image_data": image_data,
            "id": db_result["id"],
            "style": style,
            "prompt": prompt
        })
        
    except Exception as e:
        print(f"❌ Logo generation error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/logo-generation/history")
async def get_logo_history_endpoint(
    user_id: str,
    limit: int = 50
):
    """Get logo generation history for a user"""
    try:
        print(f"\n📜 Loading logo history for user: {user_id}")
        from .database import get_logo_history
        history = get_logo_history(user_id, limit)
        print(f"   Found {len(history)} logos")
        
        # Ensure all data is JSON serializable
        serializable_history = []
        for logo in history:
            serializable_logo = {
                "id": logo.get("id"),
                "user_id": logo.get("user_id"),
                "image_data": logo.get("image_data"),
                "prompt": logo.get("prompt"),
                "style": logo.get("style"),
                "created_at": str(logo.get("created_at")) if logo.get("created_at") else None
            }
            serializable_history.append(serializable_logo)
        
        print(f"✅ Logo history loaded successfully")
        return JSONResponse({
            "success": True,
            "logos": serializable_history
        })
    except Exception as e:
        print(f"❌ Logo history error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({
            "success": False,
            "error": str(e),
            "logos": []
        }, status_code=500)


@router.delete("/logo-generation/image/{logo_id}")
async def delete_logo_endpoint(logo_id: int):
    """Delete a logo from history"""
    try:
        from .database import delete_logo
        success = delete_logo(logo_id)
        if success:
            return JSONResponse({
                "success": True,
                "message": "Logo deleted successfully"
            })
        else:
            raise HTTPException(status_code=404, detail="Logo not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/logo-generation/styles")
async def get_logo_styles():
    """Get available logo styles"""
    try:
        from .logo_generator import LogoGenerator
        generator = LogoGenerator()
        styles = generator.get_available_styles()
        
        return JSONResponse({
            "success": True,
            "styles": styles
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "styles": []
        }, status_code=500)

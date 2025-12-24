"""FastAPI routes for Virtual Try-On"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
import base64

from .tryon_generator import VirtualTryOnGenerator
from .models import VirtualTryOnDB

router = APIRouter(prefix="/api/virtual-tryon", tags=["Virtual Try-On"])

# Initialize services
try:
    generator = VirtualTryOnGenerator()
    db = VirtualTryOnDB()
    print("✅ Virtual Try-On API initialized")
except Exception as e:
    print(f"⚠️  Virtual Try-On API initialization failed: {e}")
    generator = None
    db = None


# Request/Response Models
class TryOnRequest(BaseModel):
    person_image: str  # Base64
    garment_image: str  # Base64
    garment_type: Optional[str] = None
    user_id: str = "default_user"
    save_to_history: bool = True


class MultiGarmentTryOnRequest(BaseModel):
    person_image: str  # Base64
    garment_images: List[str]  # List of base64 images
    user_id: str = "default_user"
    save_to_history: bool = True


class TryOnResponse(BaseModel):
    success: bool
    result_id: Optional[int] = None
    result_image: Optional[str] = None
    garment_type: Optional[str] = None
    garment_count: int = 1
    size_bytes: Optional[int] = None
    error: Optional[str] = None


# Routes
@router.post("/try-on", response_model=TryOnResponse)
async def try_on_garment(request: TryOnRequest):
    """Virtual try-on with single garment"""
    
    if not generator:
        raise HTTPException(status_code=503, detail="Virtual Try-On service not available")
    
    try:
        # Decode base64 images
        person_image_data = base64.b64decode(request.person_image)
        garment_image_data = base64.b64decode(request.garment_image)
        
        # Generate try-on result
        result = generator.try_on_garment(
            person_image_data=person_image_data,
            garment_image_data=garment_image_data,
            garment_type=request.garment_type
        )
        
        if not result['success']:
            error_msg = result.get('error', 'Try-on failed')
            # Make credentials error more user-friendly
            if 'credentials' in error_msg.lower() or 'authentication' in error_msg.lower():
                error_msg = "Google Cloud credentials not configured. Please see AI_IMAGE_SERVICES_SETUP.md for setup instructions."
            return TryOnResponse(
                success=False,
                error=error_msg
            )
        
        # Save to database if requested
        result_id = None
        if request.save_to_history and db and result['image_data']:
            result_id = db.save_result(
                user_id=request.user_id,
                result_image_data=result['image_data'],
                person_image_data=request.person_image,
                garment_image_data=request.garment_image,
                garment_type=request.garment_type,
                mime_type=result.get('mime_type', 'image/png'),
                size_bytes=result.get('size_bytes')
            )
        
        return TryOnResponse(
            success=True,
            result_id=result_id,
            result_image=result['image_data'],
            garment_type=request.garment_type,
            garment_count=1,
            size_bytes=result.get('size_bytes')
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/try-on-multiple", response_model=TryOnResponse)
async def try_on_multiple_garments(request: MultiGarmentTryOnRequest):
    """Virtual try-on with multiple garments"""
    
    if not generator:
        raise HTTPException(status_code=503, detail="Virtual Try-On service not available")
    
    try:
        # Decode base64 images
        person_image_data = base64.b64decode(request.person_image)
        garment_images_data = [base64.b64decode(img) for img in request.garment_images]
        
        # Generate try-on result
        result = generator.try_on_multiple_garments(
            person_image_data=person_image_data,
            garment_images_data=garment_images_data
        )
        
        if not result['success']:
            return TryOnResponse(
                success=False,
                error=result.get('error', 'Try-on failed')
            )
        
        # Save to database if requested
        result_id = None
        if request.save_to_history and db and result['image_data']:
            result_id = db.save_result(
                user_id=request.user_id,
                result_image_data=result['image_data'],
                person_image_data=request.person_image,
                garment_count=len(request.garment_images),
                mime_type=result.get('mime_type', 'image/png'),
                size_bytes=result.get('size_bytes')
            )
        
        return TryOnResponse(
            success=True,
            result_id=result_id,
            result_image=result['image_data'],
            garment_count=len(request.garment_images),
            size_bytes=result.get('size_bytes')
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_history(user_id: str = "default_user", limit: int = 50, offset: int = 0):
    """Get user's try-on history"""
    
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        results = db.get_user_results(user_id, limit, offset)
        return {"success": True, "results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/result/{result_id}")
async def get_result(result_id: int):
    """Get specific result by ID"""
    
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        result = db.get_result_by_id(result_id)
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")
        return {"success": True, "result": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/result/{result_id}")
async def delete_result(result_id: int, user_id: str = "default_user"):
    """Delete a result"""
    
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        deleted = db.delete_result(result_id, user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Result not found or not owned by user")
        return {"success": True, "message": "Result deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/result/{result_id}/favorite")
async def toggle_favorite(result_id: int, user_id: str = "default_user"):
    """Toggle favorite status"""
    
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        updated = db.toggle_favorite(result_id, user_id)
        if not updated:
            raise HTTPException(status_code=404, detail="Result not found or not owned by user")
        return {"success": True, "message": "Favorite status toggled"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/result/{result_id}/download")
async def download_result(result_id: int):
    """Increment download counter"""
    
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        db.increment_download_count(result_id)
        return {"success": True, "message": "Download counted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/garment-types")
async def get_garment_types():
    """Get supported garment types"""
    
    if not generator:
        raise HTTPException(status_code=503, detail="Virtual Try-On service not available")
    
    try:
        types = generator.get_supported_garment_types()
        return {"success": True, "garment_types": types}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tips")
async def get_tips():
    """Get tips for best results"""
    
    if not generator:
        raise HTTPException(status_code=503, detail="Virtual Try-On service not available")
    
    try:
        tips = generator.get_model_tips()
        return {"success": True, "tips": tips}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check"""
    return {
        "success": True,
        "generator_available": generator is not None,
        "database_available": db is not None,
        "model": "virtual-try-on-preview-08-04"
    }

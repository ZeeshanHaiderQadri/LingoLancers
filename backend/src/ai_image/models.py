"""
Data models for AI Image Suite
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# Remove Background Models
class ProcessedImage(BaseModel):
    id: int
    user_id: str
    original_data: str
    processed_data: str
    filename: str
    created_at: datetime


# Vision Models
class AnalysisResult(BaseModel):
    objects: List[str]
    scene: str
    colors: List[str]
    tags: List[str]
    estimatedValue: Optional[str] = None


class AnalyzedImage(BaseModel):
    id: int
    user_id: str
    image_data: str
    analysis: AnalysisResult
    filename: str
    created_at: datetime


# Combine Images Models
class CombinedImage(BaseModel):
    id: int
    user_id: str
    result_data: str
    source_images: List[str]
    instructions: str
    created_at: datetime


# Product Shot Models
class ProductShotResult(BaseModel):
    id: int
    user_id: str
    result_data: str
    source_image: Optional[str] = None
    prompt: str
    platform: str
    created_at: datetime

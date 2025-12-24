"""
Database operations for AI Image Suite
Using in-memory storage for simplicity
In production, use SQLite, PostgreSQL, or similar
"""

from typing import List, Dict, Optional
from datetime import datetime
import json

# In-memory storage
processed_images_db: List[Dict] = []
analyzed_images_db: List[Dict] = []
combined_images_db: List[Dict] = []
product_shots_db: List[Dict] = []

# ID counters
processed_id_counter = 1
analyzed_id_counter = 1
combined_id_counter = 1
product_shot_id_counter = 1


# ============================================================================
# REMOVE BACKGROUND DATABASE OPERATIONS
# ============================================================================

def save_processed_image(
    user_id: str,
    original_data: str,
    processed_data: str,
    filename: str
) -> Dict:
    """Save a processed image to database"""
    global processed_id_counter
    
    record = {
        "id": processed_id_counter,
        "user_id": user_id,
        "original_data": original_data,
        "processed_data": processed_data,
        "filename": filename,
        "created_at": datetime.now().isoformat()
    }
    
    processed_images_db.append(record)
    processed_id_counter += 1
    
    return record


def get_processed_history(user_id: str, limit: int = 50) -> List[Dict]:
    """Get processing history for a user"""
    user_images = [
        img for img in processed_images_db
        if img["user_id"] == user_id
    ]
    
    # Sort by created_at descending
    user_images.sort(key=lambda x: x["created_at"], reverse=True)
    
    return user_images[:limit]


def delete_processed_image(image_id: int) -> bool:
    """Delete a processed image from database"""
    global processed_images_db
    
    for i, img in enumerate(processed_images_db):
        if img["id"] == image_id:
            processed_images_db.pop(i)
            return True
    
    return False


# ============================================================================
# VISION DATABASE OPERATIONS
# ============================================================================

def save_analyzed_image(
    user_id: str,
    image_data: str,
    analysis: Dict,
    filename: str
) -> Dict:
    """Save an analyzed image to database"""
    global analyzed_id_counter
    
    record = {
        "id": analyzed_id_counter,
        "user_id": user_id,
        "image_data": image_data,
        "analysis": analysis,
        "filename": filename,
        "created_at": datetime.now().isoformat()
    }
    
    analyzed_images_db.append(record)
    analyzed_id_counter += 1
    
    return record


def get_analysis_history(user_id: str, limit: int = 50) -> List[Dict]:
    """Get analysis history for a user"""
    user_analyses = [
        img for img in analyzed_images_db
        if img["user_id"] == user_id
    ]
    
    # Sort by created_at descending
    user_analyses.sort(key=lambda x: x["created_at"], reverse=True)
    
    return user_analyses[:limit]


# ============================================================================
# COMBINE IMAGES DATABASE OPERATIONS
# ============================================================================

def save_combined_image(
    user_id: str,
    result_data: str,
    source_images: List[str],
    instructions: str
) -> Dict:
    """Save a combined image to database"""
    global combined_id_counter
    
    record = {
        "id": combined_id_counter,
        "user_id": user_id,
        "result_data": result_data,
        "source_images": source_images,
        "instructions": instructions,
        "created_at": datetime.now().isoformat()
    }
    
    combined_images_db.append(record)
    combined_id_counter += 1
    
    return record


def get_combination_history(user_id: str, limit: int = 50) -> List[Dict]:
    """Get combination history for a user"""
    user_combinations = [
        img for img in combined_images_db
        if img["user_id"] == user_id
    ]
    
    # Sort by created_at descending
    user_combinations.sort(key=lambda x: x["created_at"], reverse=True)
    
    return user_combinations[:limit]


# ============================================================================
# PRODUCT SHOT DATABASE OPERATIONS
# ============================================================================

def save_product_shot(
    user_id: str,
    result_data: str,
    source_image: Optional[str],
    prompt: str,
    platform: str
) -> Dict:
    """Save a product shot to database"""
    global product_shot_id_counter
    
    record = {
        "id": product_shot_id_counter,
        "user_id": user_id,
        "result_data": result_data,
        "source_image": source_image,
        "prompt": prompt,
        "platform": platform,
        "created_at": datetime.now().isoformat()
    }
    
    product_shots_db.append(record)
    product_shot_id_counter += 1
    
    return record


def get_product_shot_history(user_id: str, limit: int = 50) -> List[Dict]:
    """Get product shot history for a user"""
    user_shots = [
        shot for shot in product_shots_db
        if shot["user_id"] == user_id
    ]
    
    # Sort by created_at descending
    user_shots.sort(key=lambda x: x["created_at"], reverse=True)
    
    return user_shots[:limit]


# ============================================================================
# LOGO GENERATION DATABASE OPERATIONS
# ============================================================================

# In-memory storage for logos
logos_db: List[Dict] = []
logo_id_counter = 1


def save_logo(
    user_id: str,
    image_data: str,
    prompt: str,
    style: str
) -> Dict:
    """Save a generated logo to database"""
    global logo_id_counter
    
    record = {
        "id": logo_id_counter,
        "user_id": user_id,
        "image_data": image_data,
        "prompt": prompt,
        "style": style,
        "created_at": datetime.now().isoformat()
    }
    
    logos_db.append(record)
    logo_id_counter += 1
    
    return record


def get_logo_history(user_id: str, limit: int = 50) -> List[Dict]:
    """Get logo generation history for a user"""
    user_logos = [logo for logo in logos_db if logo["user_id"] == user_id]
    # Sort by created_at descending (newest first)
    user_logos.sort(key=lambda x: x["created_at"], reverse=True)
    return user_logos[:limit]


def delete_logo(logo_id: int) -> bool:
    """Delete a logo from database"""
    global logos_db
    initial_length = len(logos_db)
    logos_db = [logo for logo in logos_db if logo["id"] != logo_id]
    return len(logos_db) < initial_length

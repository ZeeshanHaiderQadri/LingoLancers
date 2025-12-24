"""Database models for Virtual Try-On"""

import sqlite3
import os
from datetime import datetime
from typing import Optional, List, Dict, Any


class VirtualTryOnDB:
    """Database for Virtual Try-On history and results"""
    
    def __init__(self, db_path: str = "virtual_tryon.db"):
        """Initialize database"""
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Create tables if they don't exist"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Try-on results table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tryon_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                person_image_data TEXT,
                garment_image_data TEXT,
                result_image_data TEXT NOT NULL,
                garment_type TEXT,
                garment_count INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                mime_type TEXT DEFAULT 'image/png',
                size_bytes INTEGER,
                is_favorite BOOLEAN DEFAULT 0,
                download_count INTEGER DEFAULT 0
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ Virtual Try-On database initialized")
    
    def save_result(
        self,
        user_id: str,
        result_image_data: str,
        person_image_data: Optional[str] = None,
        garment_image_data: Optional[str] = None,
        garment_type: Optional[str] = None,
        garment_count: int = 1,
        mime_type: str = 'image/png',
        size_bytes: Optional[int] = None
    ) -> int:
        """Save try-on result to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO tryon_results 
            (user_id, person_image_data, garment_image_data, result_image_data, 
             garment_type, garment_count, mime_type, size_bytes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, person_image_data, garment_image_data, result_image_data,
              garment_type, garment_count, mime_type, size_bytes))
        
        result_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return result_id
    
    def get_user_results(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get user's try-on history"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, user_id, result_image_data, garment_type, garment_count,
                   created_at, mime_type, size_bytes, is_favorite, download_count
            FROM tryon_results
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ''', (user_id, limit, offset))
        
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return results
    
    def get_result_by_id(self, result_id: int) -> Optional[Dict[str, Any]]:
        """Get specific result by ID"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM tryon_results WHERE id = ?
        ''', (result_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        return dict(row) if row else None
    
    def delete_result(self, result_id: int, user_id: str) -> bool:
        """Delete a result"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            DELETE FROM tryon_results 
            WHERE id = ? AND user_id = ?
        ''', (result_id, user_id))
        
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        return deleted
    
    def toggle_favorite(self, result_id: int, user_id: str) -> bool:
        """Toggle favorite status"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE tryon_results 
            SET is_favorite = NOT is_favorite
            WHERE id = ? AND user_id = ?
        ''', (result_id, user_id))
        
        updated = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        return updated
    
    def increment_download_count(self, result_id: int):
        """Increment download counter"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE tryon_results 
            SET download_count = download_count + 1
            WHERE id = ?
        ''', (result_id,))
        
        conn.commit()
        conn.close()

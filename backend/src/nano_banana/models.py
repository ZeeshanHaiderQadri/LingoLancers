"""Database models for Nano Banana"""

import sqlite3
from typing import List, Dict, Optional
from datetime import datetime


class NanoBananaDB:
    """Database operations for Nano Banana images"""
    
    def __init__(self, db_path: str = "nano_banana.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS nano_banana_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL DEFAULT 'default_user',
                prompt TEXT NOT NULL,
                style TEXT,
                aspect_ratio TEXT DEFAULT '1:1',
                image_url TEXT NOT NULL,
                image_data TEXT,
                mime_type TEXT DEFAULT 'image/png',
                is_edited BOOLEAN DEFAULT FALSE,
                parent_image_id INTEGER,
                download_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_image_id) REFERENCES nano_banana_images(id)
            )
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_nano_banana_user 
            ON nano_banana_images(user_id)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_nano_banana_created 
            ON nano_banana_images(created_at DESC)
        """)
        
        conn.commit()
        conn.close()
    
    def save_image(
        self,
        prompt: str,
        image_data: str,
        user_id: str = 'default_user',
        style: Optional[str] = None,
        aspect_ratio: str = '1:1',
        mime_type: str = 'image/png',
        is_edited: bool = False,
        parent_image_id: Optional[int] = None
    ) -> int:
        """Save generated image to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Generate image URL (you can customize this)
        image_url = f"/api/nano-banana/images/{datetime.now().timestamp()}.png"
        
        cursor.execute("""
            INSERT INTO nano_banana_images 
            (user_id, prompt, style, aspect_ratio, image_url, image_data, 
             mime_type, is_edited, parent_image_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, prompt, style, aspect_ratio, image_url, image_data,
              mime_type, is_edited, parent_image_id))
        
        image_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return image_id
    
    def get_user_images(
        self,
        user_id: str = 'default_user',
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict]:
        """Get user's image history"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM nano_banana_images
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        """, (user_id, limit, offset))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def get_image_by_id(self, image_id: int) -> Optional[Dict]:
        """Get specific image by ID"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM nano_banana_images WHERE id = ?
        """, (image_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        return dict(row) if row else None
    
    def increment_download_count(self, image_id: int):
        """Increment download counter"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE nano_banana_images 
            SET download_count = download_count + 1
            WHERE id = ?
        """, (image_id,))
        
        conn.commit()
        conn.close()
    
    def delete_image(self, image_id: int, user_id: str = 'default_user') -> bool:
        """Delete image (only if owned by user)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM nano_banana_images 
            WHERE id = ? AND user_id = ?
        """, (image_id, user_id))
        
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        return deleted
    
    def get_edit_history(self, parent_image_id: int) -> List[Dict]:
        """Get all edits of an image"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM nano_banana_images
            WHERE parent_image_id = ?
            ORDER BY created_at ASC
        """, (parent_image_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]

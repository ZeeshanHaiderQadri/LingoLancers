-- Nano Banana Image Generation History
CREATE TABLE IF NOT EXISTS nano_banana_images (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    prompt TEXT NOT NULL,
    style TEXT,
    aspect_ratio TEXT DEFAULT '1:1',
    image_url TEXT NOT NULL,
    image_data TEXT,  -- Base64 encoded image
    mime_type TEXT DEFAULT 'image/png',
    is_edited BOOLEAN DEFAULT FALSE,
    parent_image_id INTEGER,  -- For tracking edit history
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nano_banana_user ON nano_banana_images(user_id);
CREATE INDEX IF NOT EXISTS idx_nano_banana_created ON nano_banana_images(created_at DESC);

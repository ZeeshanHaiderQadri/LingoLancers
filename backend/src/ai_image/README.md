# AI Image Suite Backend

Complete backend implementation for the AI Image Suite, providing comprehensive image processing capabilities.

## Features

### 1. Remove Background
- **Endpoint**: `POST /api/ai-image/remove-background`
- **Description**: Remove background from uploaded images
- **History**: `GET /api/ai-image/remove-background/history`

### 2. Vision (Image Analysis)
- **Endpoint**: `POST /api/ai-image/vision/analyze`
- **Description**: Analyze images and extract insights (objects, colors, tags, scene description)
- **History**: `GET /api/ai-image/vision/history`

### 3. Combine Images
- **Endpoint**: `POST /api/ai-image/combine`
- **Description**: Combine multiple images based on text instructions
- **History**: `GET /api/ai-image/combine/history`

### 4. Product Shot
- **Endpoint**: `POST /api/ai-image/product-shot`
- **Description**: Generate product photography for various platforms
- **Platforms**: Instagram, Facebook, Amazon, Shopify, Pinterest, Twitter
- **History**: `GET /api/ai-image/product-shot/history`

## Architecture

```
ai_image/
├── __init__.py          # Module initialization
├── api.py               # FastAPI endpoints
├── models.py            # Pydantic data models
├── processor.py         # Image processing functions
├── database.py          # Data persistence layer
└── README.md            # This file
```

## Current Implementation

The current implementation uses **mock processing** for demonstration purposes:

- **Remove Background**: Returns the original image with transparency
- **Vision**: Generates random but realistic analysis data
- **Combine Images**: Creates a grid layout of uploaded images
- **Product Shot**: Generates platform-specific mock product shots

## Production Upgrade Path

To upgrade to production-ready AI processing:

### 1. Remove Background
```python
# Install: pip install rembg
from rembg import remove

def remove_background(img: Image.Image) -> Image.Image:
    return remove(img)
```

### 2. Vision (Image Analysis)
```python
# Option A: Google Cloud Vision
from google.cloud import vision

# Option B: AWS Rekognition
import boto3
rekognition = boto3.client('rekognition')

# Option C: Azure Computer Vision
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
```

### 3. Combine Images
```python
# Option A: Stable Diffusion with ControlNet
from diffusers import StableDiffusionControlNetPipeline

# Option B: DALL-E API
import openai
```

### 4. Product Shot
```python
# Option A: Stable Diffusion XL
from diffusers import StableDiffusionXLPipeline

# Option B: Midjourney API
# Option C: DALL-E 3
```

## Database

Currently using **in-memory storage** for simplicity. For production:

### SQLite Migration
```python
import sqlite3

# Create tables
conn = sqlite3.connect('ai_image.db')
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE processed_images (
    id INTEGER PRIMARY KEY,
    user_id TEXT,
    original_data TEXT,
    processed_data TEXT,
    filename TEXT,
    created_at TIMESTAMP
)
''')
```

### PostgreSQL Migration
```python
import psycopg2

# Use with environment variables
DATABASE_URL = os.getenv('DATABASE_URL')
conn = psycopg2.connect(DATABASE_URL)
```

## API Usage Examples

### Remove Background
```bash
curl -X POST http://localhost:8000/api/ai-image/remove-background \
  -F "image=@photo.jpg" \
  -F "user_id=user123"
```

### Vision Analysis
```bash
curl -X POST http://localhost:8000/api/ai-image/vision/analyze \
  -F "image=@photo.jpg" \
  -F "user_id=user123"
```

### Combine Images
```bash
curl -X POST http://localhost:8000/api/ai-image/combine \
  -F "image_0=@photo1.jpg" \
  -F "image_1=@photo2.jpg" \
  -F "instructions=Blend these images seamlessly" \
  -F "user_id=user123" \
  -F "num_images=2"
```

### Product Shot
```bash
curl -X POST http://localhost:8000/api/ai-image/product-shot \
  -F "prompt=Professional product photo on white background" \
  -F "platform=instagram" \
  -F "user_id=user123" \
  -F "image=@product.jpg"
```

## Environment Variables

```env
# Optional: Add AI service credentials
GOOGLE_CLOUD_PROJECT=your-project
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

AZURE_VISION_KEY=your-key
AZURE_VISION_ENDPOINT=your-endpoint

OPENAI_API_KEY=your-key
```

## Testing

Run the backend:
```bash
cd backend
python -m uvicorn src.main:app --reload --port 8000
```

Test endpoints:
```bash
# Check if API is loaded
curl http://localhost:8000/docs

# Look for "ai-image" tag in Swagger UI
```

## Status

✅ **Complete** - All 4 features implemented with mock processing
✅ **Integrated** - Registered in main FastAPI application
✅ **Frontend Ready** - All endpoints match frontend expectations
🔄 **Production Ready** - Upgrade to real AI models when needed

## Next Steps

1. Add real AI model integration (rembg, Google Vision, etc.)
2. Migrate to persistent database (SQLite/PostgreSQL)
3. Add image optimization and caching
4. Implement rate limiting and authentication
5. Add batch processing capabilities
6. Set up cloud storage for images (S3, GCS, Azure Blob)

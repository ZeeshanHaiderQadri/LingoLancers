"""
Virtual Try-On Generator using Google Vertex AI
Allows users to virtually try on clothing and accessories
"""

import os
import base64
from typing import Optional, Dict, Any, List
from io import BytesIO
from PIL import Image as PILImage
from google import genai
from google.genai.types import RecontextImageSource, ProductImage


class VirtualTryOnGenerator:
    """
    Virtual Try-On using Vertex AI
    
    Capabilities:
    - Try on clothing (shirts, dresses, jackets, etc.)
    - Try on accessories (hats, glasses, jewelry, etc.)
    - Multiple garment types supported
    - High-quality realistic results
    """
    
    def __init__(self):
        """Initialize Virtual Try-On with Vertex AI credentials"""
        
        # Get credentials from environment
        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
        self.location = os.getenv('GOOGLE_CLOUD_LOCATION', 'global')
        
        if not self.project_id:
            raise ValueError("❌ GOOGLE_CLOUD_PROJECT environment variable required!")
        
        # Set environment variable for Vertex AI
        os.environ['GOOGLE_GENAI_USE_VERTEXAI'] = 'True'
        
        try:
            self.client = genai.Client()
            self.model_name = "virtual-try-on-preview-08-04"
            print(f"✅ Virtual Try-On initialized (Project: {self.project_id}, Location: {self.location})")
        except Exception as e:
            raise Exception(f"Failed to initialize Virtual Try-On: {e}")
    
    def try_on_garment(
        self,
        person_image_data: bytes,
        garment_image_data: bytes,
        garment_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Apply virtual try-on
        
        Args:
            person_image_data: Image of person/model (bytes)
            garment_image_data: Image of clothing/accessory (bytes)
            garment_type: Optional type hint (shirt, dress, jacket, etc.)
        
        Returns:
            Dict with result image and metadata
        """
        try:
            # Create image objects with image_bytes attribute (required by Vertex AI)
            class ImageWithBytes:
                def __init__(self, data):
                    self.image_bytes = data
            
            person_image = ImageWithBytes(person_image_data)
            garment_image = ImageWithBytes(garment_image_data)
            
            # Create recontext image source
            # Note: Vertex AI automatically detects garment type from the image
            # The garment_type parameter is for our reference only
            source = RecontextImageSource(
                person_image=person_image,
                product_images=[
                    ProductImage(product_image=garment_image)
                ]
            )
            
            # Generate try-on result
            result = self.client.models.recontext_image(
                model=self.model_name,
                source=source
            )
            
            # Extract result
            if result.generated_images and len(result.generated_images) > 0:
                generated_image = result.generated_images[0].image
                
                # Convert to base64
                image_bytes = generated_image.image_bytes
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                
                print(f"✨ Virtual try-on successful: {len(image_bytes)} bytes")
                
                return {
                    'success': True,
                    'image_data': image_base64,
                    'mime_type': 'image/png',
                    'garment_type': garment_type,
                    'size_bytes': len(image_bytes)
                }
            else:
                return {
                    'success': False,
                    'error': 'No images generated'
                }
                
        except Exception as e:
            print(f"❌ Virtual try-on failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def try_on_multiple_garments(
        self,
        person_image_data: bytes,
        garment_images_data: List[bytes]
    ) -> Dict[str, Any]:
        """
        Try on multiple garments at once
        
        Args:
            person_image_data: Image of person/model
            garment_images_data: List of garment images
        
        Returns:
            Dict with result image and metadata
        """
        try:
            # Create image objects with image_bytes attribute (required by Vertex AI)
            class ImageWithBytes:
                def __init__(self, data):
                    self.image_bytes = data
            
            person_image = ImageWithBytes(person_image_data)
            
            # Create all garment images with image_bytes attribute
            product_images = []
            for garment_data in garment_images_data:
                garment_image = ImageWithBytes(garment_data)
                product_images.append(ProductImage(product_image=garment_image))
            
            # Create recontext image source with multiple products
            source = RecontextImageSource(
                person_image=person_image,
                product_images=product_images
            )
            
            # Generate try-on result
            result = self.client.models.recontext_image(
                model=self.model_name,
                source=source
            )
            
            # Extract result
            if result.generated_images and len(result.generated_images) > 0:
                generated_image = result.generated_images[0].image
                
                # Convert to base64
                image_bytes = generated_image.image_bytes
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                
                print(f"✨ Multi-garment try-on successful: {len(image_bytes)} bytes")
                
                return {
                    'success': True,
                    'image_data': image_base64,
                    'mime_type': 'image/png',
                    'garment_count': len(garment_images_data),
                    'size_bytes': len(image_bytes)
                }
            else:
                return {
                    'success': False,
                    'error': 'No images generated'
                }
                
        except Exception as e:
            print(f"❌ Multi-garment try-on failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_supported_garment_types(self) -> List[Dict[str, str]]:
        """Get list of supported garment types"""
        return [
            {
                'id': 'shirt',
                'name': 'Shirt/Top',
                'description': 'T-shirts, blouses, shirts',
                'icon': '👕'
            },
            {
                'id': 'dress',
                'name': 'Dress',
                'description': 'Dresses, gowns',
                'icon': '👗'
            },
            {
                'id': 'jacket',
                'name': 'Jacket/Coat',
                'description': 'Jackets, coats, blazers',
                'icon': '🧥'
            },
            {
                'id': 'pants',
                'name': 'Pants',
                'description': 'Pants, jeans, trousers',
                'icon': '👖'
            },
            {
                'id': 'sweater',
                'name': 'Sweater',
                'description': 'Sweaters, hoodies, cardigans',
                'icon': '🧶'
            },
            {
                'id': 'hat',
                'name': 'Hat',
                'description': 'Hats, caps, beanies',
                'icon': '🎩'
            },
            {
                'id': 'glasses',
                'name': 'Glasses',
                'description': 'Sunglasses, eyeglasses',
                'icon': '🕶️'
            },
            {
                'id': 'jewelry',
                'name': 'Jewelry',
                'description': 'Necklaces, earrings, bracelets',
                'icon': '💍'
            },
            {
                'id': 'shoes',
                'name': 'Shoes',
                'description': 'Shoes, sneakers, boots',
                'icon': '👟'
            },
            {
                'id': 'bag',
                'name': 'Bag',
                'description': 'Handbags, backpacks, purses',
                'icon': '👜'
            }
        ]
    
    def get_model_tips(self) -> List[str]:
        """Get tips for best results"""
        return [
            "Use clear, well-lit photos of the person",
            "Person should be facing forward",
            "Full body or upper body shots work best",
            "Avoid busy backgrounds",
            "Garment images should be on plain background",
            "High resolution images produce better results",
            "Person should be in neutral pose",
            "Avoid extreme angles or poses"
        ]

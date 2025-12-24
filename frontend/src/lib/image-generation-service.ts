/**
 * Image Generation Service
 * Handles image generation using various AI services with API key management
 */

import { apiKeyService, ApiKeyConfig } from './api-key-service';

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  model: string;
  width: number;
  height: number;
  steps?: number;
  guidanceScale?: number;
  serviceId: string;
  referenceImage?: string; // Base64 encoded reference image
  maskImage?: string; // Base64 encoded mask image (for inpainting)
}

export interface ImageGenerationResponse {
  success: boolean;
  images?: string[]; // Base64 encoded images or URLs
  error?: string;
  taskId?: string;
  metadata?: {
    generationTime?: number;
    modelUsed?: string;
    service?: string;
  };
}

class ImageGenerationService {
  constructor() {
    console.log('🖼️ Image Generation Service initialized');
  }

  /**
   * Generate an image using the specified service
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      console.log(`🎨 Generating image with ${request.serviceId}: ${request.prompt}`);
      
      // Get API key for the service with fallback support
      const apiKeyConfig = apiKeyService.getServiceApiKeyWithFallback(request.serviceId);
      
      if (!apiKeyConfig) {
        return {
          success: false,
          error: `No API key configured for ${request.serviceId}. Please add your API key in the settings.`
        };
      }
      
      // Route to appropriate service handler
      switch (request.serviceId) {
        case 'openai':
        case 'openai-dalle': // Handle both service IDs for OpenAI
          return await this.generateWithOpenAI(request, apiKeyConfig);
        case 'stability-ai':
          return await this.generateWithStabilityAI(request, apiKeyConfig);
        case 'replicate':
          return await this.generateWithReplicate(request, apiKeyConfig);
        case 'fal-ai':
          return await this.generateWithFalAI(request, apiKeyConfig);
        default:
          return {
            success: false,
            error: `Unsupported service: ${request.serviceId}`
          };
      }
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during image generation'
      };
    }
  }

  /**
   * Generate image using OpenAI DALL-E
   */
  private async generateWithOpenAI(
    request: ImageGenerationRequest,
    apiKeyConfig: ApiKeyConfig
  ): Promise<ImageGenerationResponse> {
    try {
      const startTime = Date.now();
      
      // If we have a reference image and mask, use the image editing endpoint (inpainting)
      if (request.referenceImage && request.maskImage) {
        // OpenAI only supports specific dimensions for image editing: 256x256, 512x512, 1024x1024
        // Adjust dimensions to the nearest supported size
        let targetWidth = 1024;
        let targetHeight = 1024;
        
        if (request.width && request.height) {
          const maxWidth = Math.max(request.width, request.height);
          if (maxWidth <= 256) {
            targetWidth = 256;
            targetHeight = 256;
          } else if (maxWidth <= 512) {
            targetWidth = 512;
            targetHeight = 512;
          }
        }
        
        // Convert base64 to blob for image
        const imageByteString = atob(request.referenceImage.split(',')[1]);
        const imageMimeString = request.referenceImage.split(',')[0].split(':')[1].split(';')[0];
        const imageAb = new ArrayBuffer(imageByteString.length);
        const imageIa = new Uint8Array(imageAb);
        for (let i = 0; i < imageByteString.length; i++) {
          imageIa[i] = imageByteString.charCodeAt(i);
        }
        let imageBlob = new Blob([imageAb], { type: imageMimeString });
        
        // Convert base64 to blob for mask
        const maskByteString = atob(request.maskImage.split(',')[1]);
        const maskMimeString = request.maskImage.split(',')[0].split(':')[1].split(';')[0];
        const maskAb = new ArrayBuffer(maskByteString.length);
        const maskIa = new Uint8Array(maskAb);
        for (let i = 0; i < maskByteString.length; i++) {
          maskIa[i] = maskByteString.charCodeAt(i);
        }
        let maskBlob = new Blob([maskAb], { type: maskMimeString });
        
        // Resize image and mask to match supported dimensions
        imageBlob = await this.resizeImageBlob(imageBlob, targetWidth, targetHeight);
        maskBlob = await this.resizeImageBlob(maskBlob, targetWidth, targetHeight);
        
        const formData = new FormData();
        formData.append('model', request.model || 'dall-e-2');
        formData.append('n', '1');
        formData.append('size', `${targetWidth}x${targetHeight}`);
        formData.append('response_format', 'b64_json');
        formData.append('prompt', request.prompt);
        formData.append('image', imageBlob);
        formData.append('mask', maskBlob);
        
        const response = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKeyConfig.key}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const generationTime = Date.now() - startTime;
        
        return {
          success: true,
          images: [data.data[0].b64_json],
          metadata: {
            generationTime,
            modelUsed: request.model || 'dall-e-2',
            service: 'OpenAI'
          }
        };
      }
      // If we have a reference image but no mask, use the image variations endpoint
      else if (request.referenceImage) {
        // For image variations, we need to convert the base64 image to a blob
        // and send it as form data
        const formData = new FormData();
        // Note: The variations endpoint doesn't accept a model parameter
        formData.append('n', '1');
        // OpenAI variations only support specific dimensions: 256x256, 512x512, 1024x1024
        let size = '1024x1024';
        if (request.width && request.height) {
          const maxWidth = Math.max(request.width, request.height);
          if (maxWidth <= 256) {
            size = '256x256';
          } else if (maxWidth <= 512) {
            size = '512x512';
          }
        }
        formData.append('size', size);
        formData.append('response_format', 'b64_json');
        
        // Convert base64 to blob
        const byteString = atob(request.referenceImage.split(',')[1]);
        const mimeString = request.referenceImage.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        formData.append('image', blob);
        
        const response = await fetch('https://api.openai.com/v1/images/variations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKeyConfig.key}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const generationTime = Date.now() - startTime;
        
        return {
          success: true,
          images: [data.data[0].b64_json],
          metadata: {
            generationTime,
            modelUsed: 'dall-e-2', // Variations only work with DALL-E 2
            service: 'OpenAI'
          }
        };
      } else {
        // Use the standard image generation endpoint
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKeyConfig.key}`
          },
          body: JSON.stringify({
            model: request.model || 'dall-e-3',
            prompt: request.prompt,
            n: 1,
            size: `${request.width}x${request.height}`,
            response_format: 'b64_json'
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const generationTime = Date.now() - startTime;
        
        return {
          success: true,
          images: [data.data[0].b64_json],
          metadata: {
            generationTime,
            modelUsed: request.model || 'dall-e-3',
            service: 'OpenAI'
          }
        };
      }
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw error;
    }
  }

  /**
   * Resize an image blob to the specified dimensions
   */
  private async resizeImageBlob(blob: Blob, width: number, height: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }
      
      const img = document.createElement('img') as HTMLImageElement;
      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((resizedBlob) => {
          if (resizedBlob) {
            resolve(resizedBlob);
          } else {
            reject(new Error('Failed to resize image'));
          }
        }, blob.type, 0.9); // 90% quality
      };
      
      img.onerror = reject;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Generate image using Stability AI
   */
  private async generateWithStabilityAI(
    request: ImageGenerationRequest,
    apiKeyConfig: ApiKeyConfig
  ): Promise<ImageGenerationResponse> {
    try {
      const startTime = Date.now();
      const engineId = request.model || 'stable-diffusion-xl-1024-v1-0';
      
      const response = await fetch(
        `https://api.stability.ai/v1/generation/${engineId}/text-to-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKeyConfig.key}`
          },
          body: JSON.stringify({
            text_prompts: [
              {
                text: request.prompt,
                weight: 1
              },
              ...(request.negativePrompt ? [{
                text: request.negativePrompt,
                weight: -1
              }] : [])
            ],
            cfg_scale: request.guidanceScale || 7,
            steps: request.steps || 30,
            output_format: 'png',
            width: request.width,
            height: request.height
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Stability AI API error: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      const generationTime = Date.now() - startTime;
      
      return {
        success: true,
        images: data.artifacts.map((artifact: any) => artifact.base64),
        metadata: {
          generationTime,
          modelUsed: engineId,
          service: 'Stability AI'
        }
      };
    } catch (error) {
      console.error('Stability AI generation error:', error);
      throw error;
    }
  }

  /**
   * Generate image using Replicate
   */
  private async generateWithReplicate(
    request: ImageGenerationRequest,
    apiKeyConfig: ApiKeyConfig
  ): Promise<ImageGenerationResponse> {
    try {
      const startTime = Date.now();
      
      // For Replicate, we'll use a popular SDXL model as an example
      const model = request.model || 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535523258f3478729f30fcd2';
      
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiKeyConfig.key}`
        },
        body: JSON.stringify({
          version: model,
          input: {
            prompt: request.prompt,
            negative_prompt: request.negativePrompt,
            width: request.width,
            height: request.height,
            guidance_scale: request.guidanceScale || 7.5,
            num_inference_steps: request.steps || 50
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Replicate API error: ${errorData.detail || response.statusText}`);
      }
      
      const prediction = await response.json();
      const predictionId = prediction.id;
      
      // Poll for completion
      let result;
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes with 10s intervals
      
      while (attempts < maxAttempts) {
        attempts++;
        
        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${apiKeyConfig.key}`
          }
        });
        
        if (!statusResponse.ok) {
          throw new Error(`Failed to get prediction status: ${statusResponse.statusText}`);
        }
        
        result = await statusResponse.json();
        
        if (result.status === 'succeeded') {
          break;
        } else if (result.status === 'failed') {
          throw new Error(`Prediction failed: ${result.error}`);
        }
        
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
      if (result.status !== 'succeeded') {
        throw new Error('Image generation timed out');
      }
      
      const generationTime = Date.now() - startTime;
      
      return {
        success: true,
        images: [result.output[0]], // Replicate returns URLs
        metadata: {
          generationTime,
          modelUsed: model,
          service: 'Replicate'
        }
      };
    } catch (error) {
      console.error('Replicate generation error:', error);
      throw error;
    }
  }

  /**
   * Generate image using Fal.ai
   */
  private async generateWithFalAI(
    request: ImageGenerationRequest,
    apiKeyConfig: ApiKeyConfig
  ): Promise<ImageGenerationResponse> {
    try {
      const startTime = Date.now();
      
      const response = await fetch('https://fal.run/fal-ai/fast-sdxl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${apiKeyConfig.key}`
        },
        body: JSON.stringify({
          prompt: request.prompt,
          negative_prompt: request.negativePrompt,
          image_size: `${request.width}x${request.height}`,
          guidance_scale: request.guidanceScale || 7.5,
          num_inference_steps: request.steps || 30
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Fal.ai API error: ${errorData.detail || response.statusText}`);
      }
      
      const data = await response.json();
      const generationTime = Date.now() - startTime;
      
      return {
        success: true,
        images: [data.images[0].url], // Fal.ai returns URLs
        metadata: {
          generationTime,
          modelUsed: request.model || 'fast-sdxl',
          service: 'Fal.ai'
        }
      };
    } catch (error) {
      console.error('Fal.ai generation error:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const imageGenerationService = new ImageGenerationService();

export default ImageGenerationService;
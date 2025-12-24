/**
 * API Key Management Service
 * Handles storage and retrieval of API keys for generative services
 */

// Define the structure for API key configurations
export interface ApiKeyConfig {
  id: string;
  name: string;
  key: string;
  provider: string;
  model?: string;
  baseUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the structure for image generation services
export interface ImageGenerationService {
  id: string;
  name: string;
  provider: string;
  models: string[];
  description: string;
  requiresApiKey: boolean;
}

class ApiKeyService {
  private storageKey = 'lingo_api_keys';
  private imageServices: ImageGenerationService[] = [
    {
      id: 'openai',
      name: 'OpenAI DALL-E',
      provider: 'OpenAI',
      models: ['dall-e-3', 'dall-e-2'],
      description: 'Create stunning images from text descriptions using OpenAI\'s DALL-E models',
      requiresApiKey: true
    },
    {
      id: 'stability-ai',
      name: 'Stable Diffusion',
      provider: 'Stability AI',
      models: ['stable-diffusion-xl-1024-v1-0', 'stable-diffusion-v1-6', 'stable-diffusion-512-v2-1'],
      description: 'Generate high-quality images using Stability AI\'s Stable Diffusion models',
      requiresApiKey: true
    },
    {
      id: 'replicate',
      name: 'Replicate Models',
      provider: 'Replicate',
      models: ['sdxl', 'sdxl-lightning', 'kandinsky-2.2'],
      description: 'Access a wide variety of image generation models through Replicate',
      requiresApiKey: true
    },
    {
      id: 'fal-ai',
      name: 'Fal.ai',
      provider: 'Fal.ai',
      models: ['fast-sdxl', 'realistic-vision-6.0', 'dreamshaper-8'],
      description: 'Fast and efficient image generation with Fal.ai',
      requiresApiKey: true
    }
  ];

  constructor() {
    console.log('🔐 API Key Service initialized');
  }

  /**
   * Save an API key to localStorage
   */
  saveApiKey(config: Omit<ApiKeyConfig, 'createdAt' | 'updatedAt'>): void {
    try {
      const keys = this.getApiKeys();
      const now = new Date();
      
      const keyConfig: ApiKeyConfig = {
        ...config,
        createdAt: config.id in keys ? keys[config.id].createdAt : now,
        updatedAt: now
      };
      
      keys[config.id] = keyConfig;
      localStorage.setItem(this.storageKey, JSON.stringify(keys));
      console.log(`✅ API key saved for ${config.name}`);
    } catch (error) {
      console.error('❌ Failed to save API key:', error);
      throw new Error('Failed to save API key');
    }
  }

  /**
   * Get all API keys from localStorage
   */
  getApiKeys(): Record<string, ApiKeyConfig> {
    try {
      const keys = localStorage.getItem(this.storageKey);
      return keys ? JSON.parse(keys) : {};
    } catch (error) {
      console.error('❌ Failed to retrieve API keys:', error);
      return {};
    }
  }

  /**
   * Get a specific API key by ID
   */
  getApiKey(id: string): ApiKeyConfig | null {
    const keys = this.getApiKeys();
    return keys[id] || null;
  }

  /**
   * Delete an API key by ID
   */
  deleteApiKey(id: string): void {
    try {
      const keys = this.getApiKeys();
      if (id in keys) {
        delete keys[id];
        localStorage.setItem(this.storageKey, JSON.stringify(keys));
        console.log(`🗑️ API key deleted for ${id}`);
      }
    } catch (error) {
      console.error('❌ Failed to delete API key:', error);
      throw new Error('Failed to delete API key');
    }
  }

  /**
   * Get available image generation services
   */
  getImageGenerationServices(): ImageGenerationService[] {
    return this.imageServices;
  }

  /**
   * Get API key for a specific service
   */
  getServiceApiKey(serviceId: string): ApiKeyConfig | null {
    return this.getApiKey(serviceId);
  }

  /**
   * Check if a service has a valid API key
   */
  hasValidApiKey(serviceId: string): boolean {
    const key = this.getApiKey(serviceId);
    return key !== null && key.key.length > 0;
  }

  /**
   * Check if a service has a valid API key, with fallback to alternative service IDs
   */
  hasValidApiKeyWithFallback(serviceId: string): boolean {
    // First check the primary service ID
    if (this.hasValidApiKey(serviceId)) {
      return true;
    }
    
    // Check fallback service IDs
    const fallbackMap: Record<string, string[]> = {
      'openai-dalle': ['openai'],
      'openai': ['openai-dalle']
    };
    
    const fallbacks = fallbackMap[serviceId] || [];
    for (const fallbackId of fallbacks) {
      if (this.hasValidApiKey(fallbackId)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get API key for a specific service, with fallback to alternative service IDs
   */
  getServiceApiKeyWithFallback(serviceId: string): ApiKeyConfig | null {
    // First try the primary service ID
    let key = this.getApiKey(serviceId);
    if (key !== null) {
      return key;
    }
    
    // Check fallback service IDs
    const fallbackMap: Record<string, string[]> = {
      'openai-dalle': ['openai'],
      'openai': ['openai-dalle']
    };
    
    const fallbacks = fallbackMap[serviceId] || [];
    for (const fallbackId of fallbacks) {
      key = this.getApiKey(fallbackId);
      if (key !== null) {
        return key;
      }
    }
    
    return null;
  }
}

// Create singleton instance
export const apiKeyService = new ApiKeyService();

export default ApiKeyService;
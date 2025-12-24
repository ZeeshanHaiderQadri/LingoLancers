/**
 * Custom hook for API key management
 * Provides easy access to API keys and service status
 */

import { useState, useEffect } from 'react';
import { apiKeyService, ApiKeyConfig } from '@/lib/api-key-service';

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, ApiKeyConfig>>({});
  const [loading, setLoading] = useState(true);

  // Load API keys on mount
  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = () => {
    try {
      const keys = apiKeyService.getApiKeys();
      setApiKeys(keys);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      setLoading(false);
    }
  };

  const saveApiKey = (config: Omit<ApiKeyConfig, 'createdAt' | 'updatedAt'>) => {
    try {
      apiKeyService.saveApiKey(config);
      loadApiKeys(); // Refresh the keys
      return { success: true };
    } catch (error) {
      console.error('Failed to save API key:', error);
      return { success: false, error: 'Failed to save API key' };
    }
  };

  const deleteApiKey = (id: string) => {
    try {
      apiKeyService.deleteApiKey(id);
      loadApiKeys(); // Refresh the keys
      return { success: true };
    } catch (error) {
      console.error('Failed to delete API key:', error);
      return { success: false, error: 'Failed to delete API key' };
    }
  };

  const hasValidApiKey = (serviceId: string): boolean => {
    return apiKeyService.hasValidApiKey(serviceId);
  };

  const getApiKey = (serviceId: string): ApiKeyConfig | null => {
    return apiKeyService.getApiKey(serviceId);
  };

  return {
    apiKeys,
    loading,
    saveApiKey,
    deleteApiKey,
    hasValidApiKey,
    getApiKey,
    refresh: loadApiKeys
  };
};

export default useApiKeys;
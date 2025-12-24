import { useState, useEffect } from 'react';

// Types matching the backend API
export interface ToolInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  api_required: boolean;
  installed: boolean;
  configured: boolean;
  capabilities: string[];
}

export interface MCPServerInfo {
  id: string;
  name: string;
  category: string;
  endpoint: string;
  api_key_required: boolean;
  auth_fields: string[];
  description: string;
  capabilities: string[];
  installed: boolean;
  configured: boolean;
}

export interface ServerConfigRequest {
  server_id: string;
  config: Record<string, string>;
}

export interface ServerConfigResponse {
  success: boolean;
  message: string;
}

// Hook for tools and MCP servers management
export const useToolsManagement = () => {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [mcpServers, setMcpServers] = useState<MCPServerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tools and MCP servers
  const fetchToolsAndServers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch tools
      const toolsResponse = await fetch('/api/tools');
      if (!toolsResponse.ok) {
        throw new Error('Failed to fetch tools');
      }
      const toolsData: ToolInfo[] = await toolsResponse.json();
      setTools(toolsData);
      
      // Fetch MCP servers
      const serversResponse = await fetch('/api/mcp-servers');
      if (!serversResponse.ok) {
        throw new Error('Failed to fetch MCP servers');
      }
      const serversData: MCPServerInfo[] = await serversResponse.json();
      setMcpServers(serversData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Configure an MCP server
  const configureServer = async (config: ServerConfigRequest): Promise<ServerConfigResponse> => {
    try {
      const response = await fetch('/api/mcp-servers/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error('Failed to configure server');
      }
      
      const result: ServerConfigResponse = await response.json();
      return result;
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to configure server',
      };
    }
  };

  // Install a tool/server
  const installItem = async (id: string, type: 'tool' | 'server') => {
    try {
      // In a real implementation, this would call the appropriate API endpoint
      // For now, we'll just update the local state and refresh
      if (type === 'tool') {
        setTools(prev => prev.map(tool => 
          tool.id === id ? { ...tool, installed: true } : tool
        ));
      } else {
        setMcpServers(prev => prev.map(server => 
          server.id === id ? { ...server, installed: true } : server
        ));
      }
      // Refresh the data to get actual status
      await fetchToolsAndServers();
      return { success: true, message: 'Item installed successfully' };
    } catch (err) {
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to install item' 
      };
    }
  };

  // Uninstall a tool/server
  const uninstallItem = async (id: string, type: 'tool' | 'server') => {
    try {
      // In a real implementation, this would call the appropriate API endpoint
      // For now, we'll just update the local state and refresh
      if (type === 'tool') {
        setTools(prev => prev.map(tool => 
          tool.id === id ? { ...tool, installed: false, configured: false } : tool
        ));
      } else {
        setMcpServers(prev => prev.map(server => 
          server.id === id ? { ...server, installed: false, configured: false } : server
        ));
      }
      // Refresh the data to get actual status
      await fetchToolsAndServers();
      return { success: true, message: 'Item uninstalled successfully' };
    } catch (err) {
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to uninstall item' 
      };
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchToolsAndServers();
  }, []);

  return {
    tools,
    mcpServers,
    isLoading,
    error,
    fetchToolsAndServers,
    configureServer,
    installItem,
    uninstallItem,
  };
};
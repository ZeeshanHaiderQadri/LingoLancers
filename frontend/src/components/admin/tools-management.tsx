"use client";

import React, { useState } from 'react';
import { 
  Wrench, 
  Server, 
  Package, 
  Database, 
  Code, 
  Search, 
  FileText, 
  Globe, 
  Key, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Play,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { useToolsManagement } from '@/hooks/use-tools-management';
import { toast } from '@/hooks/use-toast';

// Types for our tools and MCP servers
interface AuthField {
  name: string;
  value: string;
  masked: boolean;
}

const ToolsManagement = () => {
  const { 
    tools, 
    mcpServers, 
    isLoading, 
    error, 
    fetchToolsAndServers, 
    configureServer, 
    installItem, 
    uninstallItem 
  } = useToolsManagement();
  
  const [filteredTools, setFilteredTools] = useState(tools);
  const [filteredServers, setFilteredServers] = useState(mcpServers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const [authFields, setAuthFields] = useState<AuthField[]>([]);
  const [activeTab, setActiveTab] = useState('tools');

  // Filter tools and servers based on search term and category
  React.useEffect(() => {
    let filteredToolsResult = tools;
    let filteredServersResult = mcpServers;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredToolsResult = tools.filter(tool => 
        tool.name.toLowerCase().includes(term) || 
        tool.description.toLowerCase().includes(term) ||
        tool.category.toLowerCase().includes(term)
      );
      
      filteredServersResult = mcpServers.filter(server => 
        server.name.toLowerCase().includes(term) || 
        server.description.toLowerCase().includes(term) ||
        server.category.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filteredToolsResult = filteredToolsResult.filter(tool => tool.category === selectedCategory);
      filteredServersResult = filteredServersResult.filter(server => server.category === selectedCategory);
    }

    setFilteredTools(filteredToolsResult);
    setFilteredServers(filteredServersResult);
  }, [searchTerm, selectedCategory, tools, mcpServers]);

  // Get unique categories for filtering
  const getCategories = () => {
    const toolCategories = [...new Set(tools.map(tool => tool.category))];
    const serverCategories = [...new Set(mcpServers.map(server => server.category))];
    const allCategories = [...new Set([...toolCategories, ...serverCategories])];
    return ['all', ...allCategories.sort()];
  };

  // Handle server configuration
  const handleConfigureServer = (server: any) => {
    setSelectedServer(server);
    setAuthFields(server.auth_fields.map((field: string) => ({
      name: field,
      value: '',
      masked: true
    })));
    setIsConfigDialogOpen(true);
  };

  // Toggle password visibility
  const togglePasswordVisibility = (index: number) => {
    setAuthFields(prev => prev.map((field, i) => 
      i === index ? { ...field, masked: !field.masked } : field
    ));
  };

  // Handle auth field change
  const handleAuthFieldChange = (index: number, value: string) => {
    setAuthFields(prev => prev.map((field, i) => 
      i === index ? { ...field, value } : field
    ));
  };

  // Save server configuration
  const saveServerConfiguration = async () => {
    if (!selectedServer) return;
    
    try {
      const config = authFields.reduce((acc, field) => {
        acc[field.name] = field.value;
        return acc;
      }, {} as Record<string, string>);
      
      const result = await configureServer({
        server_id: selectedServer.id,
        config
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setIsConfigDialogOpen(false);
        setSelectedServer(null);
        setAuthFields([]);
        // Refresh the data
        fetchToolsAndServers();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to configure server",
        variant: "destructive",
      });
    }
  };

  // Install a tool/server
  const handleInstall = async (id: string, type: 'tool' | 'server') => {
    try {
      const result = await installItem(id, type);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Refresh the data
        fetchToolsAndServers();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to install item",
        variant: "destructive",
      });
    }
  };

  // Uninstall a tool/server
  const handleUninstall = async (id: string, type: 'tool' | 'server') => {
    try {
      const result = await uninstallItem(id, type);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Refresh the data
        fetchToolsAndServers();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to uninstall item",
        variant: "destructive",
      });
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Search': return <Search className="h-4 w-4" />;
      case 'Knowledge': return <FileText className="h-4 w-4" />;
      case 'Data': return <Database className="h-4 w-4" />;
      case 'Code': return <Code className="h-4 w-4" />;
      case 'Development': return <Code className="h-4 w-4" />;
      case 'Finance': return <Database className="h-4 w-4" />;
      case 'Media': return <FileText className="h-4 w-4" />;
      case 'Productivity': return <Globe className="h-4 w-4" />;
      case 'API Integrations': return <Globe className="h-4 w-4" />;
      case 'Utilities': return <Wrench className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading tools and servers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tools & MCP Servers</h2>
          <p className="text-muted-foreground">
            Manage tools and Model Context Protocol servers for your agentic workflows
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools and servers..."
              className="pl-8 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {getCategories().map(category => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center gap-2">
                    {category !== 'all' && getCategoryIcon(category)}
                    {category === 'all' ? 'All Categories' : category}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            LangChain Tools
          </TabsTrigger>
          <TabsTrigger value="mcp" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            MCP Servers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map(tool => (
              <Card key={tool.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getCategoryIcon(tool.category)}
                    {tool.name}
                  </CardTitle>
                  <Badge variant={tool.installed ? "default" : "secondary"}>
                    {tool.installed ? "Installed" : "Not Installed"}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3">
                    {tool.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tool.capabilities.slice(0, 3).map(cap => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                    {tool.capabilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{tool.capabilities.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {tool.api_required && (
                        <div className="flex items-center gap-1">
                          <Key className="h-3 w-3" />
                          <span className="text-xs">API Key</span>
                        </div>
                      )}
                      {tool.configured && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!tool.installed ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleInstall(tool.id, 'tool')}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Install
                        </Button>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUninstall(tool.id, 'tool')}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No tools found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mcp" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredServers.map(server => (
              <Card key={server.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getCategoryIcon(server.category)}
                    {server.name}
                  </CardTitle>
                  <Badge variant={server.installed ? "default" : "secondary"}>
                    {server.installed ? "Installed" : "Not Installed"}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3">
                    {server.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {server.capabilities.slice(0, 3).map(cap => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                    {server.capabilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{server.capabilities.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {server.api_key_required && (
                        <div className="flex items-center gap-1">
                          <Key className="h-3 w-3" />
                          <span className="text-xs">API Key</span>
                        </div>
                      )}
                      {server.configured && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!server.installed ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleInstall(server.id, 'server')}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Install
                        </Button>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleConfigureServer(server)}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUninstall(server.id, 'server')}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredServers.length === 0 && (
            <div className="text-center py-12">
              <Server className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No MCP servers found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Configure {selectedServer?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedServer && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedServer.description}
              </p>
              
              <div className="space-y-4">
                <h4 className="font-medium">Authentication Fields</h4>
                
                {authFields.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`field-${index}`}>{field.name}</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={`field-${index}`}
                          type={field.masked ? "password" : "text"}
                          value={field.value}
                          onChange={(e) => handleAuthFieldChange(index, e.target.value)}
                          placeholder={`Enter ${field.name}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => togglePasswordVisibility(index)}
                        >
                          {field.masked ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsConfigDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={saveServerConfiguration}>
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ToolsManagement;
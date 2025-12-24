"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Code, 
  GitBranch,
  Bug,
  Zap,
  Server,
  Database,
  Terminal,
  Key,
  Copy,
  Check
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const DevelopersTab = () => {
  // Mock data for API keys
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production API Key',
      key: 'sk_prod_****************abcd',
      createdAt: '2023-01-15',
      lastUsed: '2023-06-15',
      status: 'active',
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'sk_dev_****************efgh',
      createdAt: '2023-03-20',
      lastUsed: '2023-06-10',
      status: 'active',
    },
    {
      id: 3,
      name: 'Testing API Key',
      key: 'sk_test_****************ijkl',
      createdAt: '2023-05-01',
      lastUsed: 'Never',
      status: 'inactive',
    },
  ]);

  // Mock data for endpoints
  const endpoints = [
    {
      id: 1,
      name: 'Create Agent',
      method: 'POST',
      path: '/api/v1/agents',
      description: 'Create a new AI agent',
      rateLimit: '1000/day',
    },
    {
      id: 2,
      name: 'Get Agents',
      method: 'GET',
      path: '/api/v1/agents',
      description: 'Retrieve list of agents',
      rateLimit: '5000/day',
    },
    {
      id: 3,
      name: 'Run Workflow',
      method: 'POST',
      path: '/api/v1/workflows/run',
      description: 'Execute a workflow',
      rateLimit: '2000/day',
    },
    {
      id: 4,
      name: 'Get Content',
      method: 'GET',
      path: '/api/v1/content',
      description: 'Retrieve generated content',
      rateLimit: '10000/day',
    },
  ];

  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: 'read'
  });

  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);

  const handleCreateApiKey = () => {
    if (!newApiKey.name) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
      return;
    }

    // Mock API key creation
    const newKey = {
      id: apiKeys.length + 1,
      name: newApiKey.name,
      key: `sk_${newApiKey.permissions}_****************${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'active',
    };

    setApiKeys([...apiKeys, newKey]);
    setNewApiKey({ name: '', permissions: 'read' });

    toast({
      title: "Success",
      description: "API key created successfully",
    });
  };

  const handleCopyKey = (key: string, id: number) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);

    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const handleRevokeKey = (id: number) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, status: 'revoked' } : key
    ));

    toast({
      title: "Revoked",
      description: "API key has been revoked",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Developer Tools</h2>
          <p className="text-muted-foreground">
            API keys, endpoints, and developer resources
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search developer resources..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Developer Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,489</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              2 revoked
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Endpoints</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              4 deprecated
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.2%</div>
            <p className="text-xs text-muted-foreground">
              Down from 0.5%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="Enter a name for your API key"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key-permissions">Permissions</Label>
                <Select 
                  value={newApiKey.permissions} 
                  onValueChange={(value) => setNewApiKey({...newApiKey, permissions: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select permissions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read Only</SelectItem>
                    <SelectItem value="write">Read & Write</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateApiKey} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active API Keys</CardTitle>
            <CardDescription>
              Your currently active API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.filter(key => key.status !== 'revoked').map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{key.name}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Key className="h-3 w-3 mr-1" />
                      <span className="font-mono text-xs">{key.key}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopyKey(key.key, key.id)}
                    >
                      {copiedKeyId === key.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRevokeKey(key.id)}
                    >
                      <span className="text-red-500">Revoke</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Available API endpoints and their specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endpoint</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Rate Limit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints.map((endpoint) => (
                <TableRow key={endpoint.id}>
                  <TableCell>
                    <div className="font-medium">{endpoint.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        endpoint.method === 'GET' ? 'default' : 
                        endpoint.method === 'POST' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {endpoint.method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">{endpoint.path}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground">{endpoint.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{endpoint.rateLimit}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Developer Documentation</CardTitle>
          <CardDescription>
            Resources and guides for developers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:bg-muted transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Code className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">API Reference</h3>
                    <p className="text-sm text-muted-foreground">Complete API documentation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:bg-muted transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <GitBranch className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">SDKs</h3>
                    <p className="text-sm text-muted-foreground">Official client libraries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:bg-muted transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Terminal className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">Tutorials</h3>
                    <p className="text-sm text-muted-foreground">Step-by-step guides</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevelopersTab;
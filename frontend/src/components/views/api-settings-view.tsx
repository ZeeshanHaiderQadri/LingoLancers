
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
    Zap, 
    ShoppingCart, 
    Rss, 
    Twitter, 
    Facebook, 
    KeyRound
} from "lucide-react";
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { apiKeyService } from '@/lib/api-key-service';

type IntegrationCardProps = {
    title: string;
    description: string;
    icon: React.ReactNode;
    connected?: boolean;
};

const IntegrationCard = ({ title, description, icon, connected }: IntegrationCardProps) => (
  <Card className="bg-background/50 hover:bg-card/80 transition-colors">
    <CardHeader>
      <div className="flex justify-between items-start">
        <CardTitle className="text-lg font-headline">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground h-12">{description}</p>
    </CardContent>
    <CardFooter className="flex justify-between items-center">
        {connected ? 
            <Badge variant="default" className="bg-green-500/80 text-white">Connected</Badge>
            : <Badge variant="secondary">Not Connected</Badge>
        }
        <Button variant={connected ? "destructive" : "default"} className={cn(connected ? "" : "bg-green-500 hover:bg-green-600 text-white")}>
          {connected ? "Disconnect" : "Connect"}
        </Button>
    </CardFooter>
  </Card>
);

const ApiKeyCard = ({ 
    title, 
    apiKeyPlaceholder, 
    models, 
    additionalFields,
    serviceId
}: { 
    title: string, 
    apiKeyPlaceholder: string, 
    models?: { value: string, label: string }[],
    additionalFields?: { id: string, label: string, placeholder: string }[],
    serviceId: string
}) => {
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [additionalValues, setAdditionalValues] = useState<Record<string, string>>({});
    
    // Load existing API key if available
    useEffect(() => {
        const savedKey = apiKeyService.getApiKey(serviceId);
        if (savedKey) {
            setApiKey(savedKey.key);
            if (savedKey.model) {
                setSelectedModel(savedKey.model);
            }
            // Load additional fields if they exist
            if (additionalFields) {
                const additionalData: Record<string, string> = {};
                additionalFields.forEach(field => {
                    if ((savedKey as any)[field.id]) {
                        additionalData[field.id] = (savedKey as any)[field.id];
                    }
                });
                setAdditionalValues(additionalData);
            }
        }
    }, [serviceId, additionalFields]);

    const handleSave = () => {
        try {
            const config: any = {
                id: serviceId,
                name: title,
                key: apiKey,
                provider: title,
                updatedAt: new Date()
            };
            
            if (selectedModel) {
                config.model = selectedModel;
            }
            
            if (additionalFields) {
                additionalFields.forEach(field => {
                    if (additionalValues[field.id]) {
                        config[field.id] = additionalValues[field.id];
                    }
                });
            }
            
            apiKeyService.saveApiKey(config);
            
            // Show success feedback
            const button = document.getElementById(`${title.toLowerCase()}-save-btn`);
            if (button) {
                const originalText = button.textContent;
                button.textContent = 'Saved!';
                button.classList.add('bg-green-500');
                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('bg-green-500');
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to save API key:', error);
            alert('Failed to save API key. Please try again.');
        }
    };

    const handleAdditionalFieldChange = (id: string, value: string) => {
        setAdditionalValues(prev => ({
            ...prev,
            [id]: value
        }));
    };

    return (
        <Card className="bg-background/50">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {additionalFields?.map(field => (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={`${title.toLowerCase()}-${field.id}`}>{field.label}</Label>
                        <Input 
                            id={`${title.toLowerCase()}-${field.id}`} 
                            placeholder={field.placeholder} 
                            value={additionalValues[field.id] || ''}
                            onChange={(e) => handleAdditionalFieldChange(field.id, e.target.value)}
                        />
                    </div>
                ))}
                <div className="space-y-2">
                    <Label htmlFor={`${title.toLowerCase()}-key`}>API Key</Label>
                    <Input 
                        id={`${title.toLowerCase()}-key`} 
                        type="password" 
                        placeholder={apiKeyPlaceholder} 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                </div>
                {models && (
                    <div className="space-y-2">
                        <Label htmlFor={`${title.toLowerCase()}-model`}>Model</Label>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                            <SelectTrigger id={`${title.toLowerCase()}-model`}>
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                                {models.map(model => (
                                    <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button 
                    id={`${title.toLowerCase()}-save-btn`}
                    onClick={handleSave}
                    className="ml-auto"
                >
                    Save
                </Button>
            </CardFooter>
        </Card>
    );
};

const IntegrationsTab = () => (
    <div>
        <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline">Connect Your Platforms</h2>
            <p className="text-muted-foreground mt-1">Supercharge your workflow by connecting LingoLancers to your favorite tools.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <IntegrationCard 
                title="Shopify"
                description="Sync products and automate content for your e-commerce store."
                icon={<ShoppingCart className="h-5 w-5"/>}
                connected
            />
            <IntegrationCard 
                title="WordPress"
                description="Publish generated articles directly to your blog as drafts or posts."
                icon={<Rss className="h-5 w-5"/>}
            />
            <IntegrationCard 
                title="Twitter / X"
                description="Schedule and post generated content, including images and videos."
                icon={<Twitter className="h-5 w-5"/>}
                connected
            />
            <IntegrationCard 
                title="Facebook Pages"
                description="Share your creations with your audience on Facebook Pages."
                icon={<Facebook className="h-5 w-5"/>}
            />
        </div>
    </div>
);

const ApiKeysTab = () => (
    <div>
         <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline">API Key Management</h2>
            <p className="text-muted-foreground mt-1">Configure API keys for third-party services and AI models.</p>
        </div>
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold font-headline mb-4">AI Models</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ApiKeyCard 
                        title="OpenAI" 
                        apiKeyPlaceholder="sk-..." 
                        serviceId="openai"
                        models={[
                            { value: 'gpt-4o', label: 'GPT-4o' },
                            { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                        ]}
                    />
                    <ApiKeyCard 
                        title="Google Gemini" 
                        apiKeyPlaceholder="AIzaSy..."
                        serviceId="gemini"
                        models={[
                            { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
                            { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
                            { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro' },
                        ]}
                    />
                    <ApiKeyCard 
                        title="Anthropic" 
                        apiKeyPlaceholder="sk-ant-..."
                        serviceId="anthropic"
                        models={[
                            { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
                            { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
                            { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
                        ]}
                    />
                    <ApiKeyCard 
                        title="Azure OpenAI" 
                        apiKeyPlaceholder="Enter API Key"
                        serviceId="azure-openai"
                        additionalFields={[{ id: 'endpoint', label: 'Azure Endpoint', placeholder: 'https://... .openai.azure.com/'}]}
                    />
                    <ApiKeyCard title="X AI (Grok)" apiKeyPlaceholder="Enter Grok API Key" serviceId="x-ai" />
                    <ApiKeyCard title="Deepseek" apiKeyPlaceholder="Enter Deepseek API Key" serviceId="deepseek" />
                     <ApiKeyCard 
                        title="Custom Model"
                        apiKeyPlaceholder="Enter your custom API Key"
                        serviceId="custom-model"
                        additionalFields={[
                            { id: 'model-name', label: 'Custom Model Name', placeholder: 'e.g., MyLlama' },
                            { id: 'base-url', label: 'API Base URL', placeholder: 'https://api.custom-model.com/v1' },
                        ]}
                    />
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Note: For image generation with OpenAI DALL-E, please also configure your API key in the "Image & Video Generation" section below.
                </p>
            </div>

            <div>
                <h3 className="text-xl font-semibold font-headline mb-4">Image & Video Generation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <ApiKeyCard 
                        title="OpenAI DALL-E" 
                        apiKeyPlaceholder="sk-..." 
                        serviceId="openai-dalle"
                        models={[
                            { value: 'dall-e-3', label: 'DALL-E 3' },
                            { value: 'dall-e-2', label: 'DALL-E 2' },
                        ]}
                    />
                     <ApiKeyCard 
                        title="Stable Diffusion" 
                        apiKeyPlaceholder="Enter Stability AI API Key" 
                        serviceId="stability-ai"
                        models={[
                            { value: 'stable-diffusion-xl-1024-v1-0', label: 'SDXL 1024' },
                            { value: 'stable-diffusion-v1-6', label: 'SD 1.6' },
                            { value: 'stable-diffusion-512-v2-1', label: 'SD 512 v2.1' },
                        ]}
                    />
                     <ApiKeyCard 
                        title="Replicate" 
                        apiKeyPlaceholder="Enter Replicate API Key" 
                        serviceId="replicate"
                        models={[
                            { value: 'sdxl', label: 'SDXL' },
                            { value: 'sdxl-lightning', label: 'SDXL Lightning' },
                            { value: 'kandinsky-2.2', label: 'Kandinsky 2.2' },
                        ]}
                    />
                     <ApiKeyCard title="Fal AI" apiKeyPlaceholder="Enter Fal AI API Key" serviceId="fal-ai" />
                     <ApiKeyCard title="Clipdrop" apiKeyPlaceholder="Enter Clipdrop API Key" serviceId="clipdrop" />
                     <ApiKeyCard title="Freepik" apiKeyPlaceholder="Enter Freepik API Key" serviceId="freepik" />
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold font-headline mb-4">Text-To-Speech (TTS)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ApiKeyCard title="Synthesia" apiKeyPlaceholder="Enter Synthesia API Key" serviceId="synthesia" />
                    <ApiKeyCard title="Together" apiKeyPlaceholder="Enter Together API Key" serviceId="together" />
                    <ApiKeyCard title="Heygen" apiKeyPlaceholder="Enter Heygen API Key" serviceId="heygen" />
                    <ApiKeyCard title="Aimlapi" apiKeyPlaceholder="Enter Aimlapi API Key" serviceId="aimlapi" />
                </div>
            </div>

            <div>
                 <h3 className="text-xl font-semibold font-headline mb-4">Search & Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ApiKeyCard title="Serper" apiKeyPlaceholder="Enter Serper API Key" serviceId="serper" />
                    <ApiKeyCard title="Perplexity" apiKeyPlaceholder="Enter Perplexity API Key" serviceId="perplexity" />
                    <ApiKeyCard title="Search Api" apiKeyPlaceholder="Enter Search API Key" serviceId="search-api" />
                    <ApiKeyCard title="Unsplash" apiKeyPlaceholder="Enter Unsplash Access Key" serviceId="unsplash" />
                    <ApiKeyCard title="Pexels" apiKeyPlaceholder="Enter Pexels API Key" serviceId="pexels" />
                    <ApiKeyCard title="Pixabay" apiKeyPlaceholder="Enter Pixabay API Key" serviceId="pixabay" />
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold font-headline mb-4">Other Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <ApiKeyCard title="Plagiarism API" apiKeyPlaceholder="Enter Plagiarism Checker API Key" serviceId="plagiarism" />
                     <ApiKeyCard title="Xero API" apiKeyPlaceholder="Enter Xero API Key" serviceId="xero" />
                     <ApiKeyCard title="Ably Setting" apiKeyPlaceholder="Enter Ably API Key" serviceId="ably" />
                     <ApiKeyCard title="Open Router" apiKeyPlaceholder="Enter Open Router API Key" serviceId="open-router" />
                </div>
            </div>
        </div>
    </div>
);


export default function ApiSettingsView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState("integrations");

  useEffect(() => {
    // If initialTab is anything other than 'integrations', switch to the 'api-keys' tab.
    if (initialTab && initialTab !== 'integrations') {
      setActiveTab('api-keys');
    } else {
        setActiveTab('integrations');
    }
  }, [initialTab]);
  
  return (
    <div className="p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
                <TabsTrigger value="integrations"><Zap className="mr-2 h-4 w-4"/>Integrations</TabsTrigger>
                <TabsTrigger value="api-keys"><KeyRound className="mr-2 h-4 w-4"/>API Keys</TabsTrigger>
            </TabsList>
            <TabsContent value="integrations">
                <IntegrationsTab />
            </TabsContent>
            <TabsContent value="api-keys">
                <ApiKeysTab />
            </TabsContent>
        </Tabs>
    </div>
  );
}

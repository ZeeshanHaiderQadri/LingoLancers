'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Sparkles, Upload, RefreshCcw, Eye, Download, History, 
  Camera, Wand2, Zap, Image as ImageIcon, Square, RectangleVertical, RectangleHorizontal
} from 'lucide-react';
import Image from 'next/image';

interface GeneratedImage {
  id: number;
  result_data: string;
  prompt: string;
  platform: string;
  source_image?: string;
  created_at: string;
}

// Aspect ratio options with icons
const aspectRatios = [
  { id: '1:1', name: 'Square', icon: Square, description: '1:1 ratio' },
  { id: '9:16', name: 'Portrait', icon: RectangleVertical, description: '9:16 ratio' },
  { id: '16:9', name: 'Landscape', icon: RectangleHorizontal, description: '16:9 ratio' },
];

export default function ProductShot() {
  const [prompt, setPrompt] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [baseImage, setBaseImage] = useState<File | null>(null);
  const [baseImagePreview, setBaseImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [fullViewImage, setFullViewImage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/ai-image/product-shot/history?user_id=default_user&limit=50');
      const data = await response.json();
      if (data.success) {
        setHistory(data.shots || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBaseImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBaseImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (mode === 'image' && !baseImage) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('platform', 'shopify'); // Default platform for backend compatibility
      formData.append('user_id', 'default_user');
      formData.append('style', 'studio'); // Always use realistic studio style
      
      if (mode === 'image' && baseImage) {
        formData.append('image', baseImage);
      }

      console.log('🎨 Generating product shot...');

      const response = await fetch('/api/ai-image/product-shot', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API returned ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      console.log('API Success Response:', data);

      if (data.success && data.result_image) {
        setGenerationProgress(100);
        setTimeout(() => {
          setGeneratedImage(data.result_image);
          loadHistory();
        }, 500);
        
        console.log('✅ Product shot generated successfully!');
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('❌ Generation error:', error);
      setGenerationProgress(0);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('API key') || errorMessage.includes('GEMINI')) {
        alert('⚠️ API Configuration Required\n\nPlease set up your Gemini API key in the backend .env file:\nGEMINI_NANO_BANANA_API_KEY=your_key_here\n\nGet your key from: https://aistudio.google.com/apikey');
      } else {
        alert(`Generation failed: ${errorMessage}`);
      }
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 1000);
    }
  };

  const handleDownload = (imageData: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `product-shot-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8 p-8">
      {/* Left Panel - Controls */}
      <div className="lg:w-2/5 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Product Shot Generator</h2>
              <p className="text-base text-muted-foreground mt-1">Professional AI-powered product photography</p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <Card className="shadow-sm">
          <div className="p-8 space-y-6">
            <Label className="text-base font-semibold flex items-center gap-3">
              <Wand2 className="h-5 w-5 text-purple-600" />
              Generation Mode
            </Label>
            <div className="grid grid-cols-2 gap-5">
              <Button
                variant={mode === 'text' ? 'default' : 'outline'}
                onClick={() => setMode('text')}
                className="h-auto py-6 flex flex-col gap-3 transition-all"
              >
                <Sparkles className="h-6 w-6" />
                <div className="space-y-1">
                  <div className="font-semibold text-sm">Text to Image</div>
                  <div className="text-xs opacity-75">Describe your product</div>
                </div>
              </Button>
              <Button
                variant={mode === 'image' ? 'default' : 'outline'}
                onClick={() => setMode('image')}
                className="h-auto py-6 flex flex-col gap-3 transition-all"
              >
                <ImageIcon className="h-6 w-6" />
                <div className="space-y-1">
                  <div className="font-semibold text-sm">Image to Image</div>
                  <div className="text-xs opacity-75">Enhance existing photo</div>
                </div>
              </Button>
            </div>
          </div>
        </Card>

        {/* Image Upload (for image mode) */}
        {mode === 'image' && (
          <Card className="shadow-sm">
            <div className="p-8 space-y-6">
              <Label className="text-base font-semibold">Source Image</Label>
              {!baseImagePreview ? (
                <div className="border-2 border-dashed rounded-xl p-12 text-center hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-base font-semibold mb-2">Click to upload product image</p>
                    <p className="text-sm text-muted-foreground">JPG, PNG up to 10MB</p>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative h-56 rounded-xl border-2 overflow-hidden bg-gray-50 dark:bg-gray-900">
                    <Image
                      src={baseImagePreview}
                      alt="Source"
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setBaseImage(null);
                      setBaseImagePreview(null);
                    }}
                    className="w-full h-12"
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Aspect Ratio Selection */}
        <Card className="shadow-sm">
          <div className="p-8 space-y-6">
            <Label className="text-base font-semibold">Image Aspect Ratio</Label>
            <div className="grid grid-cols-3 gap-4">
              {aspectRatios.map((ratio) => {
                const Icon = ratio.icon;
                return (
                  <Button
                    key={ratio.id}
                    variant={selectedAspectRatio === ratio.id ? 'default' : 'outline'}
                    onClick={() => setSelectedAspectRatio(ratio.id)}
                    className="h-auto py-6 flex flex-col gap-2 transition-all min-h-[140px]"
                  >
                    <Icon className="h-8 w-8 flex-shrink-0" />
                    <div className="space-y-1 text-center w-full">
                      <div className="font-semibold text-sm whitespace-nowrap">{ratio.name}</div>
                      <div className="text-xs opacity-75 leading-tight px-1">{ratio.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Prompt Input */}
        <Card className="shadow-sm">
          <div className="p-8 space-y-6">
            <Label className="text-base font-semibold">
              {mode === 'text' ? 'Product Description' : 'Enhancement Instructions'}
            </Label>

            <div className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'text'
                    ? "Describe your product in detail...\n\nExample: Professional studio photograph of wireless headphones, premium leather finish, soft lighting, clean white background"
                    : "Describe how to enhance the image...\n\nExample: Improve lighting, clean background, add professional studio quality"
                }
                rows={8}
                className="resize-none text-base leading-relaxed"
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Be specific about product details, lighting, and background for best results
              </p>
            </div>
          </div>
        </Card>

        {/* Generate Button */}
        <div className="space-y-4">
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating || (mode === 'image' && !baseImage)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-16 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isGenerating ? (
              <>
                <RefreshCcw className="h-6 w-6 mr-3 animate-spin" />
                Generating... {Math.round(generationProgress)}%
              </>
            ) : (
              <>
                <Zap className="h-6 w-6 mr-3" />
                Generate Product Shot
              </>
            )}
          </Button>
          
          {isGenerating && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Result & Recent Generations */}
      <div className="lg:w-3/5 flex flex-col gap-8">
        {/* Generated Result */}
        <Card className="shadow-sm">
          <div className="p-8 flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">Generated Product</h3>
              <p className="text-base text-muted-foreground">AI-powered professional photography</p>
            </div>
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <History className="h-4 w-4" />
                  History ({history.length})
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Generation History</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                  {history.map((item) => (
                    <Card key={item.id} className="p-4 hover:border-purple-400 transition-colors cursor-pointer"
                          onClick={() => {
                            setFullViewImage(`data:image/png;base64,${item.result_data}`);
                            setIsHistoryOpen(false);
                          }}>
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded border flex-shrink-0">
                          <Image
                            src={`data:image/png;base64,${item.result_data}`}
                            alt="Product"
                            fill
                            className="object-contain p-2"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {item.platform}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2 mb-3">{item.prompt}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item.result_data);
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {history.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No generations yet</p>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="px-8 pb-8">
            <div className="relative rounded-lg border overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 h-[400px]">
            {generatedImage ? (
              <div className="relative w-full h-full">
                <Image
                  src={`data:image/png;base64,${generatedImage}`}
                  alt="Generated Product"
                  fill
                  className="object-contain p-4"
                  unoptimized
                  priority
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-500 text-white">
                    ✨ AI Generated
                  </Badge>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-white/95 hover:bg-white dark:bg-gray-800/95 shadow-lg"
                    onClick={() => setFullViewImage(`data:image/png;base64,${generatedImage}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-white/95 hover:bg-white dark:bg-gray-800/95 shadow-lg"
                    onClick={() => handleDownload(generatedImage)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                {isGenerating ? (
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                      <Sparkles className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600" />
                    </div>
                    <p className="text-lg font-medium mb-2">Creating your product shot...</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Using Google Gemini Imagen • {Math.round(generationProgress)}% complete
                    </p>
                    <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-auto">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Ready to generate</p>
                    <p className="text-sm">Configure your settings and click Generate</p>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </Card>

        {/* Recent Generations */}
        {history.length > 0 && (
          <Card className="shadow-sm">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Recent Generations</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsHistoryOpen(true)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  View All →
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {history.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer hover:border-purple-400 transition-all"
                    onClick={() => setFullViewImage(`data:image/png;base64,${item.result_data}`)}
                  >
                    <Image
                      src={`data:image/png;base64,${item.result_data}`}
                      alt="Generated"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-xs line-clamp-2">{item.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Full View Dialog */}
      <Dialog open={!!fullViewImage} onOpenChange={() => setFullViewImage(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-2">
          <DialogHeader>
            <DialogTitle>Product Shot Preview</DialogTitle>
          </DialogHeader>
          {fullViewImage && (
            <div className="relative w-full h-[75vh] rounded-lg overflow-hidden">
              <Image
                src={fullViewImage}
                alt="Product Shot"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, Send, Download, Maximize2, Edit3, Sparkles, 
  Wand2, Palette, Layers, RotateCcw, X
} from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

// Types
type GeneratedImage = {
  id?: number;
  image_data: string;
  prompt: string;
  style?: string;
  aspect_ratio: string;
  operation?: string;
};

type Operation = 'generate' | 'edit' | 'inpaint' | 'style_transfer' | 'compose' | 'conversational';

interface Props {
  onHeaderChange?: (title: string) => void;
  mode?: 'suite' | 'logo' | 'editor' | 'realtime' | 'product' | 'vision' | 'combine';
}

export default function NanoBananaStudioPerfect({ onHeaderChange, mode = 'suite' }: Props) {
  // State
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [selectedOperation, setSelectedOperation] = useState<Operation>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [showFullView, setShowFullView] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update header dynamically
  React.useEffect(() => {
    if (!onHeaderChange) return;
    
    if (uploadedImages.length > 0) {
      onHeaderChange('Nano Banana - Edit Mode');
    } else if (generatedImage) {
      onHeaderChange('Nano Banana - Generated');
    } else {
      onHeaderChange('Nano Banana Studio');
    }
  }, [uploadedImages, generatedImage, onHeaderChange]);

  const styles = [
    { id: 'default', name: 'Default' },
    { id: 'photorealistic', name: 'Photorealistic' },
    { id: 'kawaii', name: 'Kawaii' },
    { id: 'minimalist', name: 'Minimalist' },
    { id: 'anime', name: 'Anime' },
    { id: 'comic', name: 'Comic Book' },
    { id: 'oil_painting', name: 'Oil Painting' },
    { id: 'watercolor', name: 'Watercolor' },
    { id: '3d_render', name: '3D Render' },
    { id: 'sketch', name: 'Sketch' },
    { id: 'neon', name: 'Neon Cyberpunk' },
    { id: 'sticker', name: 'Sticker' }
  ];

  const aspectRatios = [
    { id: '1:1', name: 'Square (1024x1024)' },
    { id: '16:9', name: 'Landscape (1344x768)' },
    { id: '9:16', name: 'Portrait (768x1344)' },
    { id: '4:3', name: 'Standard (1184x864)' },
    { id: '3:4', name: 'Portrait Std (864x1184)' }
  ];

  const operations = [
    { id: 'edit', name: 'Edit Image', icon: Edit3, desc: 'Add/remove elements' },
    { id: 'inpaint', name: 'Inpaint', icon: Wand2, desc: 'Edit specific parts only' },
    { id: 'style_transfer', name: 'Style Transfer', icon: Palette, desc: 'Change artistic style' },
    { id: 'compose', name: 'Compose', icon: Layers, desc: 'Combine multiple images' },
    { id: 'conversational', name: 'Continue Editing', icon: RotateCcw, desc: 'Multi-turn refinement' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    if (uploadedImages.length === 1) {
      setSelectedOperation('generate');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      let endpoint = '/api/nano-banana/generate';
      let body: any = {
        prompt,
        style: selectedStyle,
        aspect_ratio: selectedAspectRatio,
        user_id: 'default_user'
      };

      // Determine endpoint based on mode
      if (uploadedImages.length > 0) {
        switch (selectedOperation) {
          case 'edit':
            endpoint = '/api/nano-banana/edit';
            body = {
              prompt,
              image_data: uploadedImages[0].split(',')[1],
              aspect_ratio: selectedAspectRatio,
              user_id: 'default_user'
            };
            break;
          
          case 'inpaint':
            endpoint = '/api/nano-banana/inpaint';
            body = {
              prompt,
              image_data: uploadedImages[0].split(',')[1],
              aspect_ratio: selectedAspectRatio,
              user_id: 'default_user'
            };
            break;
          
          case 'style_transfer':
            endpoint = '/api/nano-banana/style-transfer';
            body = {
              prompt,
              image_data: uploadedImages[0].split(',')[1],
              aspect_ratio: selectedAspectRatio,
              user_id: 'default_user'
            };
            break;
          
          case 'compose':
            if (uploadedImages.length >= 2) {
              endpoint = '/api/nano-banana/compose';
              body = {
                prompt,
                images_data: uploadedImages.map(img => img.split(',')[1]),
                aspect_ratio: selectedAspectRatio,
                user_id: 'default_user'
              };
            }
            break;
          
          case 'conversational':
            if (generatedImage) {
              endpoint = '/api/nano-banana/conversational';
              body = {
                prompt,
                current_image_data: generatedImage.image_data,
                conversation_history: conversationHistory,
                aspect_ratio: selectedAspectRatio,
                user_id: 'default_user'
              };
            }
            break;
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.image_data) {
        const newImage: GeneratedImage = {
          id: data.image_id,
          image_data: data.image_data,
          prompt: data.prompt,
          aspect_ratio: data.aspect_ratio,
          operation: selectedOperation
        };
        
        setGeneratedImage(newImage);
        
        // Add to conversation history
        if (selectedOperation === 'conversational' || uploadedImages.length > 0) {
          setConversationHistory(prev => [...prev, data.prompt]);
        }
        
        setPrompt('');
        setError('');
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError('Backend not available. Please start the backend server first.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedImage.image_data}`;
    link.download = `nano-banana-${Date.now()}.png`;
    link.click();
  };

  const handleReEdit = () => {
    if (generatedImage) {
      const imageDataUrl = `data:image/png;base64,${generatedImage.image_data}`;
      setUploadedImages([imageDataUrl]);
      setSelectedOperation('conversational');
    }
  };

  const getOperationIcon = (op: Operation) => {
    const found = operations.find(o => o.id === op);
    return found ? found.icon : Sparkles;
  };

  const getOperationName = (op: Operation) => {
    const found = operations.find(o => o.id === op);
    return found ? found.name : 'Generate';
  };

  const shouldShowApplyButton = uploadedImages.length > 0 || (selectedOperation === 'conversational' && generatedImage);

  return (
    <div className="h-full flex bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      
      {/* Left Panel - Single Chat Interface */}
      <div className="w-96 border-r bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            
            {/* Upload Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Images
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              
              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <Image 
                        src={img} 
                        alt={`Upload ${index + 1}`} 
                        width={150} 
                        height={150} 
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeUploadedImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Operation Selection - Only when images uploaded */}
            {uploadedImages.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Operation</label>
                <Select value={selectedOperation} onValueChange={(value: Operation) => setSelectedOperation(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operations.map((op) => {
                      // Show compose only if 2+ images
                      if (op.id === 'compose' && uploadedImages.length < 2) return null;
                      // Show conversational only if we have generated image
                      if (op.id === 'conversational' && !generatedImage) return null;
                      
                      const Icon = op.icon;
                      return (
                        <SelectItem key={op.id} value={op.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{op.name}</div>
                              <div className="text-xs text-muted-foreground">{op.desc}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Style Selection - Only for generation */}
            {uploadedImages.length === 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Style
                </label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                Aspect Ratio
              </label>
              <Select value={selectedAspectRatio} onValueChange={setSelectedAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatios.map((ratio) => (
                    <SelectItem key={ratio.id} value={ratio.id}>
                      {ratio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conversation History */}
            {selectedOperation === 'conversational' && conversationHistory.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Conversation</label>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {conversationHistory.slice(-3).map((item, index) => (
                    <div key={index} className="text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      {item.substring(0, 50)}...
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Single Chat Input Area - BRANDED */}
        <div className="p-4 border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="space-y-3">
            {/* Main Prompt Input */}
            <div className="relative">
              <Textarea
                placeholder={uploadedImages.length > 0 
                  ? `Describe your ${getOperationName(selectedOperation).toLowerCase()}...`
                  : "Describe the image you want to create..."
                }
                className="min-h-[80px] max-h-[120px] pr-12 resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <Button
                size="sm"
                className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Dynamic Action Button */}
            {shouldShowApplyButton ? (
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {React.createElement(getOperationIcon(selectedOperation), { className: "h-4 w-4 mr-2" })}
                    {getOperationName(selectedOperation)}
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Generated Image */}
      <div className="flex-1 flex flex-col">
        {generatedImage ? (
          <>
            {/* Image Display */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="relative max-w-4xl max-h-full">
                <Image
                  src={`data:image/png;base64,${generatedImage.image_data}`}
                  alt={generatedImage.prompt}
                  width={1024}
                  height={1024}
                  className="rounded-lg shadow-2xl object-contain max-h-[70vh] cursor-pointer"
                  onClick={() => setShowFullView(true)}
                />
              </div>
            </div>
            
            {/* Image Actions */}
            <div className="p-4 border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div className="flex-1">
                  <p className="text-sm font-medium">{generatedImage.prompt}</p>
                  <div className="flex gap-2 mt-1">
                    {generatedImage.operation && (
                      <Badge variant="outline">{generatedImage.operation}</Badge>
                    )}
                    <Badge variant="outline">{generatedImage.aspect_ratio}</Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullView(true)}
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Full View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReEdit}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Re-edit
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ready to Create Magic?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Describe your vision and watch Nano Banana bring it to life
                </p>
                {error && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: Backend server must be running on port 8007
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full View Dialog */}
      <Dialog open={showFullView} onOpenChange={setShowFullView}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0">
          {generatedImage && (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <Image
                src={`data:image/png;base64,${generatedImage.image_data}`}
                alt={generatedImage.prompt}
                width={2048}
                height={2048}
                className="object-contain max-h-[85vh]"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => setShowFullView(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

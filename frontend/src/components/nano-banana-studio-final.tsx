"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, Send, Download, Maximize2, Edit3, Sparkles, 
  Wand2, Palette, Layers, RotateCcw, X, History, Trash2,
  FileImage, Video, Shirt, Share2, Star, Coins, Eye
} from "lucide-react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Types
type GeneratedImage = {
  id?: number;
  image_data: string;
  prompt: string;
  style?: string;
  aspect_ratio: string;
  operation?: string;
  created_at?: string;
};

type Operation = 'generate' | 'edit' | 'inpaint' | 'style_transfer' | 'compose' | 'conversational';

interface Props {
  onHeaderChange: (title: string) => void;
  initialPrompt?: string; // Added initialPrompt prop
}

export default function NanoBananaStudioFinal({ onHeaderChange, initialPrompt }: Props) {
  // State
  const [prompt, setPrompt] = useState(initialPrompt || ''); // Use initialPrompt if provided
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [selectedOperation, setSelectedOperation] = useState<Operation>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [showFullView, setShowFullView] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState('');
  const [userCredits, setUserCredits] = useState(1000); // Total credits
  const [creditsUsed, setCreditsUsed] = useState(0); // Credits used for last generation
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update header dynamically (not used since we have integrated header)
  useEffect(() => {
    // Header is now integrated in the component itself
  }, [uploadedImages, generatedImage, onHeaderChange]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Auto-generate when initial prompt is provided and not yet generated
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '' && !generatedImage && !isGenerating) {
      console.log('🍌 Auto-generating image for prompt:', initialPrompt);
      // Small delay to ensure component is fully mounted
      const timeoutId = setTimeout(() => {
        setPrompt(initialPrompt);
        handleGenerate();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [initialPrompt, generatedImage, isGenerating]);

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

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/nano-banana/history?limit=50');
      const data = await response.json();
      if (data.success) {
        setHistory(data.images || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

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
        
        // Calculate credits used (example: 10 credits per generation)
        const creditsForGeneration = 10;
        setCreditsUsed(creditsForGeneration);
        setUserCredits(prev => prev - creditsForGeneration);
        
        loadHistory(); // Refresh history
        
        // Navigate back to dashboard after successful generation
        setTimeout(() => {
          if (window.parent) {
            window.parent.postMessage({ type: 'navigate', destination: 'dashboard' }, '*');
          }
        }, 3000); // Wait 3 seconds before navigating back
        
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
    link.download = `lingo-lancers-${Date.now()}.png`;
    link.click();
  };

  const handleReEdit = () => {
    if (generatedImage) {
      const imageDataUrl = `data:image/png;base64,${generatedImage.image_data}`;
      setUploadedImages([imageDataUrl]);
      setSelectedOperation('conversational');
    }
  };

  const handleDeleteFromHistory = async (imageId: number) => {
    try {
      await fetch(`/api/nano-banana/image/${imageId}`, { method: 'DELETE' });
      loadHistory();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleLoadFromHistory = (image: GeneratedImage) => {
    setGeneratedImage(image);
    setShowHistory(false);
  };

  const handleEditFromHistory = (image: GeneratedImage) => {
    // Load image into chat for editing
    const imageDataUrl = `data:image/png;base64,${image.image_data}`;
    setUploadedImages([imageDataUrl]);
    setPrompt(image.prompt);
    setSelectedOperation('edit');
    setShowHistory(false);
  };

  const enhancePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      // Call backend API to enhance prompt using LLM
      const response = await fetch('/api/nano-banana/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          guidelines: {
            style: selectedStyle,
            operation: selectedOperation,
            aspect_ratio: selectedAspectRatio
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.enhanced_prompt) {
        setPrompt(data.enhanced_prompt);
        console.log('✨ Prompt enhanced:', data.enhanced_prompt);
      } else {
        // Fallback to basic enhancement if API fails
        const enhanced = `${prompt}, highly detailed, professional quality, vibrant colors, perfect composition, cinematic lighting, 4K resolution`;
        setPrompt(enhanced);
      }
    } catch (error) {
      console.error('❌ Prompt enhancement failed:', error);
      // Fallback enhancement
      const enhanced = `${prompt}, highly detailed, professional quality, vibrant colors, perfect composition, cinematic lighting`;
      setPrompt(enhanced);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseInFeature = (image: GeneratedImage, feature: string) => {
    // This will integrate with other features
    console.log(`Using image in ${feature}:`, image);
    // TODO: Implement integration with Blog, Video, Virtual Try-On
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
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      
      {/* Compact Branded Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white dark:bg-black backdrop-blur-sm">
        <div className="w-32">
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-green-500 to-blue-600 bg-clip-text text-transparent">
            Lingo Lancers
          </h2>
        </div>
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-green-500 to-blue-600 bg-clip-text text-transparent">
            Image Editing Studio
          </h1>
          <p className="text-xs text-muted-foreground">Powered by Nano Banana</p>
        </div>
        <div className="w-32 flex justify-end pr-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-700 cursor-pointer">
                  <Coins className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    {userCredits}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Credits Remaining: {userCredits}</p>
                {creditsUsed > 0 && <p className="text-xs">Last generation: {creditsUsed} credits</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-96 border-r bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex flex-col">
          
          {/* Action Buttons - Fixed at Top */}
          <div className="p-4 border-b space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowHistory(true)}
              >
                <History className="h-4 w-4 mr-2" />
                History
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
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              
              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Uploaded Images</label>
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
                </div>
              )}

              {/* Operation Selection */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2 px-1">
                  <label className="text-sm font-medium">Operation</label>
                  <Select value={selectedOperation} onValueChange={(value: Operation) => setSelectedOperation(value)}>
                    <SelectTrigger className="focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] z-50" position="popper" sideOffset={5}>
                      {operations.map((op) => {
                        if (op.id === 'compose' && uploadedImages.length < 2) return null;
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

              {/* Style Selection for Style Transfer */}
              {uploadedImages.length > 0 && selectedOperation === 'style_transfer' && (
                <div className="space-y-2 px-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Target Style
                  </label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className="focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] z-50" position="popper" sideOffset={5}>
                      {styles.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Inpaint Instructions */}
              {uploadedImages.length > 0 && selectedOperation === 'inpaint' && (
                <div className="space-y-2 px-1">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                      💡 Inpaint Mode
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Describe what you want to add, remove, or change in specific parts of the image. 
                      Example: "Remove the background" or "Add a blue sky"
                    </p>
                  </div>
                </div>
              )}

              {/* Style Selection */}
              {uploadedImages.length === 0 && (
                <div className="space-y-2 px-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Style
                  </label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className="focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] z-50" position="popper" sideOffset={5}>
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
              <div className="space-y-2 px-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Maximize2 className="h-4 w-4" />
                  Aspect Ratio
                </label>
                <Select value={selectedAspectRatio} onValueChange={setSelectedAspectRatio}>
                  <SelectTrigger className="focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] z-50" position="popper" sideOffset={5}>
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

          {/* Chat Input - Fixed at Bottom */}
          <div className="p-4 border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="space-y-3">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    selectedOperation === 'inpaint' 
                      ? "Describe what to add, remove, or change in the image..."
                      : selectedOperation === 'style_transfer'
                      ? "Describe how to apply the style (optional)..."
                      : uploadedImages.length > 0 
                      ? `Describe your ${getOperationName(selectedOperation).toLowerCase()}...`
                      : "Describe the image you want to create..."
                  }
                  className="min-h-[80px] max-h-[120px] pr-20 pb-10 resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                          onClick={enhancePrompt}
                          disabled={!prompt.trim() || isGenerating}
                        >
                          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enhance Your Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    size="sm"
                    className="h-8 w-8 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

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
                      Generating...
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
              <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <div className="relative max-w-4xl max-h-full group">
                  <Image
                    src={`data:image/png;base64,${generatedImage.image_data}`}
                    alt={generatedImage.prompt}
                    width={1024}
                    height={1024}
                    className="rounded-lg shadow-2xl object-contain max-h-[70vh]"
                  />
                  {/* Action Buttons Overlay */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                            onClick={handleDownload}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download Image</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                            onClick={() => setShowFullView(true)}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Full View</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                            onClick={handleReEdit}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Re-edit Image</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="max-w-full mx-auto px-6">
                  <div className="flex flex-col gap-3">
                    {/* Prompt Text - Full Width */}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                        {generatedImage.prompt}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {generatedImage.operation && (
                          <Badge variant="outline" className="text-xs">{generatedImage.operation}</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{generatedImage.aspect_ratio}</Badge>
                      </div>
                    </div>
                    
                    {/* Buttons - Bottom Right */}
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowFullView(true)}>
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Full View
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleReEdit}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Re-edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-600 via-green-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-green-500 to-blue-600 bg-clip-text text-transparent">
                    Ready to Create Magic?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Describe your vision and watch Lingo Lancers bring it to life
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Drawer */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Generation History</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-100px)] mt-4">
            <div className="grid grid-cols-2 gap-4">
              {history.map((image, index) => (
                <div key={image.id || index} className="relative group">
                  <Image
                    src={`data:image/png;base64,${image.image_data}`}
                    alt={image.prompt}
                    width={200}
                    height={200}
                    className="w-full h-40 object-cover rounded-lg cursor-pointer"
                    onClick={() => handleLoadFromHistory(image)}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="secondary" onClick={(e) => {
                              e.stopPropagation();
                              setGeneratedImage(image);
                              setShowFullView(true);
                              setShowHistory(false);
                            }}>
                              <Eye className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Full Screen</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="secondary" onClick={(e) => {
                              e.stopPropagation();
                              handleEditFromHistory(image);
                            }}>
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit in Chat</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {image.id && (
                        <Button size="sm" variant="destructive" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFromHistory(image.id!);
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => {
                        e.stopPropagation();
                        handleUseInFeature(image, 'blog');
                      }}>
                        <FileImage className="h-3 w-3 mr-1" />
                        Blog
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => {
                        e.stopPropagation();
                        handleUseInFeature(image, 'video');
                      }}>
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs mt-1 truncate">{image.prompt}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

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

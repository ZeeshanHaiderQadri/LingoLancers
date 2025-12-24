"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, Upload, Wand2, Send, Download, Trash2, History, 
  Sparkles, Image as ImageIcon, Palette, Maximize2
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

// Types
type GeneratedImage = {
  id?: number;
  image_data: string;
  prompt: string;
  style?: string;
  aspect_ratio: string;
  created_at?: string;
};

type Style = {
  id: string;
  name: string;
  description: string;
};

type AspectRatio = {
  id: string;
  name: string;
  resolution: string;
};

interface NanoBananaStudioProps {
  onClose: () => void;
  initialPrompt?: string; // Added initialPrompt prop
}

export default function NanoBananaStudio({ onClose, initialPrompt }: NanoBananaStudioProps) {
  // State
  const [prompt, setPrompt] = useState(initialPrompt || ''); // Use initialPrompt if provided
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Available options
  const [styles, setStyles] = useState<Style[]>([]);
  const [aspectRatios, setAspectRatios] = useState<AspectRatio[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load styles and aspect ratios on mount
  useEffect(() => {
    loadStyles();
    loadAspectRatios();
    loadHistory();
    
    // If initialPrompt is provided, set it and trigger generation
    if (initialPrompt) {
      console.log('🍌 Nano Banana - Setting initial prompt:', initialPrompt);
      // Optionally auto-generate if desired
      // handleGenerate();
    }
  }, [initialPrompt]);

  const loadStyles = async () => {
    try {
      const response = await fetch('/api/nano-banana/styles');
      const data = await response.json();
      if (data.success) {
        setStyles(data.styles);
      }
    } catch (error) {
      console.error('Failed to load styles:', error);
      // Fallback styles
      setStyles([
        { id: 'default', name: 'Default', description: 'No style applied' },
        { id: 'photorealistic', name: 'Photorealistic', description: 'Professional photography' },
        { id: 'kawaii', name: 'Kawaii', description: 'Cute Japanese style' },
        { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple' },
        { id: 'anime', name: 'Anime', description: 'Japanese animation' },
        { id: 'comic', name: 'Comic Book', description: 'Bold comic style' },
      ]);
    }
  };

  const loadAspectRatios = async () => {
    try {
      const response = await fetch('/api/nano-banana/aspect-ratios');
      const data = await response.json();
      if (data.success) {
        setAspectRatios(data.aspect_ratios);
      }
    } catch (error) {
      console.error('Failed to load aspect ratios:', error);
      // Fallback ratios
      setAspectRatios([
        { id: '1:1', name: 'Square', resolution: '1024x1024' },
        { id: '16:9', name: 'Landscape', resolution: '1344x768' },
        { id: '9:16', name: 'Portrait', resolution: '768x1344' },
      ]);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/nano-banana/history?limit=20');
      const data = await response.json();
      if (data.success) {
        setHistory(data.images);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    try {
      const endpoint = isEditMode && uploadedImage 
        ? '/api/nano-banana/edit'
        : '/api/nano-banana/generate';
      
      const body = isEditMode && uploadedImage
        ? {
            prompt,
            image_data: uploadedImage.split(',')[1], // Remove data:image/png;base64,
            aspect_ratio: selectedAspectRatio,
            user_id: 'default_user',
            save_to_history: true
          }
        : {
            prompt,
            style: selectedStyle,
            aspect_ratio: selectedAspectRatio,
            user_id: 'default_user',
            save_to_history: true
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success && data.image_data) {
        const newImage: GeneratedImage = {
          id: data.image_id,
          image_data: data.image_data,
          prompt: data.prompt,
          style: data.style,
          aspect_ratio: data.aspect_ratio
        };
        
        setGeneratedImage(newImage);
        loadHistory(); // Refresh history
        // Don't clear prompt so user can see what was generated
      } else {
        alert(`Generation failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate image. Please check your API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setIsEditMode(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (imageData: string, filename: string = 'nano-banana-image.png') => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageData}`;
    link.download = filename;
    link.click();
  };

  const handleDelete = async (imageId?: number) => {
    if (!imageId) return;
    
    try {
      const response = await fetch(`/api/nano-banana/image/${imageId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadHistory();
        if (generatedImage?.id === imageId) {
          setGeneratedImage(null);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const loadFromHistory = (image: GeneratedImage) => {
    setGeneratedImage(image);
    setShowHistory(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nano Banana Studio
            </h1>
            <p className="text-xs text-muted-foreground">Powered by Gemini 2.0 Flash</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-96 border-r bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Upload Image for Editing */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Image to Edit (Optional)
                </label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadedImage ? 'Change Image' : 'Upload Image'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {uploadedImage && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                    <Image src={uploadedImage} alt="Upload" fill className="object-cover" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setUploadedImage(null);
                        setIsEditMode(false);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Style Selection */}
              {!isEditMode && (
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
                          <div>
                            <div className="font-medium">{style.name}</div>
                            <div className="text-xs text-muted-foreground">{style.description}</div>
                          </div>
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
                        {ratio.name} ({ratio.resolution})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isEditMode ? 'Describe Your Edits' : 'Describe Your Image'}
                </label>
                <Textarea
                  placeholder={isEditMode 
                    ? "E.g., Add a wizard hat, change background to sunset..."
                    : "E.g., A futuristic city at sunset with flying cars..."
                  }
                  className="min-h-[120px] resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Generate Button */}
              <Button
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
                    {isEditMode ? 'Edit Image' : 'Generate Image'}
                  </>
                )}
              </Button>

              {/* Mode Badge */}
              {isEditMode && (
                <Badge variant="secondary" className="w-full justify-center">
                  Edit Mode Active
                </Badge>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Center Panel - Generated Image */}
        <div className="flex-1 flex flex-col">
          {generatedImage ? (
            <>
              <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <div className="relative max-w-4xl max-h-full">
                  <Image
                    src={`data:image/png;base64,${generatedImage.image_data}`}
                    alt={generatedImage.prompt}
                    width={1024}
                    height={1024}
                    className="rounded-lg shadow-2xl object-contain max-h-[70vh]"
                  />
                </div>
              </div>
              
              {/* Image Actions */}
              <div className="p-4 border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{generatedImage.prompt}</p>
                    <div className="flex gap-2 mt-1">
                      {generatedImage.style && (
                        <Badge variant="secondary">{generatedImage.style}</Badge>
                      )}
                      <Badge variant="outline">{generatedImage.aspect_ratio}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(generatedImage.image_data)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {generatedImage.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(generatedImage.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Ready to Create Magic?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Describe your vision and watch Nano Banana bring it to life
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - History */}
        {showHistory && (
          <div className="w-80 border-l bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Generation History</h3>
            </div>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="p-4 space-y-3">
                {history.map((image, index) => (
                  <div
                    key={image.id || index}
                    className="relative group cursor-pointer rounded-lg overflow-hidden border hover:border-purple-500 transition-colors"
                    onClick={() => loadFromHistory(image)}
                  >
                    <Image
                      src={`data:image/png;base64,${image.image_data}`}
                      alt={image.prompt}
                      width={300}
                      height={300}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-xs text-center px-2">
                        {image.prompt.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                ))}
                
                {history.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No history yet. Start creating!
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
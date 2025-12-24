"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Eye, Download, RefreshCcw, Sparkles, History, X } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type LogoStyle = 'emblem' | 'brandmark' | 'monogram' | 'lettermark' | 'abstract' | 'mascot' | 'combine';

interface GeneratedLogo {
  id: number;
  image_data: string;
  prompt: string;
  style: string;
  created_at?: string;
}

interface LogoGenerationProps {
  initialPrompt?: string; // Added initialPrompt prop
}

export default function LogoGeneration({ initialPrompt }: LogoGenerationProps) {
  const [prompt, setPrompt] = useState(initialPrompt || ''); // Use initialPrompt if provided
  const [selectedStyle, setSelectedStyle] = useState<LogoStyle>('brandmark');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState<GeneratedLogo[]>([]);
  const [historyLogos, setHistoryLogos] = useState<GeneratedLogo[]>([]);
  const [fullViewImage, setFullViewImage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const logoStyles = [
    { id: 'emblem' as LogoStyle, name: 'Emblem', desc: 'Badge or seal style' },
    { id: 'brandmark' as LogoStyle, name: 'Brand Mark / Pictorial', desc: 'Iconic symbol' },
    { id: 'monogram' as LogoStyle, name: 'Monogram', desc: 'Interlocking letters' },
    { id: 'lettermark' as LogoStyle, name: 'Letter Mark', desc: 'Typography based' },
    { id: 'abstract' as LogoStyle, name: 'Abstract / Logo Mark', desc: 'Geometric shapes' },
    { id: 'mascot' as LogoStyle, name: 'Mascot', desc: 'Character based' },
    { id: 'combine' as LogoStyle, name: 'Combine Mark', desc: 'Text + symbol' },
  ];

  // Load history from database on mount
  useEffect(() => {
    loadHistory();
    
    // If initialPrompt is provided, set it
    if (initialPrompt) {
      console.log('🎨 Logo Generation - Setting initial prompt:', initialPrompt);
      setPrompt(initialPrompt);
      // Optionally auto-generate if desired
      // handleGenerate();
    }
  }, [initialPrompt]);

  const loadHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ai-image/logo-generation/history?user_id=default_user&limit=50');
      const data = await response.json();
      if (data.success) {
        setHistoryLogos(data.logos);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedLogos([]); // Clear previous logos
    
    try {
      // Generate 4 logo variations
      const logoPromises = Array(4).fill(null).map(async () => {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('style', selectedStyle);
        formData.append('user_id', 'default_user');

        const response = await fetch('http://localhost:8000/api/ai-image/logo-generation', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Response error:', response.status, text);
          throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const data = await response.json();
        if (data.success && data.image_data) {
          return {
            id: data.id,
            image_data: data.image_data,
            prompt: prompt,
            style: selectedStyle,
            created_at: new Date().toISOString(),
          };
        }
        return null;
      });

      const results = await Promise.all(logoPromises);
      const validLogos = results.filter(logo => logo !== null) as GeneratedLogo[];
      
      if (validLogos.length > 0) {
        setGeneratedLogos(validLogos);
        loadHistory(); // Reload history
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (logo: GeneratedLogo) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${logo.image_data}`;
    link.download = `logo-${logo.style}-${Date.now()}.png`;
    link.click();
  };

  const handleRetry = async (logo: GeneratedLogo) => {
    setPrompt(logo.prompt);
    setSelectedStyle(logo.style as LogoStyle);
    await handleGenerate();
  };

  return (
    <div className="h-full flex gap-4 p-4 pb-[30px]">
      {/* Left Panel - Input */}
      <div className="w-1/2 flex flex-col">
        <Card className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent pl-[10px]">
              Logo Generation
            </h2>
            
            {/* History Button */}
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 mr-[10px] py-[3px]">
                  <History className="h-4 w-4" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold">Logo History</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-6">
                  <div className="space-y-4 pr-4">
                    {historyLogos.length === 0 ? (
                      <div className="flex items-center justify-center h-40 text-muted-foreground">
                        No history yet
                      </div>
                    ) : (
                      historyLogos.map((logo) => (
                        <Card key={logo.id} className="p-4 hover:border-purple-400 transition-colors">
                          <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded border flex-shrink-0">
                              <Image
                                src={`data:image/png;base64,${logo.image_data}`}
                                alt="Logo"
                                fill
                                className="object-contain p-2"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-purple-600 mb-2">
                                {logoStyles.find(s => s.id === logo.style)?.name}
                              </div>
                              <div className="text-sm mb-3 line-clamp-2">{logo.prompt}</div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setFullViewImage(`data:image/png;base64,${logo.image_data}`);
                                    setIsHistoryOpen(false);
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownload(logo)}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    handleRetry(logo);
                                    setIsHistoryOpen(false);
                                  }}
                                >
                                  <RefreshCcw className="h-3 w-3 mr-1" />
                                  Retry
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo Style Dropdown */}
          <div className="mb-3">
            <label className="text-sm font-semibold block mb-2 pl-[10px]">Logo Style</label>
            <Select value={selectedStyle} onValueChange={(value) => setSelectedStyle(value as LogoStyle)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {logoStyles.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    <div className="flex flex-col py-1">
                      <span className="font-semibold">{style.name}</span>
                      <span className="text-xs text-muted-foreground">{style.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Input */}
          <div className="flex flex-col flex-1 mb-3 min-h-0">
            <label className="text-sm font-semibold block mb-2 pl-[10px]">Describe Your Logo</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Modern tech company logo with blue and silver colors, minimalist design..."
              className="flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mb-[5px]"
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Logos
              </>
            )}
          </Button>
        </Card>
      </div>

      {/* Right Panel - Generated Logos */}
      <div className="w-1/2">
        <Card className="p-4 h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-3 pl-[10px]">Generated Logos</h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {[0, 1, 2, 3].map((idx) => {
              const logo = generatedLogos[idx];
              return (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900"
                >
                  {logo ? (
                    <>
                      <Image
                        src={`data:image/png;base64,${logo.image_data}`}
                        alt={`Logo ${idx + 1}`}
                        fill
                        className="object-contain p-2"
                      />
                      {/* Action Buttons */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => setFullViewImage(`data:image/png;base64,${logo.image_data}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => handleDownload(logo)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => handleRetry(logo)}
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      {isGenerating ? 'Generating...' : `Logo ${idx + 1}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Full View Dialog */}
      <Dialog open={!!fullViewImage} onOpenChange={() => setFullViewImage(null)}>
        <DialogContent className="max-w-4xl">
          {fullViewImage && (
            <div className="relative w-full h-[80vh]">
              <Image
                src={fullViewImage}
                alt="Full view"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
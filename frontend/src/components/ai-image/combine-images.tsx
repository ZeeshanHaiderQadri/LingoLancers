"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Eye, Download, Upload, History, RefreshCcw, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CombinedImage {
  id: number;
  result_data: string;
  source_images: string[];
  instructions: string;
  created_at?: string;
}

export default function CombineImages() {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [resultImage, setResultImage] = useState<string>('');
  const [isCombining, setIsCombining] = useState(false);
  const [history, setHistory] = useState<CombinedImage[]>([]);
  const [fullViewImage, setFullViewImage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ai-image/combine/history?user_id=default_user&limit=50');
      const data = await response.json();
      if (data.success) {
        setHistory(data.combinations);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      handleFilesSelect(files);
    }
  }, []);

  const handleFilesSelect = (files: File[]) => {
    setUploadedImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFilesSelect(files);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCombine = async () => {
    if (uploadedImages.length < 2 || !instructions.trim()) return;

    setIsCombining(true);
    try {
      const formData = new FormData();
      uploadedImages.forEach((file, idx) => {
        formData.append(`image_${idx}`, file);
      });
      formData.append('instructions', instructions);
      formData.append('user_id', 'default_user');
      formData.append('num_images', uploadedImages.length.toString());

      const response = await fetch('http://localhost:8000/api/ai-image/combine', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.combined_image) {
        setResultImage(data.combined_image);
        loadHistory();
      }
    } catch (error) {
      console.error('Combination failed:', error);
    } finally {
      setIsCombining(false);
    }
  };

  const handleDownload = (imageData: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `combined-${Date.now()}.png`;
    link.click();
  };

  const handleReset = () => {
    setUploadedImages([]);
    setPreviewUrls([]);
    setInstructions('');
    setResultImage('');
  };

  return (
    <div className="h-full flex gap-4 p-4 pb-[30px]">
      {/* Left Column - Upload & Chat */}
      <div className="w-[45%] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent pl-[10px]">
            Combine Images
          </h2>
          
          <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 mr-[10px] py-[3px]">
                <History className="h-4 w-4" />
                History
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle className="text-xl font-bold">Combination History</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-100px)] mt-6">
                <div className="space-y-4 pr-4">
                  {history.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                      No history yet
                    </div>
                  ) : (
                    history.map((item) => (
                      <Card key={item.id} className="p-4 hover:border-purple-400 transition-colors">
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 rounded border flex-shrink-0">
                            <Image
                              src={`data:image/png;base64,${item.result_data}`}
                              alt="Combined"
                              fill
                              className="object-contain p-2"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground mb-2">
                              {item.source_images.length} images combined
                            </div>
                            <div className="text-sm mb-3 line-clamp-2">{item.instructions}</div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setFullViewImage(`data:image/png;base64,${item.result_data}`);
                                  setIsHistoryOpen(false);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(item.result_data)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
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

        {/* Upload Area */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 pl-[10px]">Upload Images</h3>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                : 'border-gray-300 dark:border-gray-700'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              Drag & drop or click to browse
            </p>
            <input
              type="file"
              id="combine-upload"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileInput}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('combine-upload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
          </div>

          {/* Uploaded Images Grid */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded border overflow-hidden group">
                  <Image
                    src={url}
                    alt={`Upload ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Instructions Input */}
        <Card className="flex-1 p-4 flex flex-col min-h-0">
          <h3 className="text-sm font-semibold mb-3 pl-[10px]">Instructions</h3>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Describe how you want to combine these images...&#10;&#10;Examples:&#10;• Blend these images seamlessly&#10;• Place person from image 1 into background of image 2&#10;• Create a collage with all images"
            className="flex-1 resize-none mb-3"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleCombine}
              disabled={isCombining || uploadedImages.length < 2 || !instructions.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mb-[5px]"
              size="lg"
            >
              {isCombining ? (
                <>
                  <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                  Combining...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Combine
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="mb-[5px]"
              size="lg"
            >
              Reset
            </Button>
          </div>
        </Card>
      </div>

      {/* Right Column - Large Result Preview */}
      <Card className="flex-1 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold pl-[10px]">Combined Result</h3>
          {resultImage && (
            <div className="flex gap-2 mr-[10px]">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFullViewImage(`data:image/png;base64,${resultImage}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Full View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(resultImage)}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex-1 relative rounded-lg border overflow-hidden bg-gray-50 dark:bg-gray-900">
          {resultImage ? (
            <Image
              src={`data:image/png;base64,${resultImage}`}
              alt="Combined result"
              fill
              className="object-contain p-4"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              {isCombining ? (
                <>
                  <RefreshCcw className="h-12 w-12 mb-4 animate-spin text-purple-500" />
                  <p className="text-lg font-medium">Combining images...</p>
                  <p className="text-sm mt-2">This may take a moment</p>
                </>
              ) : (
                <>
                  <Sparkles className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-700" />
                  <p className="text-lg font-medium">Your combined image will appear here</p>
                  <p className="text-sm mt-2">Upload images and add instructions to get started</p>
                </>
              )}
            </div>
          )}
        </div>
      </Card>

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

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Download, Upload, History, X, RefreshCcw, Scissors, Trash2 } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProcessedImage {
  id: number;
  original_data: string;
  processed_data: string;
  filename: string;
  created_at?: string;
}

export default function RemoveBackground() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<ProcessedImage[]>([]);
  const [fullViewImage, setFullViewImage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8007';
      const response = await fetch(`${apiUrl}/api/ai-image/remove-background/history?user_id=default_user&limit=50`);
      const data = await response.json();
      if (data.success) {
        setHistory(data.images);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setProcessedImage(''); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('user_id', 'default_user');
      formData.append('prompt', 'Remove the background completely and make it transparent');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8007';
      const response = await fetch(`${apiUrl}/api/ai-image/remove-background`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.processed_image) {
        setProcessedImage(data.processed_image);
        loadHistory(); // Reload history
        setError(null);
      } else {
        setError(data.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Background removal failed:', error);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteHistoryItem = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8007';
      const response = await fetch(`${apiUrl}/api/ai-image/remove-background/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        loadHistory(); // Reload history after deletion
      }
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  };

  const handleDownload = (imageData: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `${filename}-no-bg.png`;
    link.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setProcessedImage('');
  };

  return (
    <div className="h-full flex gap-4 p-4 pb-[30px]">
      {/* Left Panel - Upload & Original */}
      <div className="w-1/2 flex flex-col">
        <Card className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent pl-[10px]">
              Remove Background
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
                  <SheetTitle className="text-xl font-bold">Processing History</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-6">
                  <div className="grid grid-cols-2 gap-4 pr-4">
                    {history.length === 0 ? (
                      <div className="col-span-2 flex items-center justify-center h-40 text-muted-foreground">
                        No history yet
                      </div>
                    ) : (
                      history.map((item) => (
                        <Card key={item.id} className="group relative overflow-hidden hover:border-purple-400 transition-colors">
                          <div className="relative aspect-square">
                            <Image
                              src={`data:image/png;base64,${item.processed_data}`}
                              alt="Processed"
                              fill
                              className="object-contain p-4"
                            />
                            {/* Hover Overlay with Actions */}
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                size="icon"
                                variant="secondary"
                                onClick={() => {
                                  setFullViewImage(`data:image/png;base64,${item.processed_data}`);
                                  setIsHistoryOpen(false);
                                }}
                                title="Full View"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="secondary"
                                onClick={() => handleDownload(item.processed_data, item.filename)}
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleDeleteHistoryItem(item.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-2 border-t">
                            <div className="text-xs font-medium truncate">{item.filename}</div>
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
          {!previewUrl ? (
            <div
              className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors ${
                dragActive
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Image</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center px-4">
                Drag and drop your image here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supported formats: JPG, PNG, WEBP
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileInput}
              />
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mb-[5px]"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold pl-[10px]">Original Image</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="flex-1 relative rounded-lg border overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="max-w-full max-h-full object-contain p-4"
                  />
                )}
              </div>

              <Button
                onClick={handleRemoveBackground}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mt-3 mb-[5px]"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                    Removing Background...
                  </>
                ) : (
                  <>
                    <Scissors className="mr-2 h-5 w-5" />
                    Remove Background
                  </>
                )}
              </Button>

              {error && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Right Panel - Result */}
      <div className="w-1/2">
        <Card className="p-4 h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-3 pl-[10px]">Result</h3>
          <div className="flex-1 relative rounded-lg border overflow-hidden bg-gray-50 dark:bg-gray-900">
            {processedImage ? (
              <>
                <Image
                  src={`data:image/png;base64,${processedImage}`}
                  alt="Processed"
                  fill
                  className="object-contain p-4"
                />
                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setFullViewImage(`data:image/png;base64,${processedImage}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleDownload(processedImage, selectedFile?.name || 'image')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {isProcessing ? 'Processing...' : 'Processed image will appear here'}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Full View Dialog */}
      <Dialog open={!!fullViewImage} onOpenChange={() => setFullViewImage(null)}>
        <DialogContent className="max-w-4xl" aria-describedby="full-view-description">
          <span id="full-view-description" className="sr-only">
            Full size preview of the processed image
          </span>
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

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Download, Upload, History, RefreshCcw, Sparkles } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnalysisResult {
  objects: string[];
  scene: string;
  colors: string[];
  tags: string[];
  estimatedValue?: string;
}

interface AnalyzedImage {
  id: number;
  image_data: string;
  analysis: AnalysisResult;
  filename: string;
  created_at?: string;
}

export default function Vision() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<AnalyzedImage[]>([]);
  const [fullViewImage, setFullViewImage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ai-image/vision/history?user_id=default_user&limit=50');
      const data = await response.json();
      if (data.success) {
        setHistory(data.analyses);
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
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('user_id', 'default_user');

      const response = await fetch('http://localhost:8000/api/ai-image/vision/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        loadHistory();
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setAnalysis(null);
  };

  return (
    <div className="h-full flex gap-4 p-4 pb-[30px]">
      {/* Left Panel - Image Upload */}
      <div className="w-1/2 flex flex-col">
        <Card className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent pl-[10px]">
              AI Vision
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
                  <SheetTitle className="text-xl font-bold">Analysis History</SheetTitle>
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
                                src={`data:image/png;base64,${item.image_data}`}
                                alt="Analyzed"
                                fill
                                className="object-contain p-2"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold mb-2">{item.filename}</div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {item.analysis.scene}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setFullViewImage(`data:image/png;base64,${item.image_data}`);
                                  setIsHistoryOpen(false);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
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
              <h3 className="text-lg font-semibold mb-2">Upload Image to Analyze</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center px-4">
                Drag and drop your image here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supported: JPG, PNG, WEBP, GIF, BMP
              </p>
              <input
                type="file"
                id="vision-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileInput}
              />
              <Button
                onClick={() => document.getElementById('vision-upload')?.click()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mb-[5px]"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 relative rounded-lg border overflow-hidden bg-gray-50 dark:bg-gray-900 mb-3 flex items-center justify-center">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="To analyze"
                    className="max-w-full max-h-full object-contain p-4"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mb-[5px]"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Analyze Image
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
            </div>
          )}
        </Card>
      </div>

      {/* Right Panel - Analysis Results */}
      <div className="w-1/2">
        <Card className="p-4 h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-3 pl-[10px]">Analysis Results</h3>
          {analysis ? (
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                {/* Scene Description */}
                <Card className="p-4 border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold mb-2 text-purple-600">Scene Description</h4>
                  <p className="text-sm">{analysis.scene}</p>
                </Card>

                {/* Detected Objects */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Detected Objects</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.objects.map((obj, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                </Card>

                {/* Color Palette */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Color Palette</h4>
                  <div className="flex gap-2">
                    {analysis.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </Card>

                {/* Suggested Tags */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Suggested Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </Card>

                {/* Estimated Value */}
                {analysis.estimatedValue && (
                  <Card className="p-4 border-green-200 dark:border-green-800">
                    <h4 className="font-semibold mb-2 text-green-600">Estimated Value</h4>
                    <p className="text-2xl font-bold">{analysis.estimatedValue}</p>
                  </Card>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center flex-1 text-muted-foreground">
              {isAnalyzing ? 'Analyzing image...' : 'Analysis results will appear here'}
            </div>
          )}
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

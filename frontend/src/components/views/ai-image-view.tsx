"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogoGeneration from '@/components/ai-image/logo-generation';
import RemoveBackground from '@/components/ai-image/remove-background';
import ProductShot from '@/components/ai-image/product-shot';
import Vision from '@/components/ai-image/vision';
import CombineImages from '@/components/ai-image/combine-images';
// Removed NanoBananaStudio import
import { Palette, Image as ImageIcon, Wand2, ShoppingBag, Eye, Combine } from 'lucide-react'; // Removed Banana icon

interface AiImageViewProps {
  initialTab?: string;
}

export default function AiImageView({ initialTab }: AiImageViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab || 'logo');
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null); // State for initial prompt

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Check for navigation data when component mounts
  useEffect(() => {
    const checkNavigationData = () => {
      try {
        const storedData = sessionStorage.getItem('lingo_navigation_data');
        if (storedData) {
          const data = JSON.parse(storedData);
          console.log('🔍 AI Image View - Navigation data found:', data);
          
          // If there's a prompt, set it
          if (data.prompt) {
            console.log('🎯 Setting initial prompt:', data.prompt);
            setInitialPrompt(data.prompt);
          }
          
          // If there's a tab, set it as active
          if (data.tab) {
            console.log('🔖 Setting initial tab:', data.tab);
            setActiveTab(data.tab);
          }
          
          // Clear the stored data after processing
          sessionStorage.removeItem('lingo_navigation_data');
        }
      } catch (error) {
        console.error('Error processing navigation data:', error);
      }
    };

    // Small delay to ensure component is mounted
    const timeoutId = setTimeout(checkNavigationData, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="h-full flex flex-col p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-5 mb-6"> {/* Changed back to 5 columns */}
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Logo</span>
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">Remove Background</span>
          </TabsTrigger>
          <TabsTrigger value="product" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Product</span>
          </TabsTrigger>
          <TabsTrigger value="vision" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Vision</span>
          </TabsTrigger>
          <TabsTrigger value="combine" className="flex items-center gap-2">
            <Combine className="h-4 w-4" />
            <span className="hidden sm:inline">Combine</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="flex-1 mt-0">
          <LogoGeneration initialPrompt={initialPrompt || undefined} />
        </TabsContent>

        <TabsContent value="editor" className="flex-1 mt-0">
          <RemoveBackground />
        </TabsContent>

        <TabsContent value="product" className="flex-1 mt-0">
          <ProductShot />
        </TabsContent>

        <TabsContent value="vision" className="flex-1 mt-0">
          <Vision />
        </TabsContent>

        <TabsContent value="combine" className="flex-1 mt-0">
          <CombineImages />
        </TabsContent>
      </Tabs>
    </div>
  );
}
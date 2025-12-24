"use client";

import React, { useEffect, useState } from 'react';
import NanoBananaStudioFinal from '@/components/nano-banana-studio-final';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageEditingDashboardProps {
  onClose: () => void;
  initialPrompt?: string; // Add initialPrompt prop
}

export default function ImageEditingDashboard({ onClose, initialPrompt }: ImageEditingDashboardProps) {
  const [prompt, setPrompt] = useState<string | undefined>(initialPrompt);

  useEffect(() => {
    // Check for navigation data when component mounts
    const checkNavigationData = () => {
      try {
        const storedData = sessionStorage.getItem('lingo_navigation_data');
        if (storedData) {
          const data = JSON.parse(storedData);
          console.log('🔍 Image Editing Dashboard - Navigation data found:', data);
          
          // If there's a prompt, set it
          if (data.prompt) {
            console.log('🎯 Setting initial prompt:', data.prompt);
            setPrompt(data.prompt);
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

  useEffect(() => {
    console.log('🖼️ Image Editing Dashboard - Prompt updated:', prompt);
  }, [prompt]);

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Close button only - no duplicate header */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 z-50"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Nano Banana Studio with integrated header */}
      <div className="h-full">
        <NanoBananaStudioFinal 
          onHeaderChange={() => {}} // No-op since we have integrated header
          initialPrompt={prompt} // Pass initial prompt
        />
      </div>
    </div>
  );
}
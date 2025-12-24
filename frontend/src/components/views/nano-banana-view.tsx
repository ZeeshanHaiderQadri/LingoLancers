"use client";

import React, { useEffect, useState } from 'react';
import ImageEditingDashboard from '@/components/image-editing-dashboard';
import { useRouter } from 'next/navigation';

interface NanoBananaViewProps {
  initialPrompt?: string;
}

export default function NanoBananaView({ initialPrompt }: NanoBananaViewProps) {
  const [prompt, setPrompt] = useState<string | undefined>(initialPrompt);
  const router = useRouter();

  useEffect(() => {
    // Check for navigation data when component mounts
    const checkNavigationData = () => {
      try {
        const storedData = sessionStorage.getItem('lingo_navigation_data');
        if (storedData) {
          const data = JSON.parse(storedData);
          console.log('🔍 Nano Banana View - Navigation data found:', data);
          
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
    console.log('🍌 Nano Banana View - Prompt updated:', prompt);
  }, [prompt]);

  const handleClose = () => {
    // Navigate back to the dashboard
    router.push('/');
  };

  return (
    <div className="h-full">
      <ImageEditingDashboard onClose={handleClose} initialPrompt={prompt} />
    </div>
  );
}
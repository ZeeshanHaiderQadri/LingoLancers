"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatbotTrainingTab from './chatbot-training-tab';
import OnboardingTab from './onboarding-tab';
import AnnouncementsTab from './announcements-tab';
import LiveCustomizerTab from './live-customizer-tab';

export default function ChatbotManagementTab() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Chatbot Management</h2>
        <p className="text-muted-foreground">
          Configure and manage your AI chatbot settings, training, and interactions
        </p>
      </div>
      
      <Tabs defaultValue="training" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="live-customizer">Live Customizer</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-auto mt-4">
          <TabsContent value="training" className="h-full m-0">
            <ChatbotTrainingTab />
          </TabsContent>
          
          <TabsContent value="onboarding" className="h-full m-0">
            <OnboardingTab />
          </TabsContent>
          
          <TabsContent value="announcements" className="h-full m-0">
            <AnnouncementsTab />
          </TabsContent>
          
          <TabsContent value="live-customizer" className="h-full m-0">
            <LiveCustomizerTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
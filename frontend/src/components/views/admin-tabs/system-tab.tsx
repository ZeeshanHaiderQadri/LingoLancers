"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SiteHealthTab from './site-health-tab';
import UpdateTab from './update-tab';

export default function SystemTab() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System</h2>
        <p className="text-muted-foreground">
          Monitor system health and manage updates
        </p>
      </div>
      
      <Tabs defaultValue="health" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="health">Site Health</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-auto mt-4">
          <TabsContent value="health" className="h-full m-0">
            <SiteHealthTab />
          </TabsContent>
          
          <TabsContent value="updates" className="h-full m-0">
            <UpdateTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
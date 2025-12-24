"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlogTab from './blog-tab';
import EmailTemplatesTab from './email-templates-tab';

export default function ContentManagementTab() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
        <p className="text-muted-foreground">
          Manage blog posts, email templates, and other content
        </p>
      </div>
      
      <Tabs defaultValue="blog" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blog">Blog Management</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-auto mt-4">
          <TabsContent value="blog" className="h-full m-0">
            <BlogTab />
          </TabsContent>
          
          <TabsContent value="email" className="h-full m-0">
            <EmailTemplatesTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
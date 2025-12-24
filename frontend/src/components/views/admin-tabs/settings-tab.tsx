"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FrontendTab from './frontend-tab';
import PaymentGatewaysTab from './payment-gateways-tab';
import BlogTab from './blog-tab';
import EmailTemplatesTab from './email-templates-tab';
import SiteHealthTab from './site-health-tab';

export default function SettingsManagementTab() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings Management</h2>
        <p className="text-muted-foreground">
          Configure and manage your application settings, payments, and system health
        </p>
      </div>
      
      <Tabs defaultValue="frontend" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="frontend">Frontend</TabsTrigger>
          <TabsTrigger value="payment">Payment Gateways</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="health">Site Health</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-auto mt-4">
          <TabsContent value="frontend" className="h-full m-0">
            <FrontendTab />
          </TabsContent>
          
          <TabsContent value="payment" className="h-full m-0">
            <PaymentGatewaysTab />
          </TabsContent>
          
          <TabsContent value="blog" className="h-full m-0">
            <BlogTab />
          </TabsContent>
          
          <TabsContent value="email" className="h-full m-0">
            <EmailTemplatesTab />
          </TabsContent>
          
          <TabsContent value="health" className="h-full m-0">
            <SiteHealthTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
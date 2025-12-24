"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarketersTab from './marketers-tab';
import MailchimpTab from './mailchimp-tab';
import HubspotTab from './hubspot-tab';

export default function MarketingTab() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Marketing</h2>
        <p className="text-muted-foreground">
          Manage marketing campaigns and integrations
        </p>
      </div>
      
      <Tabs defaultValue="campaigns" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="mailchimp">Mailchimp</TabsTrigger>
          <TabsTrigger value="hubspot">Hubspot</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-auto mt-4">
          <TabsContent value="campaigns" className="h-full m-0">
            <MarketersTab />
          </TabsContent>
          
          <TabsContent value="mailchimp" className="h-full m-0">
            <MailchimpTab />
          </TabsContent>
          
          <TabsContent value="hubspot" className="h-full m-0">
            <HubspotTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
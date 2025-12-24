"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MailchimpTab from './mailchimp-tab';
import HubspotTab from './hubspot-tab';
import AdsenseTab from './adsense-tab';

export default function IntegrationsTab() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations</h2>
        <p className="text-muted-foreground">
          Manage third-party service integrations
        </p>
      </div>
      
      <Tabs defaultValue="mailchimp" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mailchimp">Mailchimp</TabsTrigger>
          <TabsTrigger value="hubspot">Hubspot</TabsTrigger>
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-auto mt-4">
          <TabsContent value="mailchimp" className="h-full m-0">
            <MailchimpTab />
          </TabsContent>
          
          <TabsContent value="hubspot" className="h-full m-0">
            <HubspotTab />
          </TabsContent>
          
          <TabsContent value="adsense" className="h-full m-0">
            <AdsenseTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
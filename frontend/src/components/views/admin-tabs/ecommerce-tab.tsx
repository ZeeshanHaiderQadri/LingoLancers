"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentGatewaysTab from './payment-gateways-tab';
import AffiliatesTab from './affiliates-tab';
import CouponsTab from './coupons-tab';
import DiscountManagerTab from './discount-manager-tab';

export default function EcommerceTab() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">E-commerce</h2>
        <p className="text-muted-foreground">
          Manage payments, affiliates, coupons, and discounts
        </p>
      </div>
      
      <Tabs defaultValue="payments" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payments">Payment Gateways</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="discounts">Discount Manager</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-auto mt-4">
          <TabsContent value="payments" className="h-full m-0">
            <PaymentGatewaysTab />
          </TabsContent>
          
          <TabsContent value="affiliates" className="h-full m-0">
            <AffiliatesTab />
          </TabsContent>
          
          <TabsContent value="coupons" className="h-full m-0">
            <CouponsTab />
          </TabsContent>
          
          <TabsContent value="discounts" className="h-full m-0">
            <DiscountManagerTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
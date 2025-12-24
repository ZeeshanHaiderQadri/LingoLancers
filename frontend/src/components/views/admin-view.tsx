"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Bot, 
  FileText, 
  ShoppingCart,
  Palette,
  Code,
  CreditCard,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Menu,
  Book,
  Mail,
  Link,
  HeartHandshake,
  KeyRound,
  Monitor,
  Workflow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardTab from './admin-tabs/dashboard-tab';
import MarketplaceTab from './admin-tabs/marketplace-tab';
import ThemesTab from './admin-tabs/themes-tab';
import UserManagementTab from './admin-tabs/user-management-tab'; // Import the new component
import TeamManagementTab from './admin-tabs/team-management-tab'; // Import the new component
import ChatbotManagementTab from './admin-tabs/chatbot-tab'; // Import the new component
import ContentManagementTab from './admin-tabs/content-management-tab'; // Import the new component
import EcommerceTab from './admin-tabs/ecommerce-tab'; // Import the new component
import MarketingTab from './admin-tabs/marketing-tab'; // Import the new component
import SystemTab from './admin-tabs/system-tab'; // Import the new component
import IntegrationsTab from './admin-tabs/integrations-tab'; // Import the new component
import ToolsManagement from '../admin/tools-management'; // Import the new component

interface AdminViewProps {
  initialTab?: string;
  navigate?: (view: string, subView?: string) => void;
}

export default function AdminView({ initialTab = 'dashboard', navigate }: AdminViewProps) {
  // Map subView values to tab values
  const subViewToTabMap: Record<string, string> = {
    'dashboard': 'dashboard',
    'marketplace': 'marketplace',
    'themes': 'themes',
    'tools': 'tools',
    'users-list': 'users',
    'user-activity': 'users',
    'user-dashboard': 'users',
    'deletion-requests': 'users',
    'permissions': 'users',
    'team-members': 'team',
    'developers': 'team',
    'marketers': 'team',
    'support': 'team',
    'team-roles': 'team',
    'chatbot-training': 'chatbot',
    'onboarding': 'chatbot',
    'announcements': 'chatbot',
    'live-customizer': 'chatbot',
    'chat-categories': 'chatbot',
    'chat-templates': 'chatbot',
    'assistant-training': 'chatbot',
    'voice-chatbot-training': 'chatbot',
    'floating-chat-settings': 'chatbot',
    'blog': 'content',
    'email-templates': 'content',
    'payment-gateways': 'ecommerce',
    'affiliates': 'ecommerce',
    'coupons': 'ecommerce',
    'discount-manager': 'ecommerce',
    'campaigns': 'marketing',
    'mailchimp': 'marketing',
    'hubspot': 'marketing',
    'site-health': 'system',
    'update': 'system',
    'adsense': 'integrations',
    'mega-menu': 'integrations'
  };
  
  // Determine the initial active tab based on subView if provided
  const initialActiveTab = subViewToTabMap[initialTab] || initialTab || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // If navigate function is provided, call it
    if (navigate) {
      // Map tab values to appropriate navigation paths
      const tabToViewMap: Record<string, string> = {
        'dashboard': 'dashboard',
        'marketplace': 'marketplace',
        'themes': 'themes',
        'tools': 'tools',
        'users': 'users',
        'team': 'team',
        'chatbot': 'chatbot',
        'content': 'content',
        'ecommerce': 'ecommerce',
        'marketing': 'marketing',
        'system': 'system',
        'integrations': 'integrations'
      };
      
      const view = tabToViewMap[value] || 'dashboard';
      navigate('admin', view);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-12 gap-2 h-auto flex-wrap">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Marketplace</span>
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Themes</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Tools & MCP</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">User Management</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team Management</span>
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Chatbot</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="ecommerce" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">E-commerce</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Marketing</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="dashboard" className="h-full m-0">
              <DashboardTab />
            </TabsContent>
            
            <TabsContent value="marketplace" className="h-full m-0">
              <MarketplaceTab />
            </TabsContent>
            
            <TabsContent value="themes" className="h-full m-0">
              <ThemesTab />
            </TabsContent>
            
            <TabsContent value="tools" className="h-full m-0">
              <ToolsManagement />
            </TabsContent>
            
            <TabsContent value="users" className="h-full m-0">
              <UserManagementTab />
            </TabsContent>
            
            <TabsContent value="team" className="h-full m-0">
              <TeamManagementTab />
            </TabsContent>
            
            <TabsContent value="chatbot" className="h-full m-0">
              <ChatbotManagementTab />
            </TabsContent>
            
            <TabsContent value="content" className="h-full m-0">
              <ContentManagementTab />
            </TabsContent>
            
            <TabsContent value="ecommerce" className="h-full m-0">
              <EcommerceTab />
            </TabsContent>
            
            <TabsContent value="marketing" className="h-full m-0">
              <MarketingTab />
            </TabsContent>
            
            <TabsContent value="system" className="h-full m-0">
              <SystemTab />
            </TabsContent>
            
            <TabsContent value="integrations" className="h-full m-0">
              <IntegrationsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeamMembersTab from './team-members-tab';
import DevelopersTab from './developers-tab';
import MarketersTab from './marketers-tab';
import SupportTab from './support-tab';
import TeamRolesTab from './team-roles-tab';

export default function TeamManagementTab() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
        <p className="text-muted-foreground">
          Manage team members, roles, and department-specific settings
        </p>
      </div>
      
      <Tabs defaultValue="members" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="members">All Team Members</TabsTrigger>
          <TabsTrigger value="developers">Developers</TabsTrigger>
          <TabsTrigger value="marketers">Marketers</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-auto mt-4">
          <TabsContent value="members" className="h-full m-0">
            <TeamMembersTab />
          </TabsContent>
          
          <TabsContent value="developers" className="h-full m-0">
            <DevelopersTab />
          </TabsContent>
          
          <TabsContent value="marketers" className="h-full m-0">
            <MarketersTab />
          </TabsContent>
          
          <TabsContent value="support" className="h-full m-0">
            <SupportTab />
          </TabsContent>
          
          <TabsContent value="roles" className="h-full m-0">
            <TeamRolesTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsersListTab from './users-list-tab';
import UserActivityTab from './user-activity-tab';
import UserDashboardTab from './user-dashboard-tab';
import DeletionRequestsTab from './deletion-requests-tab';
import PermissionsTab from './permissions-tab';

export default function UserManagementTab() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage all users, their activities, permissions, and account settings
        </p>
      </div>
      
      <Tabs defaultValue="list" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="list">Users List</TabsTrigger>
          <TabsTrigger value="activity">User Activities</TabsTrigger>
          <TabsTrigger value="dashboard">User Dashboard</TabsTrigger>
          <TabsTrigger value="deletion">Deletion Requests</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-auto mt-4">
          <TabsContent value="list" className="h-full m-0">
            <UsersListTab />
          </TabsContent>
          
          <TabsContent value="activity" className="h-full m-0">
            <UserActivityTab />
          </TabsContent>
          
          <TabsContent value="dashboard" className="h-full m-0">
            <UserDashboardTab />
          </TabsContent>
          
          <TabsContent value="deletion" className="h-full m-0">
            <DeletionRequestsTab />
          </TabsContent>
          
          <TabsContent value="permissions" className="h-full m-0">
            <PermissionsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
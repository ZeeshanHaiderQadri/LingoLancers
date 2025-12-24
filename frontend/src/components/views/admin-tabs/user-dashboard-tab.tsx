"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Settings, 
  Shield, 
  Bell,
  Key,
  CreditCard,
  Globe,
  Mail,
  Phone,
  CalendarDays,
  Clock3
} from 'lucide-react';

const UserDashboardTab = () => {
  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
    joinDate: 'January 15, 2023',
    lastLogin: 'June 15, 2023 14:30:22',
    avatar: '',
  };

  // Mock user stats
  const stats = [
    { label: 'Agents Created', value: '24' },
    { label: 'Workflows Run', value: '189' },
    { label: 'Content Generated', value: '1.2K' },
    { label: 'Team Members', value: '8' },
  ];

  // Mock recent activity
  const recentActivity = [
    { id: 1, action: 'Created new agent', target: 'Content Writer Pro', time: '2 hours ago' },
    { id: 2, action: 'Updated workflow', target: 'Social Media Campaign', time: '1 day ago' },
    { id: 3, action: 'Added team member', target: 'Sarah Wilson', time: '2 days ago' },
    { id: 4, action: 'Published blog post', target: 'AI Trends 2023', time: '3 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Manage your personal information and account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge className="mt-2">{user.role}</Badge>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-sm">
                <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                <span>San Francisco, CA</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground mr-2" />
                <span>Joined {user.joinDate}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock3 className="h-4 w-4 text-muted-foreground mr-2" />
                <span>Last login {user.lastLogin}</span>
              </div>
              <div className="flex items-center text-sm">
                <Shield className="h-4 w-4 text-muted-foreground mr-2" />
                <span>2FA Enabled</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline">
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Account Settings */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Two-factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your account
                </p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Privacy Settings</p>
                <p className="text-sm text-muted-foreground">
                  Control how your data is used
                </p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 mr-3" />
                  <div>
                    <p className="text-sm font-medium">
                      {activity.action} <span className="font-normal">"{activity.target}"</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardTab;
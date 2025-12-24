"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Bot, 
  FileText, 
  ShoppingCart,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';

const DashboardTab = () => {
  // Mock data for dashboard
  const stats = [
    { title: 'Total Users', value: '1,234', change: '+12%', icon: Users },
    { title: 'Active Agents', value: '24', change: '+3%', icon: Bot },
    { title: 'Content Generated', value: '1,892', change: '+18%', icon: FileText },
    { title: 'Marketplace Items', value: '156', change: '+5%', icon: ShoppingCart },
  ];

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Created new agent', time: '2 minutes ago', status: 'completed' },
    { id: 2, user: 'Jane Smith', action: 'Published blog post', time: '15 minutes ago', status: 'completed' },
    { id: 3, user: 'Mike Johnson', action: 'Updated workflow', time: '1 hour ago', status: 'pending' },
    { id: 4, user: 'Sarah Wilson', action: 'Added new tool', time: '3 hours ago', status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here you can monitor system activity and manage your platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions performed on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <div className="flex-shrink-0">
                    {activity.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action} • {activity.time}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Badge 
                      variant={activity.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current platform performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">API Response Time</span>
                </div>
                <span className="text-sm font-medium">124ms</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">Success Rate</span>
                </div>
                <span className="text-sm font-medium">99.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">Active Users</span>
                </div>
                <span className="text-sm font-medium">243</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bot className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">Running Agents</span>
                </div>
                <span className="text-sm font-medium">18</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardTab;
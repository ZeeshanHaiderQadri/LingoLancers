"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  User, 
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const UserActivityTab = () => {
  // Mock data for user activities
  const activities = [
    {
      id: 1,
      user: 'John Doe',
      action: 'Created new agent',
      resource: 'Content Writer Pro',
      timestamp: '2023-06-15 14:30:22',
      ip: '192.168.1.100',
      status: 'success',
    },
    {
      id: 2,
      user: 'Jane Smith',
      action: 'Updated workflow',
      resource: 'Social Media Campaign',
      timestamp: '2023-06-15 13:45:10',
      ip: '192.168.1.105',
      status: 'success',
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'Failed login attempt',
      resource: 'Admin Panel',
      timestamp: '2023-06-15 12:20:05',
      ip: '192.168.1.200',
      status: 'failed',
    },
    {
      id: 4,
      user: 'Sarah Wilson',
      action: 'Published blog post',
      resource: 'AI Trends 2023',
      timestamp: '2023-06-15 11:15:33',
      ip: '192.168.1.110',
      status: 'success',
    },
    {
      id: 5,
      user: 'David Brown',
      action: 'Downloaded template',
      resource: 'Marketing Template Pack',
      timestamp: '2023-06-15 10:05:47',
      ip: '192.168.1.115',
      status: 'success',
    },
    {
      id: 6,
      user: 'Alex Turner',
      action: 'Deleted agent',
      resource: 'Old Data Analyzer',
      timestamp: '2023-06-15 09:30:12',
      ip: '192.168.1.120',
      status: 'success',
    },
    {
      id: 7,
      user: 'Lisa Anderson',
      action: 'Suspicious activity detected',
      resource: 'User Account',
      timestamp: '2023-06-15 08:45:29',
      ip: '10.0.0.50',
      status: 'warning',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Activity</h2>
          <p className="text-muted-foreground">
            Monitor user actions and system events
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">
              +12% from last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Actions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,189</div>
            <p className="text-xs text-muted-foreground">
              +8% from last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">59</div>
            <p className="text-xs text-muted-foreground">
              +23% from last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Detailed log of user actions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {activity.user}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{activity.action}</TableCell>
                  <TableCell>{activity.resource}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                      {activity.timestamp}
                    </div>
                  </TableCell>
                  <TableCell>{activity.ip}</TableCell>
                  <TableCell>
                    {activity.status === 'success' ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                    ) : activity.status === 'failed' ? (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Warning
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserActivityTab;
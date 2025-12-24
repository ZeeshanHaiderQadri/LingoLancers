"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  User,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SupportRequestsTab = () => {
  // Mock data for support requests
  const [requests, setRequests] = useState([
    {
      id: 1,
      subject: 'Unable to access dashboard',
      user: 'John Doe',
      email: 'john.doe@example.com',
      priority: 'High',
      status: 'Open',
      category: 'Technical',
      createdAt: '2023-06-15 14:30:22',
      lastUpdate: '2023-06-15 15:45:10',
      assignedTo: 'Sarah Wilson',
    },
    {
      id: 2,
      subject: 'API key not working',
      user: 'Jane Smith',
      email: 'jane.smith@example.com',
      priority: 'Medium',
      status: 'In Progress',
      category: 'API',
      createdAt: '2023-06-14 09:15:33',
      lastUpdate: '2023-06-15 11:20:45',
      assignedTo: 'Mike Johnson',
    },
    {
      id: 3,
      subject: 'Billing discrepancy',
      user: 'David Brown',
      email: 'david.brown@example.com',
      priority: 'Low',
      status: 'Resolved',
      category: 'Billing',
      createdAt: '2023-06-12 16:45:21',
      lastUpdate: '2023-06-13 10:30:15',
      assignedTo: 'Alex Turner',
    },
    {
      id: 4,
      subject: 'Feature request: Dark mode',
      user: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      priority: 'Low',
      status: 'Open',
      category: 'Feature Request',
      createdAt: '2023-06-10 11:22:33',
      lastUpdate: '2023-06-10 11:22:33',
      assignedTo: 'Unassigned',
    },
  ]);

  // Mock data for support stats
  const stats = [
    { title: 'Open Requests', value: '12', change: '+3', icon: MessageSquare },
    { title: 'Avg. Response Time', value: '2.4h', change: '-0.3h', icon: Clock },
    { title: 'Resolution Rate', value: '92%', change: '+2%', icon: CheckCircle },
    { title: 'Customer Satisfaction', value: '4.8/5', change: '+0.1', icon: User },
  ];

  const [newRequest, setNewRequest] = useState({
    subject: '',
    description: '',
    priority: 'Medium',
    category: 'General',
  });

  const handleCreateRequest = () => {
    if (!newRequest.subject || !newRequest.description) {
      // Mock validation
      return;
    }

    const request = {
      id: requests.length + 1,
      subject: newRequest.subject,
      user: 'Admin User',
      email: 'admin@company.com',
      priority: newRequest.priority,
      status: 'Open',
      category: newRequest.category,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastUpdate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      assignedTo: 'Unassigned',
    };

    setRequests([request, ...requests]);
    setNewRequest({
      subject: '',
      description: '',
      priority: 'Medium',
      category: 'General',
    });
  };

  const handleRequestAction = (requestId: number, action: string) => {
    // Mock action handler
    console.log(`Performing ${action} on request ${requestId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support Requests</h2>
          <p className="text-muted-foreground">
            Manage customer support requests and inquiries
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              className="pl-8 w-full md:w-64"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter By</DropdownMenuLabel>
              <DropdownMenuItem>Status</DropdownMenuItem>
              <DropdownMenuItem>Priority</DropdownMenuItem>
              <DropdownMenuItem>Category</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Support Stats */}
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
                  {stat.change} from last week
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Request */}
      <Card>
        <CardHeader>
          <CardTitle>Create Support Request</CardTitle>
          <CardDescription>
            Submit a new support request or issue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="request-subject">Subject</Label>
              <Input
                id="request-subject"
                placeholder="Enter request subject"
                value={newRequest.subject}
                onChange={(e) => setNewRequest({...newRequest, subject: e.target.value})}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="request-priority">Priority</Label>
                <Select 
                  value={newRequest.priority} 
                  onValueChange={(value) => setNewRequest({...newRequest, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-category">Category</Label>
                <Select 
                  value={newRequest.category} 
                  onValueChange={(value) => setNewRequest({...newRequest, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="API">API</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-description">Description</Label>
              <Textarea
                id="request-description"
                placeholder="Describe the issue or request in detail"
                rows={4}
                value={newRequest.description}
                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
              />
            </div>
            <Button onClick={handleCreateRequest}>
              <Plus className="h-4 w-4 mr-2" />
              Create Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Requests</CardTitle>
          <CardDescription>
            Track and manage customer support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="font-medium">{request.subject}</div>
                    <div className="text-sm text-muted-foreground">{request.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {request.user}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        request.priority === 'High' || request.priority === 'Urgent' ? 'destructive' : 
                        request.priority === 'Medium' ? 'default' : 
                        'secondary'
                      }
                    >
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {request.status === 'Open' ? (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {request.status}
                      </Badge>
                    ) : request.status === 'In Progress' ? (
                      <Badge variant="default">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {request.status}
                      </Badge>
                    ) : request.status === 'Resolved' ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {request.status}
                      </Badge>
                    ) : request.status === 'Escalated' ? (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {request.status}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{request.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{request.createdAt.split(' ')[0]}</div>
                      <div className="text-muted-foreground">{request.createdAt.split(' ')[1]}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{request.assignedTo}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Request Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleRequestAction(request.id, 'view')}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRequestAction(request.id, 'assign')}
                        >
                          Assign Request
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRequestAction(request.id, 'resolve')}
                        >
                          Mark as Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRequestAction(request.id, 'escalate')}
                          className="text-red-600"
                        >
                          Escalate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default SupportRequestsTab;
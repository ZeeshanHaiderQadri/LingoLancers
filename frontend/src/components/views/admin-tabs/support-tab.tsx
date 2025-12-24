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
  Users,
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

const SupportTab = () => {
  // Mock data for support tickets
  const [tickets, setTickets] = useState([
    {
      id: 1,
      subject: 'Unable to access dashboard',
      user: 'John Doe',
      email: 'john.doe@example.com',
      priority: 'High',
      status: 'Open',
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
      createdAt: '2023-06-10 11:22:33',
      lastUpdate: '2023-06-10 11:22:33',
      assignedTo: 'Unassigned',
    },
    {
      id: 5,
      subject: 'Agent not responding',
      user: 'Michael Chen',
      email: 'michael.chen@example.com',
      priority: 'High',
      status: 'Escalated',
      createdAt: '2023-06-08 14:55:44',
      lastUpdate: '2023-06-09 09:10:22',
      assignedTo: 'Support Team',
    },
  ]);

  // Mock data for support stats
  const stats = [
    { title: 'Open Tickets', value: '12', change: '+3', icon: MessageSquare },
    { title: 'Avg. Response Time', value: '2.4h', change: '-0.3h', icon: Clock },
    { title: 'Resolution Rate', value: '92%', change: '+2%', icon: CheckCircle },
    { title: 'Customer Satisfaction', value: '4.8/5', change: '+0.1', icon: User },
  ];

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'Medium',
  });

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.description) {
      // Mock validation
      return;
    }

    const ticket = {
      id: tickets.length + 1,
      subject: newTicket.subject,
      user: 'Admin User',
      email: 'admin@company.com',
      priority: newTicket.priority,
      status: 'Open',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastUpdate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      assignedTo: 'Unassigned',
    };

    setTickets([ticket, ...tickets]);
    setNewTicket({
      subject: '',
      description: '',
      priority: 'Medium',
    });
  };

  const handleTicketAction = (ticketId: number, action: string) => {
    // Mock action handler
    console.log(`Performing ${action} on ticket ${ticketId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support</h2>
          <p className="text-muted-foreground">
            Manage support tickets and customer inquiries
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
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
              <DropdownMenuItem>Assignee</DropdownMenuItem>
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

      {/* Create Ticket */}
      <Card>
        <CardHeader>
          <CardTitle>Create Support Ticket</CardTitle>
          <CardDescription>
            Submit a new support request or issue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input
                id="ticket-subject"
                placeholder="Enter ticket subject"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-priority">Priority</Label>
              <Select 
                value={newTicket.priority} 
                onValueChange={(value) => setNewTicket({...newTicket, priority: value})}
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
              <Label htmlFor="ticket-description">Description</Label>
              <Textarea
                id="ticket-description"
                placeholder="Describe the issue or request in detail"
                rows={4}
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
              />
            </div>
            <Button onClick={handleCreateTicket}>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            Track and manage customer support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="font-medium">{ticket.subject}</div>
                    <div className="text-sm text-muted-foreground">{ticket.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {ticket.user}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        ticket.priority === 'High' || ticket.priority === 'Urgent' ? 'destructive' : 
                        ticket.priority === 'Medium' ? 'default' : 
                        'secondary'
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.status === 'Open' ? (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {ticket.status}
                      </Badge>
                    ) : ticket.status === 'In Progress' ? (
                      <Badge variant="default">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {ticket.status}
                      </Badge>
                    ) : ticket.status === 'Resolved' ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {ticket.status}
                      </Badge>
                    ) : ticket.status === 'Escalated' ? (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {ticket.status}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{ticket.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{ticket.createdAt.split(' ')[0]}</div>
                      <div className="text-muted-foreground">{ticket.createdAt.split(' ')[1]}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{ticket.assignedTo}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ticket Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleTicketAction(ticket.id, 'view')}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTicketAction(ticket.id, 'assign')}
                        >
                          Assign Ticket
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleTicketAction(ticket.id, 'resolve')}
                        >
                          Mark as Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTicketAction(ticket.id, 'escalate')}
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

      {/* Support Team */}
      <Card>
        <CardHeader>
          <CardTitle>Support Team</CardTitle>
          <CardDescription>
            Current team members and their availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Sarah Wilson</h3>
                    <p className="text-sm text-muted-foreground">Level 2 Support</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Available</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Mike Johnson</h3>
                    <p className="text-sm text-muted-foreground">Technical Support</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Busy</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Alex Turner</h3>
                    <p className="text-sm text-muted-foreground">Billing Support</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Available</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Support Team</h3>
                    <p className="text-sm text-muted-foreground">Escalation Pool</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Users className="h-4 w-4 text-blue-500 mr-2" />
                  <span>3 members</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTab;
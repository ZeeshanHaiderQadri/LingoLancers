"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  User, 
  Trash2, 
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

const DeletionRequestsTab = () => {
  // Mock data for deletion requests
  const [requests, setRequests] = useState([
    {
      id: 1,
      user: 'John Doe',
      email: 'john.doe@example.com',
      requestDate: '2023-06-10 09:15:33',
      reason: 'No longer using the service',
      status: 'pending',
    },
    {
      id: 2,
      user: 'Jane Smith',
      email: 'jane.smith@example.com',
      requestDate: '2023-06-08 14:22:10',
      reason: 'Privacy concerns',
      status: 'approved',
    },
    {
      id: 3,
      user: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      requestDate: '2023-06-05 11:30:45',
      reason: 'Switching to competitor',
      status: 'rejected',
    },
    {
      id: 4,
      user: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      requestDate: '2023-06-03 16:45:21',
      reason: 'Data security concerns',
      status: 'pending',
    },
    {
      id: 5,
      user: 'David Brown',
      email: 'david.brown@example.com',
      requestDate: '2023-05-28 08:12:55',
      reason: 'Dissatisfied with service',
      status: 'pending',
    },
  ]);

  const handleRequestAction = (requestId: number, action: 'approve' | 'reject') => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' } 
        : request
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Deletion Requests</h2>
          <p className="text-muted-foreground">
            Manage user account deletion requests
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Deletion Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Requires review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Requests</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">
              +5 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deletion Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deletion Requests</CardTitle>
          <CardDescription>
            Review and process user account deletion requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {request.user}
                    </div>
                  </TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                  <TableCell>
                    {request.status === 'pending' ? (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    ) : request.status === 'approved' ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestAction(request.id, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRequestAction(request.id, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Deletion Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Deletion Policy</CardTitle>
          <CardDescription>
            Guidelines for processing deletion requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium">Review Period</h4>
                <p className="text-sm text-muted-foreground">
                  All deletion requests must be reviewed within 48 hours of submission.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium">Data Retention</h4>
                <p className="text-sm text-muted-foreground">
                  Approved deletions will be processed within 30 days. Data will be retained for legal compliance purposes.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium">Notification</h4>
                <p className="text-sm text-muted-foreground">
                  Users will receive email confirmation when their request is approved or rejected.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeletionRequestsTab;
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
  Bell, 
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  Send
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

const AnnouncementsTab = () => {
  // Mock data for announcements
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'New Feature: AI Content Generator',
      content: 'We\'re excited to announce the launch of our new AI-powered content generation tool...',
      type: 'info',
      status: 'Published',
      audience: 'All Users',
      scheduledDate: '2023-06-15',
      publishedDate: '2023-06-15',
    },
    {
      id: 2,
      title: 'Scheduled Maintenance',
      content: 'We will be performing scheduled maintenance on our servers this weekend...',
      type: 'warning',
      status: 'Scheduled',
      audience: 'All Users',
      scheduledDate: '2023-06-18',
      publishedDate: null,
    },
    {
      id: 3,
      title: 'Platform Update v2.1',
      content: 'Version 2.1 of our platform is now available with several new features and improvements...',
      type: 'success',
      status: 'Published',
      audience: 'Premium Users',
      scheduledDate: '2023-06-10',
      publishedDate: '2023-06-10',
    },
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info',
    audience: 'All Users',
    scheduledDate: '',
  });

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      // Mock validation
      return;
    }

    const announcement = {
      id: announcements.length + 1,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      type: newAnnouncement.type,
      status: newAnnouncement.scheduledDate ? 'Scheduled' : 'Published',
      audience: newAnnouncement.audience,
      scheduledDate: newAnnouncement.scheduledDate,
      publishedDate: newAnnouncement.scheduledDate ? null : new Date().toISOString().split('T')[0],
    };

    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({
      title: '',
      content: '',
      type: 'info',
      audience: 'All Users',
      scheduledDate: '',
    });
    setIsCreating(false);
  };

  const handlePublishAnnouncement = (id: number) => {
    setAnnouncements(announcements.map(announcement => 
      announcement.id === id 
        ? { 
            ...announcement, 
            status: 'Published',
            publishedDate: new Date().toISOString().split('T')[0]
          } 
        : announcement
    ));
  };

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
          <p className="text-muted-foreground">
            Create and manage platform announcements
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              className="pl-8 w-full md:w-64"
            />
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </div>
      </div>

      {/* Create Announcement Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
            <CardDescription>
              Compose and schedule a new announcement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement-title">Title</Label>
                <Input
                  id="announcement-title"
                  placeholder="Enter announcement title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-content">Content</Label>
                <Textarea
                  id="announcement-content"
                  placeholder="Enter announcement content"
                  rows={4}
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="announcement-type">Type</Label>
                  <Select 
                    value={newAnnouncement.type} 
                    onValueChange={(value) => setNewAnnouncement({...newAnnouncement, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="announcement-audience">Audience</Label>
                  <Select 
                    value={newAnnouncement.audience} 
                    onValueChange={(value) => setNewAnnouncement({...newAnnouncement, audience: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Users">All Users</SelectItem>
                      <SelectItem value="Premium Users">Premium Users</SelectItem>
                      <SelectItem value="Free Users">Free Users</SelectItem>
                      <SelectItem value="Admins">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled-date">Schedule Date (Optional)</Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={newAnnouncement.scheduledDate}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, scheduledDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateAnnouncement}>
                  <Send className="h-4 w-4 mr-2" />
                  {newAnnouncement.scheduledDate ? 'Schedule Announcement' : 'Publish Announcement'}
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Upcoming announcements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>
            Manage all platform announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell>
                    <div className="font-medium">{announcement.title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {announcement.content}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        announcement.type === 'info' ? 'default' : 
                        announcement.type === 'success' ? 'default' :
                        announcement.type === 'warning' ? 'secondary' : 
                        'destructive'
                      }
                      className={
                        announcement.type === 'success' ? 'bg-green-500' : 
                        announcement.type === 'warning' ? 'bg-yellow-500' : 
                        announcement.type === 'error' ? 'bg-red-500' : ''
                      }
                    >
                      {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{announcement.audience}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        announcement.status === 'Published' ? 'default' : 
                        announcement.status === 'Scheduled' ? 'secondary' : 
                        'outline'
                      }
                      className={
                        announcement.status === 'Published' ? 'bg-green-500' : ''
                      }
                    >
                      {announcement.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                      {announcement.scheduledDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    {announcement.publishedDate ? (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        {announcement.publishedDate}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not published</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {announcement.status === 'Scheduled' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePublishAnnouncement(announcement.id)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Publish
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default AnnouncementsTab;
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
  TrendingUp, 
  BarChart3,
  Users,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2
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

const MarketersTab = () => {
  // Mock data for campaigns
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Summer Product Launch',
      status: 'Active',
      channel: 'Email',
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      budget: 5000,
      spent: 2450,
      impressions: 125000,
      clicks: 3200,
      conversions: 85,
    },
    {
      id: 2,
      name: 'Social Media Awareness',
      status: 'Planning',
      channel: 'Social Media',
      startDate: '2023-07-01',
      endDate: '2023-09-30',
      budget: 8000,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
    },
    {
      id: 3,
      name: 'Content Marketing Drive',
      status: 'Completed',
      channel: 'Content',
      startDate: '2023-04-01',
      endDate: '2023-06-30',
      budget: 3000,
      spent: 2980,
      impressions: 89000,
      clicks: 2100,
      conversions: 120,
    },
  ]);

  // Mock data for analytics
  const analytics = [
    {
      id: 1,
      metric: 'Website Traffic',
      value: '45,231',
      change: '+12%',
      icon: TrendingUp,
    },
    {
      id: 2,
      metric: 'Conversion Rate',
      value: '3.2%',
      change: '+0.8%',
      icon: BarChart3,
    },
    {
      id: 3,
      metric: 'Email Open Rate',
      value: '24.8%',
      change: '-1.2%',
      icon: Mail,
    },
    {
      id: 4,
      metric: 'Social Engagement',
      value: '12.4K',
      change: '+8.3%',
      icon: MessageSquare,
    },
  ];

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    channel: 'Email',
    budget: '',
    startDate: '',
    endDate: '',
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.budget || !newCampaign.startDate || !newCampaign.endDate) {
      // Mock validation
      return;
    }

    const campaign = {
      id: campaigns.length + 1,
      name: newCampaign.name,
      status: 'Planning',
      channel: newCampaign.channel,
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate,
      budget: parseInt(newCampaign.budget),
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
    };

    setCampaigns([...campaigns, campaign]);
    setNewCampaign({
      name: '',
      channel: 'Email',
      budget: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketing</h2>
          <p className="text-muted-foreground">
            Manage campaigns and track marketing performance
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              className="pl-8 w-full md:w-64"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Marketing Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analytics.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.metric}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground">
                  {item.change} from last period
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Campaign */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
          <CardDescription>
            Set up a new marketing campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="Enter campaign name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-channel">Channel</Label>
              <Select 
                value={newCampaign.channel} 
                onValueChange={(value) => setNewCampaign({...newCampaign, channel: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Content">Content</SelectItem>
                  <SelectItem value="PPC">PPC</SelectItem>
                  <SelectItem value="Display">Display</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-budget">Budget ($)</Label>
              <Input
                id="campaign-budget"
                type="number"
                placeholder="Enter budget"
                value={newCampaign.budget}
                onChange={(e) => setNewCampaign({...newCampaign, budget: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={newCampaign.startDate}
                onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={newCampaign.endDate}
                onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleCreateCampaign}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Campaigns</CardTitle>
          <CardDescription>
            Track and manage your marketing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div className="font-medium">{campaign.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        campaign.status === 'Active' ? 'default' : 
                        campaign.status === 'Planning' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{campaign.channel}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {campaign.startDate} to {campaign.endDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${campaign.budget.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      Spent: ${campaign.spent.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Impressions: {campaign.impressions.toLocaleString()}</div>
                      <div>CTR: {campaign.budget > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0.00'}%</div>
                      <div>Conversions: {campaign.conversions}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
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

      {/* Marketing Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>
              Performance by marketing channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Email Marketing</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">42.3%</div>
                  <div className="text-sm text-muted-foreground">+2.1%</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Social Media</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">28.7%</div>
                  <div className="text-sm text-muted-foreground">+5.3%</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                  <span>Content Marketing</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">19.8%</div>
                  <div className="text-sm text-muted-foreground">-1.2%</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
                  <span>PPC Advertising</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">9.2%</div>
                  <div className="text-sm text-muted-foreground">+0.8%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest marketing activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium">
                    Email campaign "Summer Special" sent to 12,500 subscribers
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    2 hours ago
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium">
                    Social media post reached 8,900 users with 420 engagements
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    1 day ago
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium">
                    Blog post "AI Trends 2023" published with 1,200 views
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    2 days ago
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium">
                    PPC campaign optimized, reducing cost per click by 15%
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    3 days ago
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketersTab;
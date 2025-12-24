import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Search,
  Filter,
  Mail,
  Users,
  BarChart,
  RefreshCw
} from 'lucide-react';

const MailchimpTab = () => {
  const [mailchimpSettings, setMailchimpSettings] = useState({
    enabled: true,
    apiKey: '***********************************1234',
    connected: true,
    lists: 3
  });

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Summer Newsletter',
      status: 'sent',
      recipients: 12400,
      opens: 4200,
      clicks: 840,
      sendDate: '2023-06-15'
    },
    {
      id: 2,
      name: 'Product Launch Announcement',
      status: 'scheduled',
      recipients: 8900,
      opens: 0,
      clicks: 0,
      sendDate: '2023-06-20'
    },
    {
      id: 3,
      name: 'Welcome Series',
      status: 'active',
      recipients: 2450,
      opens: 1890,
      clicks: 320,
      sendDate: 'Ongoing'
    }
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    list: ''
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving Mailchimp settings');
  };

  const handleRefresh = () => {
    // Refresh data logic would go here
    console.log('Refreshing Mailchimp data');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mailchimp Integration</h2>
          <p className="text-muted-foreground">
            Manage your Mailchimp email marketing integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>
              Mailchimp integration status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {mailchimpSettings.connected ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium text-green-500">Connected</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-medium text-red-500">Disconnected</span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {mailchimpSettings.connected 
                ? 'Successfully connected to Mailchimp' 
                : 'Connection to Mailchimp failed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriber Lists</CardTitle>
            <CardDescription>
              Your Mailchimp audience lists
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mailchimpSettings.lists}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {mailchimpSettings.lists === 1 ? 'list connected' : 'lists connected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Subscribers</CardTitle>
            <CardDescription>
              Combined audience size
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24,560</div>
            <p className="text-sm text-muted-foreground mt-1">
              +1,240 this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mailchimp Settings</CardTitle>
          <CardDescription>
            Configure your Mailchimp integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Mailchimp Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle to enable or disable Mailchimp integration
                </p>
              </div>
              <Switch 
                checked={mailchimpSettings.enabled} 
                onCheckedChange={(checked) => setMailchimpSettings({...mailchimpSettings, enabled: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input 
                  id="api-key" 
                  type="password"
                  value={mailchimpSettings.apiKey}
                  onChange={(e) => setMailchimpSettings({...mailchimpSettings, apiKey: e.target.value})}
                  placeholder="Enter your Mailchimp API key" 
                />
                <Button variant="outline">
                  Update
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate a new API key in your Mailchimp account
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Campaigns</CardTitle>
          <CardDescription>
            Manage your Mailchimp email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted rounded-lg flex items-center justify-center w-12 h-12">
                    <Mail className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{campaign.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant={
                        campaign.status === 'sent' ? 'default' : 
                        campaign.status === 'scheduled' ? 'secondary' : 'outline'
                      }>
                        {campaign.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Sent to {campaign.recipients.toLocaleString()} subscribers
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Opens: </span>
                        <span className="font-medium">{campaign.opens.toLocaleString()}</span>
                        <span className="text-muted-foreground"> ({Math.round((campaign.opens/campaign.recipients)*100)}%)</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Clicks: </span>
                        <span className="font-medium">{campaign.clicks.toLocaleString()}</span>
                        <span className="text-muted-foreground"> ({Math.round((campaign.clicks/campaign.opens)*100)}%)</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {campaign.sendDate}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <BarChart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
          <CardDescription>
            Design a new email campaign for your subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input 
                id="campaign-name" 
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                placeholder="Enter campaign name" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campaign-subject">Email Subject</Label>
              <Input 
                id="campaign-subject" 
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                placeholder="Enter email subject" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subscriber-list">Subscriber List</Label>
              <select 
                id="subscriber-list"
                className="w-full p-2 border rounded"
                value={newCampaign.list}
                onChange={(e) => setNewCampaign({...newCampaign, list: e.target.value})}
              >
                <option value="">Select a list</option>
                <option value="general">General Subscribers</option>
                <option value="premium">Premium Users</option>
                <option value="newsletter">Newsletter Only</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MailchimpTab;
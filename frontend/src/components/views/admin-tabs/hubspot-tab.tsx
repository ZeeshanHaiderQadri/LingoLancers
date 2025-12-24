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
  Users,
  BarChart,
  RefreshCw,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';

const HubspotTab = () => {
  const [hubspotSettings, setHubspotSettings] = useState({
    enabled: true,
    apiKey: '***********************************5678',
    connected: true,
    contacts: 2450
  });

  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      company: 'Tech Corp',
      status: 'customer',
      lastContact: '2023-06-15'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      company: 'Innovate Inc',
      status: 'lead',
      lastContact: '2023-06-10'
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike@example.com',
      company: 'Global Solutions',
      status: 'opportunity',
      lastContact: '2023-06-05'
    }
  ]);

  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    company: ''
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving HubSpot settings');
  };

  const handleRefresh = () => {
    // Refresh data logic would go here
    console.log('Refreshing HubSpot data');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">HubSpot Integration</h2>
          <p className="text-muted-foreground">
            Manage your HubSpot CRM integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>
              HubSpot integration status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {hubspotSettings.connected ? (
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
              {hubspotSettings.connected 
                ? 'Successfully connected to HubSpot' 
                : 'Connection to HubSpot failed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Contacts</CardTitle>
            <CardDescription>
              Contacts in your HubSpot account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{hubspotSettings.contacts}</div>
            <p className="text-sm text-muted-foreground mt-1">
              +120 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Deals</CardTitle>
            <CardDescription>
              Current sales opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-sm text-muted-foreground mt-1">
              $124,500 in pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>HubSpot Settings</CardTitle>
          <CardDescription>
            Configure your HubSpot integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable HubSpot Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle to enable or disable HubSpot integration
                </p>
              </div>
              <Switch 
                checked={hubspotSettings.enabled} 
                onCheckedChange={(checked) => setHubspotSettings({...hubspotSettings, enabled: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hubspot-api-key">API Key</Label>
              <div className="flex gap-2">
                <Input 
                  id="hubspot-api-key" 
                  type="password"
                  value={hubspotSettings.apiKey}
                  onChange={(e) => setHubspotSettings({...hubspotSettings, apiKey: e.target.value})}
                  placeholder="Enter your HubSpot API key" 
                />
                <Button variant="outline">
                  Update
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate a new API key in your HubSpot account
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
          <CardTitle>Contacts</CardTitle>
          <CardDescription>
            Manage your HubSpot contacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted rounded-lg flex items-center justify-center w-12 h-12">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{contact.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {contact.company}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant={
                        contact.status === 'customer' ? 'default' : 
                        contact.status === 'lead' ? 'secondary' : 'outline'
                      }>
                        {contact.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Last contact: {contact.lastContact}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
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
          <CardTitle>Add New Contact</CardTitle>
          <CardDescription>
            Add a new contact to your HubSpot CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Full Name</Label>
              <Input 
                id="contact-name" 
                value={newContact.name}
                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                placeholder="Enter contact name" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email Address</Label>
              <Input 
                id="contact-email" 
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                placeholder="Enter email address" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-company">Company</Label>
              <Input 
                id="contact-company" 
                value={newContact.company}
                onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                placeholder="Enter company name" 
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HubspotTab;
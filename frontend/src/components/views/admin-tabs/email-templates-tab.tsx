import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Eye,
  Copy
} from 'lucide-react';

const EmailTemplatesTab = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Welcome Email',
      subject: 'Welcome to our platform!',
      type: 'welcome',
      status: 'active',
      used: 1240
    },
    {
      id: 2,
      name: 'Password Reset',
      subject: 'Reset your password',
      type: 'password_reset',
      status: 'active',
      used: 892
    },
    {
      id: 3,
      name: 'Order Confirmation',
      subject: 'Your order has been confirmed',
      type: 'order_confirmation',
      status: 'draft',
      used: 0
    }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'welcome'
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving email template');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Email Templates</h2>
          <p className="text-muted-foreground">
            Create and manage email templates for your platform
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search templates..." className="pl-8" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Manage your email templates and automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted rounded-lg flex items-center justify-center w-12 h-12">
                    <Mail className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary">{template.type.replace('_', ' ')}</Badge>
                      <div className="text-sm">
                        Used {template.used} times
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                    {template.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
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
          <CardTitle>Create New Template</CardTitle>
          <CardDescription>
            Design a new email template for your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input 
                id="template-name" 
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                placeholder="Enter template name" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-subject">Email Subject</Label>
              <Input 
                id="template-subject" 
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                placeholder="Enter email subject" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-type">Template Type</Label>
              <select 
                id="template-type"
                className="w-full p-2 border rounded"
                value={newTemplate.type}
                onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
              >
                <option value="welcome">Welcome Email</option>
                <option value="password_reset">Password Reset</option>
                <option value="order_confirmation">Order Confirmation</option>
                <option value="newsletter">Newsletter</option>
                <option value="notification">Notification</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-content">Email Content</Label>
              <Textarea 
                id="template-content" 
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                placeholder="Write your email template content..." 
                className="min-h-[200px]"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplatesTab;
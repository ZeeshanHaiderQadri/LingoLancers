import React from 'react';
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
  Eye, 
  Copy, 
  Download,
  Upload,
  Save,
  X,
  Filter,
  Search,
  MessageSquare
} from 'lucide-react';

const ChatTemplatesTab = () => {
  // Mock data for chat templates
  const templates = [
    {
      id: 1,
      name: 'Welcome Message',
      category: 'Greetings',
      description: 'Standard welcome message for new users',
      usage: 2450,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Billing Inquiry Response',
      category: 'Billing',
      description: 'Template for responding to billing questions',
      usage: 1892,
      rating: 4.6
    },
    {
      id: 3,
      name: 'Technical Support',
      category: 'Support',
      description: 'Template for handling technical issues',
      usage: 1567,
      rating: 4.7
    },
    {
      id: 4,
      name: 'Feature Explanation',
      category: 'Education',
      description: 'Template for explaining product features',
      usage: 987,
      rating: 4.9
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chat Templates</h2>
          <p className="text-muted-foreground">
            Pre-built message templates for consistent responses
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
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
          <CardTitle>Template Library</CardTitle>
          <CardDescription>
            Browse and customize pre-built chat message templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {template.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {template.category}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>{template.usage.toLocaleString()} uses</span>
                    <span>★ {template.rating}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
          <CardDescription>
            Design a new chat message template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input id="template-name" placeholder="Enter template name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Input id="template-category" placeholder="Enter category" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-content">Message Content</Label>
              <Textarea 
                id="template-content" 
                placeholder="Write your message template..." 
                className="min-h-[120px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button>
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

export default ChatTemplatesTab;
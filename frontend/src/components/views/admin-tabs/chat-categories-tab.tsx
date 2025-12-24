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
  Save,
  X,
  Filter,
  Search
} from 'lucide-react';

const ChatCategoriesTab = () => {
  // Mock data for chat categories
  const categories = [
    {
      id: 1,
      name: 'General Support',
      description: 'Common questions and general assistance',
      status: 'active',
      conversations: 1240,
      priority: 'medium'
    },
    {
      id: 2,
      name: 'Billing & Payments',
      description: 'Questions about billing, payments, and subscriptions',
      status: 'active',
      conversations: 892,
      priority: 'high'
    },
    {
      id: 3,
      name: 'Technical Issues',
      description: 'Technical problems and troubleshooting',
      status: 'active',
      conversations: 567,
      priority: 'high'
    },
    {
      id: 4,
      name: 'Feature Requests',
      description: 'User suggestions and feature requests',
      status: 'inactive',
      conversations: 234,
      priority: 'low'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chat Categories</h2>
          <p className="text-muted-foreground">
            Organize and manage chat conversation categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Categories</CardTitle>
          <CardDescription>
            Manage conversation categories for your chat system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                      {category.status}
                    </Badge>
                    <Badge variant={
                      category.priority === 'high' ? 'destructive' : 
                      category.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {category.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  <div className="text-sm">
                    <span>{category.conversations.toLocaleString()} conversations</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
          <CardTitle>Create New Category</CardTitle>
          <CardDescription>
            Add a new conversation category for your chat system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input id="category-name" placeholder="Enter category name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea id="category-description" placeholder="Describe this category" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority Level</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Low</Button>
                  <Button variant="default" size="sm">Medium</Button>
                  <Button variant="outline" size="sm">High</Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label>Enable Category</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle to activate this category
                  </p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Category
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatCategoriesTab;
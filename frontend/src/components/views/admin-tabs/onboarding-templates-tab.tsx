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
  Search
} from 'lucide-react';

const OnboardingTemplatesTab = () => {
  // Mock data for onboarding templates
  const templates = [
    {
      id: 1,
      name: 'SaaS Welcome Template',
      category: 'SaaS',
      description: 'Standard welcome flow for SaaS products',
      usage: 124,
      rating: 4.8
    },
    {
      id: 2,
      name: 'E-commerce Onboarding',
      category: 'E-commerce',
      description: 'Product tour for online stores',
      usage: 89,
      rating: 4.6
    },
    {
      id: 3,
      name: 'Mobile App Tutorial',
      category: 'Mobile',
      description: 'Interactive tutorial for mobile applications',
      usage: 203,
      rating: 4.9
    },
    {
      id: 4,
      name: 'Enterprise Setup',
      category: 'Enterprise',
      description: 'Complex setup for enterprise clients',
      usage: 42,
      rating: 4.7
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Onboarding Templates</h2>
          <p className="text-muted-foreground">
            Pre-built templates to accelerate your onboarding design
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
            Browse and customize pre-built onboarding templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
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
                    <span>{template.usage} uses</span>
                    <span>★ {template.rating}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Use
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
          <CardTitle>Upload Custom Template</CardTitle>
          <CardDescription>
            Import your own onboarding template files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-medium">Drag and drop template file</h3>
            <p className="text-sm text-muted-foreground mt-2">
              or click to browse your files
            </p>
            <Button variant="outline" className="mt-4">
              Select File
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supports JSON and YAML formats
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTemplatesTab;
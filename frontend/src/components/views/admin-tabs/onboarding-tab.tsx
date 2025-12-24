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
  X
} from 'lucide-react';

const OnboardingTab = () => {
  // Mock data for onboarding flows
  const onboardingFlows = [
    {
      id: 1,
      name: 'New User Welcome',
      description: 'Standard onboarding flow for new users',
      status: 'active',
      steps: 5,
      completionRate: '78%'
    },
    {
      id: 2,
      name: 'Premium Upgrade',
      description: 'Onboarding for users upgrading to premium',
      status: 'draft',
      steps: 3,
      completionRate: 'N/A'
    },
    {
      id: 3,
      name: 'Team Setup',
      description: 'Onboarding for team administrators',
      status: 'active',
      steps: 7,
      completionRate: '65%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Onboarding Flows</h2>
          <p className="text-muted-foreground">
            Manage user onboarding experiences
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Flow
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Onboarding Flows</CardTitle>
          <CardDescription>
            Configure and manage different onboarding experiences for your users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onboardingFlows.map((flow) => (
              <div key={flow.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{flow.name}</h3>
                    <Badge variant={flow.status === 'active' ? 'default' : 'secondary'}>
                      {flow.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{flow.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{flow.steps} steps</span>
                    <span>Completion: {flow.completionRate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
          <CardTitle>Create New Onboarding Flow</CardTitle>
          <CardDescription>
            Design a new onboarding experience for your users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="flow-name">Flow Name</Label>
              <Input id="flow-name" placeholder="Enter flow name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flow-description">Description</Label>
              <Textarea id="flow-description" placeholder="Describe this onboarding flow" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Label>Enable Flow</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle to activate this onboarding flow
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Flow
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTab;
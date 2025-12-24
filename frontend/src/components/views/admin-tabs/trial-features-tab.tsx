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
  Clock,
  Calendar,
  Users,
  Zap
} from 'lucide-react';

const TrialFeaturesTab = () => {
  const [trialSettings, setTrialSettings] = useState({
    enabled: true,
    duration: 14,
    userLimit: 100,
    features: [
      { id: 1, name: 'Basic Features', enabled: true },
      { id: 2, name: 'Advanced Analytics', enabled: true },
      { id: 3, name: 'Priority Support', enabled: false },
      { id: 4, name: 'Custom Branding', enabled: false }
    ]
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving trial settings:', trialSettings);
  };

  const toggleFeature = (id: number) => {
    setTrialSettings({
      ...trialSettings,
      features: trialSettings.features.map(feature => 
        feature.id === id 
          ? { ...feature, enabled: !feature.enabled } 
          : feature
      )
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trial Features</h2>
          <p className="text-muted-foreground">
            Configure trial period settings and available features
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trial Status</CardTitle>
            <CardDescription>
              Overall trial program settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Trial Program</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle to activate or deactivate trials
                  </p>
                </div>
                <Switch 
                  checked={trialSettings.enabled} 
                  onCheckedChange={(checked) => setTrialSettings({...trialSettings, enabled: checked})}
                />
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-medium">Trial Program Active</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {trialSettings.enabled 
                    ? 'New users can sign up for trials' 
                    : 'Trials are currently disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Duration & Limits</CardTitle>
            <CardDescription>
              Configure trial period length and user limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trial-duration">Trial Duration (days)</Label>
              <div className="relative">
                <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="trial-duration" 
                  type="number"
                  value={trialSettings.duration}
                  onChange={(e) => setTrialSettings({...trialSettings, duration: parseInt(e.target.value) || 0})}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user-limit">User Limit</Label>
              <div className="relative">
                <Users className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="user-limit" 
                  type="number"
                  value={trialSettings.userLimit}
                  onChange={(e) => setTrialSettings({...trialSettings, userLimit: parseInt(e.target.value) || 0})}
                  className="pl-8"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Set to 0 for unlimited trials
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trial Statistics</CardTitle>
            <CardDescription>
              Current trial program metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Trials</span>
                <span className="font-medium">42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Converted Trials</span>
                <span className="font-medium">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conversion Rate</span>
                <span className="font-medium">43%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Trial Duration</span>
                <span className="font-medium">11 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
          <CardDescription>
            Select which features are available during trial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trialSettings.features.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {feature.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <Switch 
                    checked={feature.enabled} 
                    onCheckedChange={() => toggleFeature(feature.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Custom Feature</CardTitle>
          <CardDescription>
            Create a new feature for trial access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Enter feature name" className="flex-1" />
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialFeaturesTab;
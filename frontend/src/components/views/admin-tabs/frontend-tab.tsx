import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save,
  X,
  Palette,
  Type,
  Monitor,
  Smartphone,
  Tablet,
  Code,
  Eye
} from 'lucide-react';

const FrontendTab = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    primaryColor: '#3b82f6',
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    animations: true,
    responsiveDesign: true
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving frontend settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Frontend Settings</h2>
          <p className="text-muted-foreground">
            Customize the appearance and behavior of your frontend interface
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Colors</CardTitle>
              <CardDescription>
                Configure the overall theme and color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme Mode</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value) => setSettings({...settings, theme: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="color" 
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                    className="w-16 h-10 p-1"
                  />
                  <Input 
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>
                Configure fonts and text styling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select 
                  value={settings.fontFamily} 
                  onValueChange={(value) => setSettings({...settings, fontFamily: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Font Size</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Small</Button>
                  <Button variant="default" size="sm">Medium</Button>
                  <Button variant="outline" size="sm">Large</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>UI Components</CardTitle>
              <CardDescription>
                Customize UI elements and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Select 
                  value={settings.borderRadius} 
                  onValueChange={(value) => setSettings({...settings, borderRadius: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="0.25rem">Small</SelectItem>
                    <SelectItem value="0.5rem">Medium</SelectItem>
                    <SelectItem value="0.75rem">Large</SelectItem>
                    <SelectItem value="1rem">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle UI animations and transitions
                  </p>
                </div>
                <Switch 
                  checked={settings.animations} 
                  onCheckedChange={(checked) => setSettings({...settings, animations: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Responsive Design</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimize for all device sizes
                  </p>
                </div>
                <Switch 
                  checked={settings.responsiveDesign} 
                  onCheckedChange={(checked) => setSettings({...settings, responsiveDesign: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                See how your changes look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  <Tablet className="h-5 w-5" />
                  <Smartphone className="h-5 w-5" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Sample Interface</h3>
                  <p className="text-sm text-muted-foreground">
                    This is how your interface will look with the current settings.
                  </p>
                  <div className="flex gap-2">
                    <Button>Primary Button</Button>
                    <Button variant="outline">Secondary Button</Button>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <Code className="h-4 w-4 mr-2" />
                    Code
                  </Button>
                  <Button size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FrontendTab;
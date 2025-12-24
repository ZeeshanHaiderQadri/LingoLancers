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
  MessageSquare,
  Clock,
  Globe,
  Smartphone
} from 'lucide-react';

const FloatingChatSettingsTab = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    position: 'bottom-right',
    theme: 'default',
    greetingMessage: 'Hi there! How can I help you today?',
    awayMessage: 'We\'re currently away. Please leave a message and we\'ll get back to you.',
    responseTime: '2-4 hours',
    languages: ['English', 'Spanish'],
    mobileBehavior: 'always-show'
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Floating Chat Settings</h2>
          <p className="text-muted-foreground">
            Customize the appearance and behavior of your floating chat widget
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
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic configuration for your floating chat widget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Floating Chat</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle to show or hide the chat widget
                  </p>
                </div>
                <Switch 
                  checked={settings.enabled} 
                  onCheckedChange={(checked) => setSettings({...settings, enabled: checked})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Widget Position</Label>
                <Select 
                  value={settings.position} 
                  onValueChange={(value) => setSettings({...settings, position: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value) => setSettings({...settings, theme: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mobile Behavior</CardTitle>
              <CardDescription>
                Control how the chat widget behaves on mobile devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mobile Display</Label>
                <Select 
                  value={settings.mobileBehavior} 
                  onValueChange={(value) => setSettings({...settings, mobileBehavior: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always-show">Always Show</SelectItem>
                    <SelectItem value="show-on-scroll">Show on Scroll</SelectItem>
                    <SelectItem value="hide-on-scroll">Hide on Scroll</SelectItem>
                    <SelectItem value="manual-toggle">Manual Toggle Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">
                  On mobile devices, the widget will {settings.mobileBehavior.replace('-', ' ')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Customize the default messages shown in the chat widget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Greeting Message</Label>
                <Textarea 
                  value={settings.greetingMessage}
                  onChange={(e) => setSettings({...settings, greetingMessage: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Away Message</Label>
                <Textarea 
                  value={settings.awayMessage}
                  onChange={(e) => setSettings({...settings, awayMessage: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Expected Response Time</Label>
                <Input 
                  value={settings.responseTime}
                  onChange={(e) => setSettings({...settings, responseTime: e.target.value})}
                  placeholder="e.g., 2-4 hours"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>
                Configure supported languages for the chat widget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">
                  Currently supporting {settings.languages.length} languages
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {settings.languages.map((lang, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                    <span className="text-sm">{lang}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4"
                      onClick={() => {
                        const newLanguages = [...settings.languages];
                        newLanguages.splice(index, 1);
                        setSettings({...settings, languages: newLanguages});
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Add Language
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FloatingChatSettingsTab;
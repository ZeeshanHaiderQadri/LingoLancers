"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Palette, 
  Monitor, 
  Smartphone, 
  Tablet,
  Eye,
  Download,
  Upload
} from 'lucide-react';

const LiveCustomizerTab = () => {
  const [customizerSettings, setCustomizerSettings] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    showLogo: true,
    showFooter: true,
  });

  const fontOptions = [
    { value: 'Inter', label: 'Inter (Default)' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
  ];

  const handleSettingChange = (key: string, value: any) => {
    setCustomizerSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Mock save functionality
    console.log('Saving customizer settings:', customizerSettings);
  };

  const handleResetSettings = () => {
    setCustomizerSettings({
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      fontFamily: 'Inter',
      borderRadius: '0.5rem',
      showLogo: true,
      showFooter: true,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Live Customizer</h2>
        <p className="text-muted-foreground">
          Customize the appearance and behavior of your platform in real-time
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customizer Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the visual appearance of your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={customizerSettings.primaryColor}
                      onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={customizerSettings.primaryColor}
                      onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={customizerSettings.secondaryColor}
                      onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={customizerSettings.secondaryColor}
                      onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <select
                  id="font-family"
                  value={customizerSettings.fontFamily}
                  onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="border-radius">Border Radius</Label>
                <Input
                  id="border-radius"
                  type="text"
                  value={customizerSettings.borderRadius}
                  onChange={(e) => handleSettingChange('borderRadius', e.target.value)}
                  placeholder="e.g., 0.5rem"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
              <CardDescription>
                Configure layout and display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Logo</Label>
                  <p className="text-sm text-muted-foreground">
                    Display logo in the header
                  </p>
                </div>
                <Switch
                  checked={customizerSettings.showLogo}
                  onCheckedChange={(checked) => handleSettingChange('showLogo', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Footer</Label>
                  <p className="text-sm text-muted-foreground">
                    Display footer with copyright information
                  </p>
                </div>
                <Switch
                  checked={customizerSettings.showFooter}
                  onCheckedChange={(checked) => handleSettingChange('showFooter', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleSaveSettings}>
              <Download className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            <Button variant="outline" onClick={handleResetSettings}>
              <Upload className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                See changes in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="h-8 flex items-center justify-between px-4"
                  style={{ 
                    backgroundColor: customizerSettings.primaryColor,
                    color: 'white'
                  }}
                >
                  <div>Header</div>
                  <div className="flex gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Tablet className="h-4 w-4" />
                    <Monitor className="h-4 w-4" />
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div 
                    className="h-4 rounded"
                    style={{ backgroundColor: customizerSettings.secondaryColor }}
                  ></div>
                  <div 
                    className="h-4 rounded"
                    style={{ backgroundColor: customizerSettings.secondaryColor, opacity: 0.7 }}
                  ></div>
                  <div 
                    className="h-4 rounded"
                    style={{ backgroundColor: customizerSettings.secondaryColor, opacity: 0.5 }}
                  ></div>
                </div>
                {customizerSettings.showFooter && (
                  <div 
                    className="h-8 flex items-center px-4 text-xs"
                    style={{ backgroundColor: customizerSettings.secondaryColor, opacity: 0.1 }}
                  >
                    Footer
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Device Preview</CardTitle>
              <CardDescription>
                Preview on different devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </Button>
                <Button variant="outline" size="sm">
                  <Tablet className="h-4 w-4 mr-2" />
                  Tablet
                </Button>
                <Button variant="outline" size="sm">
                  <Monitor className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Theme Presets</CardTitle>
              <CardDescription>
                Apply predefined themes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Palette className="h-4 w-4 mr-2" />
                Default Theme
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Palette className="h-4 w-4 mr-2" />
                Dark Theme
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Palette className="h-4 w-4 mr-2" />
                Blue Theme
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Palette className="h-4 w-4 mr-2" />
                Green Theme
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveCustomizerTab;
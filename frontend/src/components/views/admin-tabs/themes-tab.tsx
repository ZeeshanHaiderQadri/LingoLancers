"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor,
  Upload,
  Download,
  Star,
  Eye
} from 'lucide-react';

const ThemesTab = () => {
  // Mock data for themes
  const themes = [
    {
      id: 1,
      name: 'Default Light',
      description: 'Clean and modern light theme',
      isDark: false,
      isDefault: true,
      isPopular: false,
      image: '/placeholder.svg',
    },
    {
      id: 2,
      name: 'Dark Pro',
      description: 'Professional dark theme for reduced eye strain',
      isDark: true,
      isDefault: false,
      isPopular: true,
      image: '/placeholder.svg',
    },
    {
      id: 3,
      name: 'Ocean Breeze',
      description: 'Calm blue tones inspired by the ocean',
      isDark: false,
      isDefault: false,
      isPopular: false,
      image: '/placeholder.svg',
    },
    {
      id: 4,
      name: 'Sunset Glow',
      description: 'Warm colors inspired by sunset',
      isDark: false,
      isDefault: false,
      isPopular: false,
      image: '/placeholder.svg',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Themes</h2>
        <p className="text-muted-foreground">
          Customize the appearance of your platform
        </p>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>
            Configure default themes and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable dark mode for reduced eye strain
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>System Theme</Label>
              <p className="text-sm text-muted-foreground">
                Automatically switch based on system preferences
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Theme Sync</Label>
              <p className="text-sm text-muted-foreground">
                Sync theme across all devices
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Themes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <Card key={theme.id} className="flex flex-col">
            <div className="aspect-video bg-muted rounded-t-lg relative">
              {theme.isPopular && (
                <Badge className="absolute top-2 right-2">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Popular
                </Badge>
              )}
              {theme.isDefault && (
                <Badge variant="secondary" className="absolute top-2 left-2">
                  Default
                </Badge>
              )}
            </div>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  {theme.name}
                  {theme.isDark ? (
                    <Moon className="h-4 w-4 ml-2 text-muted-foreground" />
                  ) : (
                    <Sun className="h-4 w-4 ml-2 text-muted-foreground" />
                  )}
                </CardTitle>
              </div>
              <CardDescription>{theme.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  disabled={theme.isDefault}
                >
                  {theme.isDefault ? 'Current' : 'Apply'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Custom Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Theme</CardTitle>
          <CardDescription>
            Upload your own custom theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Theme File</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Drag and drop your theme file here, or click to browse
            </p>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemesTab;
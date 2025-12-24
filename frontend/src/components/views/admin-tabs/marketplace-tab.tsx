"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  ShoppingCart,
  Package,
  Star,
  Download,
  Eye
} from 'lucide-react';

const MarketplaceTab = () => {
  // Mock data for marketplace items
  const marketplaceItems = [
    {
      id: 1,
      name: 'Content Writer Pro',
      description: 'Advanced AI content writing agent with SEO optimization',
      category: 'Content',
      price: 29.99,
      rating: 4.8,
      downloads: 1240,
      image: '/placeholder.svg',
    },
    {
      id: 2,
      name: 'Social Media Manager',
      description: 'Automated social media posting and engagement agent',
      category: 'Social Media',
      price: 49.99,
      rating: 4.6,
      downloads: 890,
      image: '/placeholder.svg',
    },
    {
      id: 3,
      name: 'Data Analyzer',
      description: 'Powerful data analysis and visualization agent',
      category: 'Analytics',
      price: 39.99,
      rating: 4.9,
      downloads: 2100,
      image: '/placeholder.svg',
    },
    {
      id: 4,
      name: 'Customer Support Bot',
      description: '24/7 customer support chatbot with escalation features',
      category: 'Support',
      price: 34.99,
      rating: 4.7,
      downloads: 1560,
      image: '/placeholder.svg',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
          <p className="text-muted-foreground">
            Browse and manage marketplace items
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search marketplace..."
              className="pl-8 w-full md:w-64"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Marketplace Items Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {marketplaceItems.map((item) => (
          <Card key={item.id} className="flex flex-col">
            <div className="aspect-video bg-muted rounded-t-lg" />
            <CardHeader className="flex-1">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <Badge variant="secondary">${item.price}</Badge>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{item.category}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {item.rating}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Download className="h-4 w-4 mr-1" />
                  {item.downloads}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button size="sm" className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceTab;
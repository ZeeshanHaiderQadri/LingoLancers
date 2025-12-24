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
  Search,
  Filter,
  DollarSign,
  BarChart,
  Eye,
  Pause,
  Play
} from 'lucide-react';

const AdsenseTab = () => {
  const [adsenseSettings, setAdsenseSettings] = useState({
    enabled: true,
    publisherId: 'pub-1234567890123456',
    autoAds: true,
    adStyle: 'default'
  });

  const [adUnits, setAdUnits] = useState([
    {
      id: 1,
      name: 'Sidebar Ad',
      type: 'rectangle',
      size: '300x250',
      status: 'active',
      earnings: 1240,
      impressions: 45200,
      ctr: 2.74
    },
    {
      id: 2,
      name: 'Header Banner',
      type: 'banner',
      size: '728x90',
      status: 'active',
      earnings: 2180,
      impressions: 78900,
      ctr: 3.12
    },
    {
      id: 3,
      name: 'In-content Ad',
      type: 'responsive',
      size: 'Auto',
      status: 'paused',
      earnings: 0,
      impressions: 0,
      ctr: 0
    }
  ]);

  const [newAdUnit, setNewAdUnit] = useState({
    name: '',
    type: 'rectangle',
    size: '300x250'
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving AdSense settings');
  };

  const toggleAdUnit = (id: number) => {
    setAdUnits(adUnits.map(adUnit => 
      adUnit.id === id 
        ? { ...adUnit, status: adUnit.status === 'active' ? 'paused' : 'active' } 
        : adUnit
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Google AdSense</h2>
          <p className="text-muted-foreground">
            Manage your Google AdSense integration and ad units
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Ad Unit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Earnings</CardTitle>
            <CardDescription>
              This month's AdSense revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$3,420</div>
            <p className="text-sm text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Impressions</CardTitle>
            <CardDescription>
              Ad views this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">124,100</div>
            <p className="text-sm text-muted-foreground mt-1">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average CTR</CardTitle>
            <CardDescription>
              Click-through rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2.95%</div>
            <p className="text-sm text-muted-foreground mt-1">Above industry average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AdSense Settings</CardTitle>
          <CardDescription>
            Configure your Google AdSense integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable AdSense</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle to enable or disable AdSense integration
                </p>
              </div>
              <Switch 
                checked={adsenseSettings.enabled} 
                onCheckedChange={(checked) => setAdsenseSettings({...adsenseSettings, enabled: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="publisher-id">Publisher ID</Label>
              <Input 
                id="publisher-id" 
                value={adsenseSettings.publisherId}
                onChange={(e) => setAdsenseSettings({...adsenseSettings, publisherId: e.target.value})}
                placeholder="Enter your AdSense Publisher ID" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto Ads</Label>
                <p className="text-sm text-muted-foreground">
                  Let Google automatically place ads on your site
                </p>
              </div>
              <Switch 
                checked={adsenseSettings.autoAds} 
                onCheckedChange={(checked) => setAdsenseSettings({...adsenseSettings, autoAds: checked})}
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ad Units</CardTitle>
          <CardDescription>
            Manage your Google AdSense ad units
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adUnits.map((adUnit) => (
              <div key={adUnit.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted rounded-lg flex items-center justify-center w-12 h-12">
                    <DollarSign className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{adUnit.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary">{adUnit.type}</Badge>
                      <Badge variant="outline">{adUnit.size}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Earnings: </span>
                        <span className="font-medium">${adUnit.earnings}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Impressions: </span>
                        <span className="font-medium">{adUnit.impressions.toLocaleString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">CTR: </span>
                        <span className="font-medium">{adUnit.ctr}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={adUnit.status === 'active' ? 'default' : 'secondary'}>
                    {adUnit.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleAdUnit(adUnit.id)}
                  >
                    {adUnit.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
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
          <CardTitle>Create New Ad Unit</CardTitle>
          <CardDescription>
            Add a new Google AdSense ad unit to your site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ad-unit-name">Ad Unit Name</Label>
              <Input 
                id="ad-unit-name" 
                value={newAdUnit.name}
                onChange={(e) => setNewAdUnit({...newAdUnit, name: e.target.value})}
                placeholder="Enter ad unit name" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ad-unit-type">Ad Unit Type</Label>
                <select 
                  id="ad-unit-type"
                  className="w-full p-2 border rounded"
                  value={newAdUnit.type}
                  onChange={(e) => setNewAdUnit({...newAdUnit, type: e.target.value})}
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="banner">Banner</option>
                  <option value="skyscraper">Skyscraper</option>
                  <option value="responsive">Responsive</option>
                  <option value="link">Link Unit</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ad-unit-size">Ad Unit Size</Label>
                <Input 
                  id="ad-unit-size" 
                  value={newAdUnit.size}
                  onChange={(e) => setNewAdUnit({...newAdUnit, size: e.target.value})}
                  placeholder="e.g., 300x250" 
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Create Ad Unit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdsenseTab;
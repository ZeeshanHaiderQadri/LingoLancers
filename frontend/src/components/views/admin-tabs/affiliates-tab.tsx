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
  User,
  DollarSign,
  TrendingUp,
  Copy
} from 'lucide-react';

const AffiliatesTab = () => {
  const [affiliates, setAffiliates] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      commissionRate: 10,
      totalEarnings: 2450,
      pendingEarnings: 420,
      referredUsers: 42,
      status: 'active'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      commissionRate: 15,
      totalEarnings: 5680,
      pendingEarnings: 1200,
      referredUsers: 89,
      status: 'active'
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike@example.com',
      commissionRate: 8,
      totalEarnings: 1200,
      pendingEarnings: 0,
      referredUsers: 24,
      status: 'inactive'
    }
  ]);

  const [newAffiliate, setNewAffiliate] = useState({
    name: '',
    email: '',
    commissionRate: 10
  });

  const [programSettings, setProgramSettings] = useState({
    enabled: true,
    defaultCommission: 10,
    cookieDuration: 30
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving affiliate settings');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Affiliate Program</h2>
          <p className="text-muted-foreground">
            Manage your affiliate partners and commission settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Affiliate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Affiliates</CardTitle>
            <CardDescription>
              Active partner count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-sm text-muted-foreground mt-1">+3 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Commissions</CardTitle>
            <CardDescription>
              Paid to affiliates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$12,450</div>
            <p className="text-sm text-muted-foreground mt-1">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Program Status</CardTitle>
            <CardDescription>
              Affiliate program settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm">Program Enabled</span>
              <Switch 
                checked={programSettings.enabled} 
                onCheckedChange={(checked) => setProgramSettings({...programSettings, enabled: checked})}
              />
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Program Active</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {programSettings.enabled 
                  ? 'Affiliates can join and earn commissions' 
                  : 'Affiliate program is currently disabled'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Partners</CardTitle>
          <CardDescription>
            Manage your affiliate partners and commissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {affiliates.map((affiliate) => (
              <div key={affiliate.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted rounded-full flex items-center justify-center w-10 h-10">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{affiliate.name}</h3>
                    <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary">{affiliate.commissionRate}% commission</Badge>
                      <span className="text-sm">
                        {affiliate.referredUsers} referred users
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">${affiliate.totalEarnings}</div>
                    <div className="text-sm text-muted-foreground">
                      ${affiliate.pendingEarnings} pending
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={affiliate.status === 'active' ? 'default' : 'secondary'}>
                      {affiliate.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Affiliate</CardTitle>
            <CardDescription>
              Invite a new partner to your affiliate program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="affiliate-name">Full Name</Label>
                <Input 
                  id="affiliate-name" 
                  value={newAffiliate.name}
                  onChange={(e) => setNewAffiliate({...newAffiliate, name: e.target.value})}
                  placeholder="Enter affiliate name" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="affiliate-email">Email Address</Label>
                <Input 
                  id="affiliate-email" 
                  type="email"
                  value={newAffiliate.email}
                  onChange={(e) => setNewAffiliate({...newAffiliate, email: e.target.value})}
                  placeholder="Enter email address" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="commission-rate" 
                    type="number"
                    value={newAffiliate.commissionRate}
                    onChange={(e) => setNewAffiliate({...newAffiliate, commissionRate: parseInt(e.target.value) || 0})}
                    className="pl-8"
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
                  Add Affiliate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Program Settings</CardTitle>
            <CardDescription>
            Configure global affiliate program settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-commission">Default Commission Rate (%)</Label>
            <Input 
              id="default-commission" 
              type="number"
              value={programSettings.defaultCommission}
              onChange={(e) => setProgramSettings({...programSettings, defaultCommission: parseInt(e.target.value) || 0})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cookie-duration">Cookie Duration (days)</Label>
            <Input 
              id="cookie-duration" 
              type="number"
              value={programSettings.cookieDuration}
              onChange={(e) => setProgramSettings({...programSettings, cookieDuration: parseInt(e.target.value) || 0})}
            />
            <p className="text-sm text-muted-foreground">
              How long referral cookies last
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
};

export default AffiliatesTab;
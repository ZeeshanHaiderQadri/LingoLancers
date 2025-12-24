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
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const PaymentGatewaysTab = () => {
  const [gateways, setGateways] = useState([
    {
      id: 1,
      name: 'Stripe',
      enabled: true,
      connected: true,
      fees: '2.9% + $0.30',
      currency: 'USD, EUR, GBP'
    },
    {
      id: 2,
      name: 'PayPal',
      enabled: true,
      connected: true,
      fees: '3.49% + $0.49',
      currency: 'USD, EUR, GBP, CAD'
    },
    {
      id: 3,
      name: 'Square',
      enabled: false,
      connected: false,
      fees: '2.6% + $0.10',
      currency: 'USD'
    }
  ]);

  const [newGateway, setNewGateway] = useState({
    name: '',
    apiKey: '',
    secretKey: '',
    enabled: true
  });

  const handleSaveGateway = () => {
    // Save gateway logic would go here
    console.log('Saving gateway:', newGateway);
    setNewGateway({
      name: '',
      apiKey: '',
      secretKey: '',
      enabled: true
    });
  };

  const toggleGateway = (id: number) => {
    setGateways(gateways.map(gateway => 
      gateway.id === id 
        ? { ...gateway, enabled: !gateway.enabled } 
        : gateway
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Gateways</h2>
          <p className="text-muted-foreground">
            Configure and manage payment processing options
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Gateway
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Payment Gateways</CardTitle>
          <CardDescription>
            Manage your payment processing providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gateways.map((gateway) => (
              <div key={gateway.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{gateway.name}</h3>
                      {gateway.connected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="secondary">{gateway.fees}</Badge>
                      <Badge variant="outline">{gateway.currency}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Enabled</span>
                    <Switch 
                      checked={gateway.enabled} 
                      onCheckedChange={() => toggleGateway(gateway.id)}
                    />
                  </div>
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
          <CardTitle>Connect New Gateway</CardTitle>
          <CardDescription>
            Add a new payment processing provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gateway-name">Gateway Name</Label>
              <Input 
                id="gateway-name" 
                value={newGateway.name}
                onChange={(e) => setNewGateway({...newGateway, name: e.target.value})}
                placeholder="Enter gateway name" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="api-key" 
                  type="password"
                  value={newGateway.apiKey}
                  onChange={(e) => setNewGateway({...newGateway, apiKey: e.target.value})}
                  placeholder="Enter API key" 
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret-key">Secret Key</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="secret-key" 
                  type="password"
                  value={newGateway.secretKey}
                  onChange={(e) => setNewGateway({...newGateway, secretKey: e.target.value})}
                  placeholder="Enter secret key" 
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Gateway</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle to activate this payment gateway
                </p>
              </div>
              <Switch 
                checked={newGateway.enabled} 
                onCheckedChange={(checked) => setNewGateway({...newGateway, enabled: checked})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSaveGateway}>
                <Save className="mr-2 h-4 w-4" />
                Save Gateway
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentGatewaysTab;
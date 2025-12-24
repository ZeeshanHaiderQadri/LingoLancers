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
  Smartphone,
  CreditCard,
  QrCode,
  Wallet,
  Apple,
  Chrome
} from 'lucide-react';

const MobilePaymentTab = () => {
  const [mobilePayments, setMobilePayments] = useState({
    applePay: true,
    googlePay: true,
    samsungPay: false,
    stripe: true,
    paypal: true
  });

  const [customProviders, setCustomProviders] = useState([
    {
      id: 1,
      name: 'Alipay',
      enabled: true,
      description: 'Chinese mobile payment provider'
    },
    {
      id: 2,
      name: 'WeChat Pay',
      enabled: true,
      description: 'Popular payment method in China'
    }
  ]);

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving mobile payment settings:', mobilePayments);
  };

  const toggleProvider = (provider: keyof typeof mobilePayments) => {
    setMobilePayments({
      ...mobilePayments,
      [provider]: !mobilePayments[provider]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mobile Payments</h2>
          <p className="text-muted-foreground">
            Configure mobile payment options for your application
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
              <CardTitle>Standard Mobile Payments</CardTitle>
              <CardDescription>
                Enable popular mobile payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Apple className="h-6 w-6" />
                  <div>
                    <h3 className="font-medium">Apple Pay</h3>
                    <p className="text-sm text-muted-foreground">
                      iOS mobile payments
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={mobilePayments.applePay} 
                  onCheckedChange={() => toggleProvider('applePay')}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Chrome className="h-6 w-6" />
                  <div>
                    <h3 className="font-medium">Google Pay</h3>
                    <p className="text-sm text-muted-foreground">
                      Android mobile payments
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={mobilePayments.googlePay} 
                  onCheckedChange={() => toggleProvider('googlePay')}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6" />
                  <div>
                    <h3 className="font-medium">Samsung Pay</h3>
                    <p className="text-sm text-muted-foreground">
                      Samsung device payments
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={mobilePayments.samsungPay} 
                  onCheckedChange={() => toggleProvider('samsungPay')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Integration</CardTitle>
              <CardDescription>
                Connect mobile payment providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                  <div>
                    <h3 className="font-medium">Stripe Mobile</h3>
                    <p className="text-sm text-muted-foreground">
                      Stripe mobile payment integration
                  </p>
                  </div>
                </div>
                <Switch 
                  checked={mobilePayments.stripe} 
                  onCheckedChange={() => toggleProvider('stripe')}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="h-6 w-6 text-blue-500" />
                  <div>
                    <h3 className="font-medium">PayPal Mobile</h3>
                    <p className="text-sm text-muted-foreground">
                      PayPal mobile checkout
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={mobilePayments.paypal} 
                  onCheckedChange={() => toggleProvider('paypal')}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Payment Providers</CardTitle>
              <CardDescription>
                Add specialized mobile payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customProviders.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {provider.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={provider.enabled} />
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Input placeholder="Provider name" className="flex-1" />
                  <Button>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Code Payments</CardTitle>
              <CardDescription>
                Enable QR code based mobile payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <QrCode className="h-6 w-6" />
                  <div>
                    <h3 className="font-medium">QR Code Payments</h3>
                    <p className="text-sm text-muted-foreground">
                      Enable QR code payment generation
                    </p>
                  </div>
                </div>
                <Switch />
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">QR Code Settings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Auto-generate QR codes</span>
                    <Switch />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Custom QR design</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MobilePaymentTab;
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Search,
  Filter,
  Tag,
  Calendar,
  Users,
  Copy
} from 'lucide-react';

const CouponsTab = () => {
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: 'WELCOME10',
      discount: 10,
      type: 'percentage',
      expiration: '2023-12-31',
      usageLimit: 100,
      used: 24,
      status: 'active'
    },
    {
      id: 2,
      code: 'SAVE20',
      discount: 20,
      type: 'fixed',
      expiration: '2023-11-30',
      usageLimit: 50,
      used: 42,
      status: 'active'
    },
    {
      id: 3,
      code: 'FREESHIP',
      discount: 0,
      type: 'free_shipping',
      expiration: '2023-10-15',
      usageLimit: 25,
      used: 25,
      status: 'expired'
    }
  ]);

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: 0,
    type: 'percentage',
    expiration: '',
    usageLimit: 100
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving coupon');
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon({...newCoupon, code});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Coupon Management</h2>
          <p className="text-muted-foreground">
            Create and manage discount coupons for your store
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search coupons..." className="pl-8" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Coupon
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
          <CardDescription>
            Manage your discount coupons and promotions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted rounded-lg flex items-center justify-center w-12 h-12">
                    <Tag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg">{coupon.code}</h3>
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {coupon.type === 'percentage' 
                          ? `${coupon.discount}% off` 
                          : coupon.type === 'fixed' 
                            ? `$${coupon.discount} off` 
                            : 'Free Shipping'}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Expires {coupon.expiration}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-sm">
                        {coupon.used}/{coupon.usageLimit} used
                      </div>
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(coupon.used / coupon.usageLimit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>
                    {coupon.status}
                  </Badge>
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
          <CardTitle>Create New Coupon</CardTitle>
          <CardDescription>
            Design a new discount coupon for your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-code">Coupon Code</Label>
                <div className="flex gap-2">
                  <Input 
                    id="coupon-code" 
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    placeholder="Enter coupon code" 
                  />
                  <Button onClick={generateCode} variant="outline">
                    Generate
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coupon-type">Discount Type</Label>
                <Select 
                  value={newCoupon.type} 
                  onValueChange={(value) => setNewCoupon({...newCoupon, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Off</SelectItem>
                    <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {newCoupon.type !== 'free_shipping' && (
              <div className="space-y-2">
                <Label htmlFor="discount-amount">
                  {newCoupon.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                </Label>
                <Input 
                  id="discount-amount" 
                  type="number"
                  value={newCoupon.discount}
                  onChange={(e) => setNewCoupon({...newCoupon, discount: parseFloat(e.target.value) || 0})}
                  placeholder={newCoupon.type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiration-date">Expiration Date</Label>
                <Input 
                  id="expiration-date" 
                  type="date"
                  value={newCoupon.expiration}
                  onChange={(e) => setNewCoupon({...newCoupon, expiration: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="usage-limit">Usage Limit</Label>
                <Input 
                  id="usage-limit" 
                  type="number"
                  value={newCoupon.usageLimit}
                  onChange={(e) => setNewCoupon({...newCoupon, usageLimit: parseInt(e.target.value) || 0})}
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
                Save Coupon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponsTab;
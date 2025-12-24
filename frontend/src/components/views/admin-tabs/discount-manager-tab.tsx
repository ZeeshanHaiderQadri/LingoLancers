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
  Percent,
  Calendar,
  Users,
  ShoppingCart
} from 'lucide-react';

const DiscountManagerTab = () => {
  const [discounts, setDiscounts] = useState([
    {
      id: 1,
      name: 'Summer Sale',
      type: 'percentage',
      value: 20,
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      applicableTo: 'All Products',
      status: 'active'
    },
    {
      id: 2,
      name: 'Back to School',
      type: 'fixed',
      value: 50,
      startDate: '2023-08-15',
      endDate: '2023-09-15',
      applicableTo: 'Specific Categories',
      status: 'scheduled'
    },
    {
      id: 3,
      name: 'Clearance Event',
      type: 'buy_x_get_y',
      value: 'Buy 2 Get 1 Free',
      startDate: '2023-07-01',
      endDate: '2023-07-31',
      applicableTo: 'Selected Items',
      status: 'active'
    }
  ]);

  const [newDiscount, setNewDiscount] = useState({
    name: '',
    type: 'percentage',
    value: 0,
    startDate: '',
    endDate: '',
    applicableTo: 'All Products'
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving discount');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discount Manager</h2>
          <p className="text-muted-foreground">
            Create and manage automatic discounts and promotions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Discount
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Discounts</CardTitle>
            <CardDescription>
              Currently running promotions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-sm text-muted-foreground mt-1">+2 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Savings</CardTitle>
            <CardDescription>
              Value provided to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$12,450</div>
            <p className="text-sm text-muted-foreground mt-1">+18% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redemption Rate</CardTitle>
            <CardDescription>
              Percentage of eligible purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">34%</div>
            <p className="text-sm text-muted-foreground mt-1">Average conversion</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Discounts</CardTitle>
          <CardDescription>
            Manage your automatic discounts and promotions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {discounts.map((discount) => (
              <div key={discount.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted rounded-lg flex items-center justify-center w-12 h-12">
                    <Percent className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{discount.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {discount.type === 'percentage' 
                          ? `${discount.value}% off` 
                          : discount.type === 'fixed' 
                            ? `$${discount.value} off` 
                            : discount.value}
                      </Badge>
                      <Badge variant="outline">
                        {discount.applicableTo}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{discount.startDate} to {discount.endDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    discount.status === 'active' ? 'default' : 
                    discount.status === 'scheduled' ? 'secondary' : 'outline'
                  }>
                    {discount.status}
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
          <CardTitle>Create New Discount</CardTitle>
          <CardDescription>
            Set up a new automatic discount or promotion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discount-name">Discount Name</Label>
              <Input 
                id="discount-name" 
                value={newDiscount.name}
                onChange={(e) => setNewDiscount({...newDiscount, name: e.target.value})}
                placeholder="Enter discount name" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount-type">Discount Type</Label>
                <Select 
                  value={newDiscount.type} 
                  onValueChange={(value) => setNewDiscount({...newDiscount, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Off</SelectItem>
                    <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                    <SelectItem value="buy_x_get_y">Buy X Get Y Free</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount-value">
                  {newDiscount.type === 'percentage' ? 'Discount Percentage' : 
                   newDiscount.type === 'fixed' ? 'Discount Amount' : 
                   'Discount Details'}
                </Label>
                <Input 
                  id="discount-value" 
                  value={newDiscount.value}
                  onChange={(e) => setNewDiscount({...newDiscount, value: e.target.value})}
                  placeholder={
                    newDiscount.type === 'percentage' ? 'Enter percentage' : 
                    newDiscount.type === 'fixed' ? 'Enter amount' : 
                    'Enter details'
                  }
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input 
                  id="start-date" 
                  type="date"
                  value={newDiscount.startDate}
                  onChange={(e) => setNewDiscount({...newDiscount, startDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input 
                  id="end-date" 
                  type="date"
                  value={newDiscount.endDate}
                  onChange={(e) => setNewDiscount({...newDiscount, endDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="applicable-to">Applicable To</Label>
              <Select 
                value={newDiscount.applicableTo} 
                onValueChange={(value) => setNewDiscount({...newDiscount, applicableTo: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Products">All Products</SelectItem>
                  <SelectItem value="Specific Categories">Specific Categories</SelectItem>
                  <SelectItem value="Selected Items">Selected Items</SelectItem>
                  <SelectItem value="New Customers">New Customers</SelectItem>
                  <SelectItem value="Existing Customers">Existing Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Discount
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountManagerTab;
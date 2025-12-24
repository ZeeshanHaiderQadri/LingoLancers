import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  DollarSign,
  Users,
  Zap,
  Check,
  Copy
} from 'lucide-react';

const PricingPlansTab = () => {
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'Starter',
      price: 19,
      period: 'month',
      description: 'Perfect for individuals and small projects',
      features: [
        'Up to 5 projects',
        'Basic analytics',
        'Email support',
        '1GB storage'
      ],
      popular: false,
      enabled: true
    },
    {
      id: 2,
      name: 'Professional',
      price: 49,
      period: 'month',
      description: 'Ideal for growing teams and businesses',
      features: [
        'Unlimited projects',
        'Advanced analytics',
        'Priority support',
        '10GB storage',
        'Team collaboration',
        'API access'
      ],
      popular: true,
      enabled: true
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 99,
      period: 'month',
      description: 'For large organizations with advanced needs',
      features: [
        'Unlimited projects',
        'Advanced analytics',
        '24/7 dedicated support',
        '100GB storage',
        'Team collaboration',
        'API access',
        'Custom integrations',
        'SLA guarantee'
      ],
      popular: false,
      enabled: true
    }
  ]);

  const [newPlan, setNewPlan] = useState({
    name: '',
    price: 0,
    period: 'month',
    description: '',
    features: [''],
    popular: false,
    enabled: true
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving pricing plans');
  };

  const addFeature = () => {
    setNewPlan({
      ...newPlan,
      features: [...newPlan.features, '']
    });
  };

  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...newPlan.features];
    updatedFeatures[index] = value;
    setNewPlan({
      ...newPlan,
      features: updatedFeatures
    });
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...newPlan.features];
    updatedFeatures.splice(index, 1);
    setNewPlan({
      ...newPlan,
      features: updatedFeatures
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pricing Plans</h2>
          <p className="text-muted-foreground">
            Configure subscription plans and pricing options
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Plans
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary">Most Popular</Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Enabled</span>
                  <Switch checked={plan.enabled} />
                </div>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Plan</CardTitle>
          <CardDescription>
            Design a new subscription plan for your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input 
                  id="plan-name" 
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                  placeholder="Enter plan name" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-price">Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="plan-price" 
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value) || 0})}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan-description">Description</Label>
              <Textarea 
                id="plan-description" 
                value={newPlan.description}
                onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                placeholder="Describe this plan" 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Features</Label>
              {newPlan.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="Enter feature" 
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={addFeature}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Mark as Popular</span>
                <Switch 
                  checked={newPlan.popular} 
                  onCheckedChange={(checked) => setNewPlan({...newPlan, popular: checked})}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Enable Plan</span>
                <Switch 
                  checked={newPlan.enabled} 
                  onCheckedChange={(checked) => setNewPlan({...newPlan, enabled: checked})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingPlansTab;
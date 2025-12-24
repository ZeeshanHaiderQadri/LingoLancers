
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Star, DollarSign, CheckCircle, Apple, Gem, Bot, FileText, Users, User, Video } from "lucide-react";

// Mock Icons for Payment Gateways
const StripeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M4 10.5a6.5 6.5 0 1 1 13 0 .5.5 0 0 0-1 0 5.5 5.5 0 1 0-11 0 .5.5 0 0 0-1 0Z"/><path d="M6 10.33a5.5 5.5 0 1 1 11 0 .5.5 0 0 0-1 0 4.5 4.5 0 1 0-9 0 .5.5 0 0 0-1 0Z"/></svg>;
const PayPalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M14.6-2.2c-1.4-.4-3-.4-4.5-.1-1.2.2-2.3.6-3.3 1.3-1.8 1.1-2.9 2.9-3.2 4.9-.1 1.1 0 2.2.4 3.3.4 1.3 1.1 2.5 2.1 3.5 1 1 2.2 1.8 3.5 2.4.2.1.4.2.6.3v-2.3c0-.2.1-.4.3-.5.2-.1.4-.1.6-.1h.3c.4 0 .7.1 1 .3.6.3 1 .8 1.1 1.4.1.3.1.7.1 1v.3c0 .2.1.4.3.5.2.1.4.1.6.1h.3c.4 0 .7-.1 1-.3.6-.3 1-.8 1.1-1.4.1-.3.1-.7.1-1v-2.1c0-3.9-2.2-7.3-5.5-8.7z"/><path d="M12.2 1.3c-1.5-.5-3.1-.6-4.6-.3-1.3.2-2.5.7-3.6 1.4-2 1.3-3.2 3.2-3.5 5.4-.2 1.2 0 2.4.4 3.6s1.2 2.7 2.3 3.8c1.1 1.1 2.4 2 3.8 2.6.2.1.4.2.6.3v-2.5c0-.5.4-.9.9-.9h.3c.4 0 .7.1 1 .3s.8 1.1 1.4 1.1c.1.3.1.7.1 1v.3c0 .5.4.9.9.9h.3c.4 0 .7-.1 1-.3s.8-1.1 1.4-1.1c.1-.3.1-.7.1-1v-2.3c0-4.3-2.4-8-6-9.5z"/></svg>;
const RazorpayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M6 6l12 12M6 18L18 6"/></svg>;

const PaymentGatewaysTab = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-background/50">
                <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><StripeIcon /> Stripe</CardTitle><Badge variant="default" className="bg-green-500/80 text-white">Active</Badge></div></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1"><Label htmlFor="stripe-pk">Publishable Key</Label><Input id="stripe-pk" type="password" defaultValue="pk_test_••••••••••••••••" /></div>
                    <div className="space-y-1"><Label htmlFor="stripe-sk">Secret Key</Label><Input id="stripe-sk" type="password" defaultValue="sk_test_••••••••••••••••" /></div>
                </CardContent>
                <CardFooter><Button className="w-full">Save Stripe Settings</Button></CardFooter>
            </Card>
            <Card className="bg-background/50">
                <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><PayPalIcon /> PayPal</CardTitle><Badge variant="secondary">Inactive</Badge></div></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1"><Label htmlFor="paypal-id">Client ID</Label><Input id="paypal-id" placeholder="Enter PayPal Client ID" /></div>
                    <div className="space-y-1"><Label htmlFor="paypal-secret">Client Secret</Label><Input id="paypal-secret" type="password" placeholder="Enter PayPal Client Secret" /></div>
                </CardContent>
                <CardFooter><Button className="w-full">Save PayPal Settings</Button></CardFooter>
            </Card>
            <Card className="bg-background/50">
                <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><RazorpayIcon /> Razorpay</CardTitle><Badge variant="secondary">Inactive</Badge></div></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1"><Label htmlFor="razorpay-id">Key ID</Label><Input id="razorpay-id" placeholder="Enter Razorpay Key ID" /></div>
                    <div className="space-y-1"><Label htmlFor="razorpay-secret">Key Secret</Label><Input id="razorpay-secret" type="password" placeholder="Enter Razorpay Key Secret" /></div>
                </CardContent>
                <CardFooter><Button className="w-full">Save Razorpay Settings</Button></CardFooter>
            </Card>
        </div>
    </div>
);

const TrialFeaturesTab = () => (
    <Card className="bg-background/50 max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Free Trial Configuration</CardTitle>
            <CardDescription>Define the limitations and features available to users on a free trial plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="trial-days">Trial Duration (in days)</Label>
                    <Input id="trial-days" type="number" defaultValue="14" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="trial-words">AI Word Credit Limit</Label>
                    <Input id="trial-words" type="number" defaultValue="10000" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="trial-images">AI Image Credit Limit</Label>
                    <Input id="trial-images" type="number" defaultValue="50" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="trial-videos">AI Video Minutes Limit</Label>
                    <Input id="trial-videos" type="number" defaultValue="5" />
                </div>
            </div>
            <div className="space-y-4">
                <Label>Feature Access</Label>
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between"><Label htmlFor="ft-writer">AI Writer</Label><Switch id="ft-writer" defaultChecked /></div>
                    <div className="flex items-center justify-between"><Label htmlFor="ft-images">AI Image Generation</Label><Switch id="ft-images" defaultChecked /></div>
                    <div className="flex items-center justify-between"><Label htmlFor="ft-voice">AI Voiceover</Label><Switch id="ft-voice" defaultChecked /></div>
                    <div className="flex items-center justify-between"><Label htmlFor="ft-social">Social Media Scheduling</Label><Switch id="ft-social" defaultChecked /></div>
                    <div className="flex items-center justify-between"><Label htmlFor="ft-clone">Voice Cloning</Label><Switch id="ft-clone" /></div>
                    <div className="flex items-center justify-between"><Label htmlFor="ft-api">API Access</Label><Switch id="ft-api" /></div>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button className="ml-auto">Save Trial Settings</Button>
        </CardFooter>
    </Card>
);

const MobilePaymentTab = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
        <Card className="bg-background/50">
            <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><Apple className="h-6 w-6"/> Apple Pay</CardTitle><Badge variant="default" className="bg-green-500/80 text-white">Active</Badge></div></CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1"><Label htmlFor="apple-id">Merchant ID</Label><Input id="apple-id" type="text" defaultValue="merchant.com.lingolancers.app" /></div>
            </CardContent>
            <CardFooter><Button className="w-full">Save Apple Pay Settings</Button></CardFooter>
        </Card>
         <Card className="bg-background/50">
            <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="M12 6v2.5l2 2"/></svg>
             Google Pay</CardTitle><Badge variant="secondary">Inactive</Badge></div></CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1"><Label htmlFor="google-id">Merchant ID</Label><Input id="google-id" placeholder="Enter Google Pay Merchant ID" /></div>
            </CardContent>
            <CardFooter><Button className="w-full">Save Google Pay Settings</Button></CardFooter>
        </Card>
    </div>
);

const PricingPlanCard = ({ plan, current }: { plan: any, current?: boolean }) => (
    <Card className={`bg-card/50 flex flex-col ${current ? 'border-primary ring-2 ring-primary shadow-lg' : ''}`}>
        <CardHeader className="text-center">
            <h3 className="text-2xl font-bold font-headline">{plan.name}</h3>
            <p className="text-muted-foreground">{plan.description}</p>
        </CardHeader>
        <CardContent className="space-y-6 flex-1">
            <div className="text-center">
                <span className="text-5xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3">
                {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
        <CardFooter>
            <Button className="w-full" size="lg" variant={current ? "default" : "outline"} disabled={current}>
                {current ? "Current Plan" : "Upgrade"}
            </Button>
        </CardFooter>
    </Card>
);

const PricingPlansTab = () => {
    const plans = [
        {
            name: "Starter",
            description: "For individuals and hobbyists.",
            price: 29,
            features: [
                "50,000 AI Word Credits",
                "100 AI Image Credits",
                "10 AI Video Minutes",
                "Basic AI Chat",
                "1 Social Profile",
            ],
        },
        {
            name: "Pro",
            description: "For professionals and small teams.",
            price: 99,
            features: [
                "250,000 AI Word Credits",
                "500 AI Image Credits",
                "60 AI Video Minutes",
                "AI Chat Pro",
                "5 Social Profiles",
                "AI Voice Cloning (1 voice)",
                "API Access",
            ],
        },
        {
            name: "Business",
            description: "For large teams and enterprises.",
            price: 299,
            features: [
                "Unlimited AI Word Credits",
                "Unlimited AI Image Credits",
                "300 AI Video Minutes",
                "Team Management",
                "Unlimited Social Profiles",
                "AI Voice Cloning (5 voices)",
                "Dedicated Support",
            ],
        },
    ];

    return (
        <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-4xl font-bold font-headline tracking-tight">Find the perfect plan</h2>
                <p className="text-lg text-muted-foreground mt-2">Start for free, then upgrade to unlock more powerful features and higher limits.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <PricingPlanCard plan={plans[0]} />
                <PricingPlanCard plan={plans[1]} current />
                <PricingPlanCard plan={plans[2]} />
            </div>
             <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Credit Options</CardTitle>
                    <CardDescription>Top up your account with additional credits whenever you need them.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-4 border rounded-lg text-center flex flex-col items-center">
                        <h4 className="font-bold flex items-center justify-center gap-2 mb-2"><FileText /> Word Credits</h4>
                        <p className="text-muted-foreground text-sm flex-1">Perfect for generating articles, scripts, and social media posts.</p>
                        <p className="text-3xl font-bold my-2">100,000</p>
                        <p className="text-lg font-semibold mb-4">for $10</p>
                        <Button variant="outline" className="w-full">Purchase</Button>
                    </div>
                     <div className="p-4 border rounded-lg text-center flex flex-col items-center">
                        <h4 className="font-bold flex items-center justify-center gap-2 mb-2"><Gem /> Image Credits</h4>
                        <p className="text-muted-foreground text-sm flex-1">For creating logos, marketing images, and creative art.</p>
                        <p className="text-3xl font-bold my-2">200</p>
                        <p className="text-lg font-semibold mb-4">for $15</p>
                        <Button variant="outline" className="w-full">Purchase</Button>
                    </div>
                     <div className="p-4 border rounded-lg text-center flex flex-col items-center">
                        <h4 className="font-bold flex items-center justify-center gap-2 mb-2"><Video /> Video Minutes</h4>
                         <p className="text-muted-foreground text-sm flex-1">Generate short-form videos, product showcases, and more.</p>
                        <p className="text-3xl font-bold my-2">30</p>
                        <p className="text-lg font-semibold mb-4">for $20</p>
                        <Button variant="outline" className="w-full">Purchase</Button>
                    </div>
                    <div className="p-4 border rounded-lg text-center flex flex-col items-center">
                        <h4 className="font-bold flex items-center justify-center gap-2 mb-2"><User /> Avatar Credits</h4>
                        <p className="text-muted-foreground text-sm flex-1">Create custom image or video avatars for your brand.</p>
                        <p className="text-3xl font-bold my-2">10</p>
                        <p className="text-lg font-semibold mb-4">for $25</p>
                        <Button variant="outline" className="w-full">Purchase</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default function FinanceView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "payment-gateways");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="payment-gateways"><CreditCard className="mr-2 h-4 w-4"/>Payment Gateways</TabsTrigger>
                <TabsTrigger value="trial-features"><Star className="mr-2 h-4 w-4"/>Trial Features</TabsTrigger>
                <TabsTrigger value="mobile-payment"><Apple className="mr-2 h-4 w-4"/>Mobile Payment</TabsTrigger>
                <TabsTrigger value="pricing-plans"><DollarSign className="mr-2 h-4 w-4"/>Pricing & Credits</TabsTrigger>
            </TabsList>
            <TabsContent value="payment-gateways" className="mt-6"><PaymentGatewaysTab /></TabsContent>
            <TabsContent value="trial-features" className="mt-6"><TrialFeaturesTab /></TabsContent>
            <TabsContent value="mobile-payment" className="mt-6"><MobilePaymentTab /></TabsContent>
            <TabsContent value="pricing-plans" className="mt-6"><PricingPlansTab /></TabsContent>
        </Tabs>
    </div>
  );
}

    
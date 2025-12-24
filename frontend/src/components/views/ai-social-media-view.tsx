

"use client";

import React, { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge";

import { Share2, Pencil, Calendar as CalendarIcon, Bot, Twitter, Facebook, Instagram, Linkedin, Send, Repeat, BarChart2, Users, Target, Settings, Youtube, Twitch } from "lucide-react";

const chartData = [
  { month: "January", posts: 186 },
  { month: "February", posts: 305 },
  { month: "March", posts: 237 },
  { month: "April", posts: 273 },
  { month: "May", posts: 209 },
  { month: "June", posts: 214 },
];

const chartConfig = {
  posts: {
    label: "Posts",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const platforms = [
  { id: "twitter", name: "Twitter / X", icon: <Twitter className="h-5 w-5" /> },
  { id: "facebook", name: "Facebook", icon: <Facebook className="h-5 w-5" /> },
  { id: "instagram", name: "Instagram", icon: <Instagram className="h-5 w-5" /> },
  { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="h-5 w-5" /> },
  { id: "youtube", name: "YouTube", icon: <Youtube className="h-5 w-5" /> },
  { id: "twitch", name: "Twitch", icon: <Twitch className="h-5 w-5" /> },
]

export default function AiSocialMediaView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "dashboard");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="p-4 md:p-6 h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
                <TabsTrigger value="dashboard"><BarChart2 className="mr-2 h-4 w-4" />Dashboard</TabsTrigger>
                <TabsTrigger value="studio"><Pencil className="mr-2 h-4 w-4" />Post Studio</TabsTrigger>
                <TabsTrigger value="calendar"><CalendarIcon className="mr-2 h-4 w-4" />Calendar</TabsTrigger>
                <TabsTrigger value="campaigns"><Target className="mr-2 h-4 w-4" />Campaigns</TabsTrigger>
                <TabsTrigger value="platforms"><Share2 className="mr-2 h-4 w-4" />Platforms</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="flex-1 mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:animate-gradient bg-[length:400%_400%]"></div>
                        <Card className="relative bg-card/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                                <Send className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1,234</div>
                                <p className="text-xs text-muted-foreground">+15% from last month</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:animate-gradient bg-[length:400%_400%]"></div>
                        <Card className="relative bg-card/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">5.2%</div>
                                <p className="text-xs text-muted-foreground">+1.1% from last month</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:animate-gradient bg-[length:400%_400%]"></div>
                        <Card className="relative bg-card/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">New Followers</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+872</div>
                                <p className="text-xs text-muted-foreground">Across all platforms</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:animate-gradient bg-[length:400%_400%]"></div>
                        <Card className="relative bg-card/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">42</div>
                                <p className="text-xs text-muted-foreground">For this week</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                     <Card className="bg-card/50">
                        <CardHeader>
                            <CardTitle>Posting Activity</CardTitle>
                            <CardDescription>Number of posts per month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                 <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="posts" fill="var(--color-posts)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50">
                        <CardHeader>
                            <CardTitle>Upcoming Posts</CardTitle>
                            <CardDescription>A quick look at what's next in your content calendar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-2 rounded-md bg-background/50">
                                <div className="p-2 bg-blue-500/10 rounded-md text-blue-500"><Twitter /></div>
                                <div>
                                    <p className="text-sm font-medium">"Exploring the future of AI..."</p>
                                    <p className="text-xs text-muted-foreground">Tomorrow at 9:00 AM</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4 p-2 rounded-md bg-background/50">
                                <div className="p-2 bg-pink-500/10 rounded-md text-pink-500"><Instagram /></div>
                                <div>
                                    <p className="text-sm font-medium">[Reel] A day in the life of an AI...</p>
                                    <p className="text-xs text-muted-foreground">Tomorrow at 1:00 PM</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4 p-2 rounded-md bg-background/50">
                                <div className="p-2 bg-sky-600/10 rounded-md text-sky-600"><Linkedin /></div>
                                <div>
                                    <p className="text-sm font-medium">Article: How AI is transforming marketing</p>
                                    <p className="text-xs text-muted-foreground">Friday at 11:00 AM</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="studio" className="flex-1 mt-6">
                 <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Card className="bg-card/50">
                            <CardHeader>
                                <CardTitle>AI Post Studio</CardTitle>
                                <CardDescription>Craft the perfect post and let our AI enhance it for you.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="post-prompt">What's the post about?</Label>
                                    <Textarea id="post-prompt" placeholder="e.g., 'The benefits of using AI for content creation'" className="h-24" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Generated Content</Label>
                                    <Textarea placeholder="AI-generated text will appear here..." className="h-40 bg-background/50" readOnly/>
                                </div>
                                <div className="flex gap-2">
                                    <Button className="w-full animated-gradient-border bg-transparent text-white"><Bot className="mr-2 h-4 w-4" />Generate</Button>
                                    <Button variant="outline" className="w-full"><Repeat className="mr-2 h-4 w-4" />Regenerate</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card className="bg-card/50">
                            <CardHeader>
                                <CardTitle>Post To</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {platforms.map(p => (
                                    <div key={p.id} className="flex items-center space-x-2">
                                        <Checkbox id={p.id} />
                                        <Label htmlFor={p.id} className="flex items-center gap-2 text-sm font-normal">
                                            {p.icon} {p.name}
                                        </Label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                         <Card className="bg-card/50">
                            <CardHeader>
                                <CardTitle>Schedule Post</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <Input type="datetime-local" />
                                 <Button className="w-full">Schedule</Button>
                            </CardContent>
                        </Card>
                        <Button size="lg" className="w-full animated-gradient-border bg-accent text-accent-foreground"><Send className="mr-2 h-4 w-4"/>Post Now</Button>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="calendar" className="flex-1 mt-6">
                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle>Content Calendar</CardTitle>
                        <CardDescription>Visualize your social media schedule.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="range"
                            numberOfMonths={2}
                            className="p-0"
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="flex-1 mt-6">
                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle>Campaign Management</CardTitle>
                        <CardDescription>Plan, execute, and track your marketing campaigns.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Campaigns Yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Create your first campaign to get started.</p>
                            <Button className="mt-6 animated-gradient-border bg-transparent text-white">Create Campaign</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="platforms" className="flex-1 mt-6">
                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle>Connected Platforms</CardTitle>
                        <CardDescription>Manage your connected social media accounts.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        {platforms.map(p => (
                            <Card key={p.id} className="bg-background/50">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base font-medium flex items-center gap-2">{p.icon}{p.name}</CardTitle>
                                    <Badge variant="default" className="bg-green-500/80 text-white">Connected</Badge>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">@lingolancers_ai</p>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="destructive" size="sm">Disconnect</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

    

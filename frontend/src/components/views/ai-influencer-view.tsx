

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Users, BarChart2, TrendingUp, DollarSign, Link as LinkIcon, Scissors, Sparkles, User as UserIcon, Clapperboard, Upload } from "lucide-react";
import Image from "next/image";


const chartData = [
  { month: "Jan", followers: 4000 },
  { month: "Feb", followers: 3000 },
  { month: "Mar", followers: 2000 },
  { month: "Apr", followers: 2780 },
  { month: "May", followers: 1890 },
  { month: "Jun", followers: 2390 },
]

const chartConfig = {
  followers: {
    label: "Followers",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function AiInfluencerView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "dashboard");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="p-4 md:p-6 h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto">
                <TabsTrigger value="dashboard"><BarChart2 className="mr-2 h-4 w-4" />Dashboard</TabsTrigger>
                <TabsTrigger value="url-to-video"><LinkIcon className="mr-2 h-4 w-4" />URL to Video</TabsTrigger>
                <TabsTrigger value="viral-clips"><Scissors className="mr-2 h-4 w-4" />Viral Clips</TabsTrigger>
                <TabsTrigger value="avatar-studio"><UserIcon className="mr-2 h-4 w-4" />Avatar Studio</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="flex-1 mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:animate-gradient bg-[length:400%_400%]"></div>
                        <Card className="relative bg-card/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1.2M</div>
                                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                            </CardContent>
                        </Card>
                    </div>
                     <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:animate-gradient bg-[length:400%_400%]"></div>
                        <Card className="relative bg-card/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12.5%</div>
                                <p className="text-xs text-muted-foreground">+2% from last month</p>
                            </CardContent>
                        </Card>
                    </div>
                     <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:animate-gradient bg-[length:400%_400%]"></div>
                        <Card className="relative bg-card/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Content Reach</CardTitle>
                                <BarChart2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">5.8M</div>
                                <p className="text-xs text-muted-foreground">Across all posts this month</p>
                            </CardContent>
                        </Card>
                    </div>
                     <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:animate-gradient bg-[length:400%_400%]"></div>
                        <Card className="relative bg-card/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$15,231.89</div>
                                <p className="text-xs text-muted-foreground">+35% from last month</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                 <div className="mt-6 grid gap-6 md:grid-cols-2">
                     <Card className="bg-card/50">
                        <CardHeader>
                            <CardTitle>Follower Growth</CardTitle>
                            <CardDescription>Follower trend over the last 6 months.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <LineChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                 <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="followers" stroke="var(--color-followers)" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50">
                        <CardHeader>
                            <CardTitle>Recent Viral Content</CardTitle>
                            <CardDescription>Your top performing AI-generated clips.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-2 rounded-md bg-background/50">
                                <div className="aspect-square w-20 bg-muted rounded-md overflow-hidden relative">
                                    <Image src="https://picsum.photos/seed/vid1/200/200" layout="fill" objectFit="cover" alt="Video thumbnail" data-ai-hint="futuristic city" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">"AI's take on the future of cities"</p>
                                    <p className="text-xs text-muted-foreground">1.2M Views - 150k Likes - 8.2k Comments</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-2 rounded-md bg-background/50">
                                <div className="aspect-square w-20 bg-muted rounded-md overflow-hidden relative">
                                     <Image src="https://picsum.photos/seed/vid2/200/200" layout="fill" objectFit="cover" alt="Video thumbnail" data-ai-hint="glowing forest" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">"What if forests could glow?"</p>
                                    <p className="text-xs text-muted-foreground">890k Views - 120k Likes - 6.1k Comments</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="url-to-video" className="flex-1 mt-6">
                <Card className="max-w-4xl mx-auto bg-card/50">
                    <CardHeader>
                        <CardTitle>URL to Video Converter</CardTitle>
                        <CardDescription>Transform any article, blog post, or webpage into an engaging video.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="video-url">Page URL</Label>
                            <Input id="video-url" placeholder="https://example.com/blog/my-awesome-article" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="video-style">Video Style</Label>
                                <Select>
                                    <SelectTrigger id="video-style"><SelectValue placeholder="Select a style" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="documentary">Documentary</SelectItem>
                                        <SelectItem value="explainer">Animated Explainer</SelectItem>
                                        <SelectItem value="news">News Report</SelectItem>
                                        <SelectItem value="cinematic">Cinematic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="video-voice">Voiceover</Label>
                                <Select>
                                    <SelectTrigger id="video-voice"><SelectValue placeholder="Select a voice" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="alloy">Alloy (Male)</SelectItem>
                                        <SelectItem value="nova">Nova (Female)</SelectItem>
                                        <SelectItem value="shimmer">Shimmer (Female)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button size="lg" className="w-full animated-gradient-border bg-transparent text-white">
                            <Sparkles className="mr-2 h-4 w-4" /> Generate Video
                        </Button>
                         <div className="aspect-video bg-background/50 rounded-lg flex items-center justify-center text-muted-foreground">
                            <Clapperboard className="h-12 w-12" />
                            <p className="ml-4">Your generated video will appear here</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="viral-clips" className="flex-1 mt-6">
                <Card className="max-w-4xl mx-auto bg-card/50">
                    <CardHeader>
                        <CardTitle>AI Viral Clip Finder</CardTitle>
                        <CardDescription>Upload a long video, and let our AI find the most shareable moments.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Card className="border-dashed border-2 p-8 flex flex-col items-center justify-center text-center">
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">Drag & drop your long-form video or click to upload</p>
                            <p className="text-xs text-muted-foreground/80">MP4, MOV, AVI up to 1GB</p>
                            <Button variant="outline" size="sm" className="mt-4">Browse Files</Button>
                        </Card>
                         <Button size="lg" className="w-full animated-gradient-border bg-transparent text-white">
                            <Scissors className="mr-2 h-4 w-4" /> Find Viral Clips
                        </Button>
                        <div className="space-y-2">
                             <h3 className="font-semibold">Generated Clips:</h3>
                             <div className="min-h-[200px] bg-background/50 rounded-lg flex items-center justify-center text-muted-foreground">
                                <p>Potential viral clips will be shown here after analysis.</p>
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="avatar-studio" className="flex-1 mt-6">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                         <Card className="bg-card/50 h-full">
                            <CardHeader>
                                <CardTitle>Avatar Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-full">
                                <div className="w-[400px] h-[400px] bg-background/50 rounded-lg flex items-center justify-center">
                                    <Image src="https://picsum.photos/seed/avatar1/400/400" width={400} height={400} alt="Avatar preview" className="rounded-lg" data-ai-hint="female portrait" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                         <Card className="bg-card/50">
                            <CardHeader>
                                <CardTitle>Customize Avatar</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea placeholder="Describe the appearance of your influencer... e.g. 'A futuristic female character with neon blue hair and cybernetic eyes'" className="h-32" />
                                <Button className="w-full"><Sparkles className="mr-2 h-4 w-4"/>Generate New Avatar</Button>                            </CardContent>
                        </Card>
                        <Card className="bg-card/50">
                            <CardHeader>
                                <CardTitle>Avatar Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="space-y-2">
                                    <Label>Background</Label>
                                    <Input placeholder="e.g. 'A neon-lit Tokyo street'" />
                               </div>
                               <div className="space-y-2">
                                    <Label>Style</Label>
                                     <Select>
                                        <SelectTrigger><SelectValue placeholder="Photorealistic" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="photorealistic">Photorealistic</SelectItem>
                                            <SelectItem value="anime">Anime</SelectItem>
                                            <SelectItem value="3d-cartoon">3D Cartoon</SelectItem>
                                            <SelectItem value="fantasy-art">Fantasy Art</SelectItem>
                                        </SelectContent>
                                    </Select>
                               </div>
                                <Button variant="outline" className="w-full">Update Settings</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}



"use client";

import React, { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Users, Activity, Target, Settings, GitBranch, BookUser, Mail, LayoutDashboard, PlusCircle, Filter, Bell, UserCheck, Languages, BrainCircuit, Bot, Clock } from "lucide-react";
import { Whatsapp, Telegram } from "@/components/icons";
import { Switch } from "../ui/switch";


const chartData = [
  { date: "2024-05-01", messages: 234 },
  { date: "2024-05-02", messages: 289 },
  { date: "2024-05-03", messages: 312 },
  { date: "2024-05-04", messages: 354 },
  { date: "2024-05-05", messages: 321 },
  { date: "2024-05-06", messages: 410 },
  { date: "2024-05-07", messages: 380 },
];

const chartConfig = {
  messages: {
    label: "Messages",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const recentMessages = [
    { name: "John Doe", message: "Hi, I'm interested in your services.", channel: "Whatsapp", time: "5m ago" },
    { name: "Jane Smith", message: "Can you provide more details on pricing?", channel: "Telegram", time: "12m ago" },
    { name: "Alex Johnson", message: "Thank you for the quick response!", channel: "Whatsapp", time: "28m ago" },
]

const campaigns = [
    { name: "New User Welcome", status: "Active", subscribers: 1200, sent: 3600, openRate: "85%" },
    { name: "Holiday Promotion", status: "Finished", subscribers: 5000, sent: 5000, openRate: "72%" },
    { name: "Re-engagement Push", status: "Draft", subscribers: 850, sent: 0, openRate: "N/A" },
]

export default function MarketingBotView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "dashboard");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="p-4 md:p-6 h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-6 max-w-5xl mx-auto">
                <TabsTrigger value="dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</TabsTrigger>
                <TabsTrigger value="inbox"><Mail className="mr-2 h-4 w-4" />Inbox</TabsTrigger>
                <TabsTrigger value="campaigns"><Target className="mr-2 h-4 w-4" />Campaigns</TabsTrigger>
                <TabsTrigger value="channels"><GitBranch className="mr-2 h-4 w-4" />Channels</TabsTrigger>
                <TabsTrigger value="contacts"><BookUser className="mr-2 h-4 w-4" />Contacts</TabsTrigger>
                <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="flex-1 mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-card/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">Running automations</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12,543</div>
                            <p className="text-xs text-muted-foreground">+250 this week</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Messages Sent (24h)</CardTitle>
                            <Send className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">5,281</div>
                            <p className="text-xs text-muted-foreground">Across all campaigns</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">78.6%</div>
                            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                        </CardContent>
                    </Card>
                </div>
                 <div className="mt-6">
                     <Card className="bg-card/50">
                        <CardHeader>
                            <CardTitle>Message Volume</CardTitle>
                            <CardDescription>Messages sent in the last 7 days.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="messages" fill="var(--color-messages)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="inbox" className="flex-1 mt-6">
                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle>Unified Inbox</CardTitle>
                        <CardDescription>All your conversations in one place.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Last Message</TableHead>
                                    <TableHead>Channel</TableHead>
                                    <TableHead>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentMessages.map(msg => (
                                <TableRow key={msg.name} className="cursor-pointer hover:bg-muted/30">
                                    <TableCell className="font-medium">{msg.name}</TableCell>
                                    <TableCell>{msg.message}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                            {msg.channel === "Whatsapp" ? <Whatsapp className="w-3 h-3 text-green-500" /> : <Telegram className="w-3 h-3 text-sky-500" />}
                                            {msg.channel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{msg.time}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="flex-1 mt-6">
                <Card className="bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Marketing Campaigns</CardTitle>
                            <CardDescription>Create, monitor, and manage your automated campaigns.</CardDescription>
                        </div>
                        <Button><PlusCircle className="mr-2 h-4 w-4"/> New Campaign</Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaign Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Subscribers</TableHead>
                                    <TableHead>Sent</TableHead>
                                    <TableHead>Open Rate</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.map(c => (
                                    <TableRow key={c.name}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={c.status === "Active" ? "default" : c.status === "Draft" ? "secondary" : "outline"} className={c.status === "Active" ? "bg-green-500/80 text-white" : ""}>{c.status}</Badge>
                                        </TableCell>
                                        <TableCell>{c.subscribers.toLocaleString()}</TableCell>
                                        <TableCell>{c.sent.toLocaleString()}</TableCell>
                                        <TableCell>{c.openRate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="channels" className="flex-1 mt-6">
                 <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle>Connected Channels</CardTitle>
                        <CardDescription>Manage your connections to WhatsApp and Telegram.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-background/50">
                             <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <CardTitle className="text-lg font-medium flex items-center gap-2"><Whatsapp className="w-6 h-6 text-green-500"/>WhatsApp</CardTitle>
                                <Badge variant="default" className="bg-green-500/80 text-white">Connected</Badge>
                            </CardHeader>
                            <CardContent>
                                <Label htmlFor="whatsapp-number">Connected Number</Label>
                                <Input id="whatsapp-number" readOnly value="+1 (555) 123-4567" />
                            </CardContent>
                            <CardFooter>
                                <Button variant="destructive">Disconnect</Button>
                            </CardFooter>
                        </Card>
                         <Card className="bg-background/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <CardTitle className="text-lg font-medium flex items-center gap-2"><Telegram className="w-6 h-6 text-sky-500"/>Telegram</CardTitle>
                                <Badge variant="secondary">Not Connected</Badge>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Label htmlFor="telegram-token">Bot Token</Label>
                                <Input id="telegram-token" placeholder="Enter your Telegram bot token" />
                            </CardContent>
                            <CardFooter>
                                <Button>Connect</Button>
                            </CardFooter>
                        </Card>
                    </CardContent>
                 </Card>
            </TabsContent>

             <TabsContent value="contacts" className="flex-1 mt-6">
                <Card className="bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Contact Lists</CardTitle>
                            <CardDescription>Manage your subscriber lists and segments.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline"><Filter className="mr-2 h-4 w-4"/>Filter</Button>
                             <Button><PlusCircle className="mr-2 h-4 w-4"/> New List</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>List Name</TableHead>
                                    <TableHead>Subscribers</TableHead>
                                    <TableHead>Date Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">All Subscribers</TableCell>
                                    <TableCell>12,543</TableCell>
                                    <TableCell>2023-01-15</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">US Customers</TableCell>
                                    <TableCell>4,821</TableCell>
                                    <TableCell>2023-03-22</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Newsletter Signups</TableCell>
                                    <TableCell>8,112</TableCell>
                                    <TableCell>2023-02-01</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 mt-6">
                <Card className="bg-card/50 max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>Marketing Bot Settings</CardTitle>
                        <CardDescription>Configure the core behavior and rules for your marketing bot.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium font-headline flex items-center gap-2"><Settings className="w-5 h-5"/> General Settings</h3>
                            <div className="grid md:grid-cols-2 gap-6 p-4 border rounded-lg">
                                <div className="space-y-2">
                                    <Label htmlFor="bot-name-setting">Bot Name</Label>
                                    <Input id="bot-name-setting" defaultValue="LingoLancers Marketing Bot" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bot-language">Default Language</Label>
                                    <Select defaultValue="en">
                                        <SelectTrigger id="bot-language"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                            <SelectItem value="de">German</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="bot-timezone">Timezone</Label>
                                    <Select defaultValue="gmt-5">
                                        <SelectTrigger id="bot-timezone"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gmt-8">GMT-8 (Pacific Time)</SelectItem>
                                            <SelectItem value="gmt-5">GMT-5 (Eastern Time)</SelectItem>
                                            <SelectItem value="gmt">GMT (Greenwich Mean Time)</SelectItem>
                                            <SelectItem value="gmt+1">GMT+1 (Central European Time)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bot-model">AI Model</Label>
                                    <Select defaultValue="gemini-2.5-flash">
                                        <SelectTrigger id="bot-model"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium font-headline flex items-center gap-2"><Bot className="w-5 h-5"/> Default Behavior</h3>
                            <div className="p-4 border rounded-lg space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="system-prompt">System Prompt</Label>
                                    <Textarea id="system-prompt" placeholder="Define the bot's personality and goals..." className="h-28" defaultValue="You are a friendly and helpful marketing assistant for LingoLancers. Your goal is to answer user questions and guide them to the right resources." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="welcome-message">Welcome Message</Label>
                                    <Input id="welcome-message" placeholder="e.g., 'Thanks for subscribing! How can I help you today?'" defaultValue="Welcome! Thanks for reaching out." />
                                    <p className="text-xs text-muted-foreground">This message is sent to a new contact after they subscribe.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="unsubscribe-message">Unsubscribe Confirmation</Label>
                                    <Input id="unsubscribe-message" placeholder="e.g., 'You've been unsubscribed.'" defaultValue="You have successfully been unsubscribed. We're sorry to see you go!" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium font-headline flex items-center gap-2"><UserCheck className="w-5 h-5"/> Human Handoff</h3>
                             <div className="p-4 border rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="enable-handoff">Enable Human Handoff</Label>
                                        <p className="text-xs text-muted-foreground">Allow conversations to be passed to a live agent.</p>
                                    </div>
                                    <Switch id="enable-handoff" defaultChecked />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="handoff-keywords">Handoff Keywords</Label>
                                    <Input id="handoff-keywords" placeholder="e.g., talk to human, agent, support" defaultValue="help, agent, support, human, representative" />
                                    <p className="text-xs text-muted-foreground">The bot will trigger a handoff if a user's message includes one of these keywords.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                             <h3 className="text-lg font-medium font-headline flex items-center gap-2"><Bell className="w-5 h-5"/> Notifications</h3>
                             <div className="p-4 border rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="notify-new-subscriber">New Subscriber</Label>
                                        <p className="text-xs text-muted-foreground">Notify when a new contact subscribes.</p>
                                    </div>
                                    <Switch id="notify-new-subscriber" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="notify-handoff">Handoff Request</Label>
                                        <p className="text-xs text-muted-foreground">Notify when a user requests a human agent.</p>
                                    </div>
                                    <Switch id="notify-handoff" defaultChecked />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notification-email">Notification Email</Label>
                                    <Input id="notification-email" type="email" placeholder="admin@example.com" defaultValue="support@lingolancers.ai" />
                                </div>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter>
                        <Button size="lg" className="ml-auto">Save Settings</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

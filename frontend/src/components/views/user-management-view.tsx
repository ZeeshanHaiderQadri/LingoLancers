

"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, BarChart as BarChartIcon, Trash2, Shield, PlusCircle, Search, CreditCard, Bot, Eye, Edit } from "lucide-react";
import { Checkbox } from '../ui/checkbox';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Label } from '../ui/label';

const users = [
    { id: 'usr_1', name: "Olivia Martin", email: "olivia.martin@email.com", role: "Pro User", status: "Active", lastLogin: "2024-09-30", credits: "1.2M/5M", plan: "Pro" },
    { id: 'usr_2', name: "Jackson Lee", email: "jackson.lee@email.com", role: "Team Owner", status: "Active", lastLogin: "2024-09-29", credits: "10.5M/20M", plan: "Team" },
    { id: 'usr_3', name: "Isabella Nguyen", email: "isabella.nguyen@email.com", role: "Pro User", status: "Active", lastLogin: "2024-09-29", credits: "4.8M/5M", plan: "Pro" },
    { id: 'usr_4', name: "William Kim", email: "will@email.com", role: "Free User", status: "Inactive", lastLogin: "2024-09-28", credits: "50k/100k", plan: "Free" },
    { id: 'usr_5', name: "Sofia Davis", email: "sofia.davis@email.com", role: "Pro User", status: "Active", lastLogin: "2024-09-27", credits: "3.1M/5M", plan: "Pro" },
    { id: 'usr_6', name: "Liam Brown", email: "liam.brown@email.com", role: "Admin", status: "Active", lastLogin: "2024-09-30", credits: "N/A", plan: "Admin" },
];

const UsersListTab = () => {
    return (
        <Card className="bg-card/50">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>A list of all users in your platform.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input placeholder="Search users..." className="w-64" />
                        <Button variant="outline"><Search className="mr-2 h-4 w-4" /> Search</Button>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add User</Button>
                    </div>
                 </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Checkbox /></TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell><Checkbox /></TableCell>
                                <TableCell>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                </TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    <Badge variant={user.status === "Active" ? "default" : "secondary"} className={user.status === "Active" ? "bg-green-500/80 text-white" : ""}>{user.status}</Badge>
                                </TableCell>
                                <TableCell>{user.lastLogin}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const UserActivityTab = () => {
    const activities = [
        { user: "Olivia Martin", action: "Generated Content", details: "AI Writer: 'The Future of AI'", ip: "192.168.1.1", time: "2m ago" },
        { user: "Jackson Lee", action: "Upgraded Plan", details: "Free -> Team Plan", ip: "203.0.113.25", time: "1h ago" },
        { user: "William Kim", action: "User Login", details: "Successful login", ip: "198.51.100.12", time: "3h ago" },
        { user: "Isabella Nguyen", action: "Generated Image", details: "Creative Suite: 'A cat in space'", ip: "192.0.2.8", time: "5h ago" },
        { user: "Sofia Davis", action: "API Key Created", details: "Key: 'prod_...'", ip: "203.0.113.40", time: "8h ago" },
    ];
    return (
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>User Activity Stream</CardTitle>
                <CardDescription>A real-time log of important user actions across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((activity, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{activity.user}</TableCell>
                                <TableCell><Badge variant="outline">{activity.action}</Badge></TableCell>
                                <TableCell>{activity.details}</TableCell>
                                <TableCell>{activity.ip}</TableCell>
                                <TableCell className="text-muted-foreground">{activity.time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const activityChartData = [
  { date: "09-24", actions: 35 },
  { date: "09-25", actions: 42 },
  { date: "09-26", actions: 68 },
  { date: "09-27", actions: 55 },
  { date: "09-28", actions: 89 },
  { date: "09-29", actions: 73 },
  { date: "09-30", actions: 95 },
];
const activityChartConfig = { actions: { label: "Actions", color: "hsl(var(--primary))" } } satisfies ChartConfig;

const UserDashboardTab = () => {
    return (
        <div className="space-y-6">
            <Card className="bg-card/50">
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>User Dashboard</CardTitle>
                        <CardDescription>View detailed analytics for a specific user.</CardDescription>
                    </div>
                    <div className="w-64">
                         <Select defaultValue="usr_1">
                            <SelectTrigger><SelectValue placeholder="Select a user..." /></SelectTrigger>
                            <SelectContent>
                                {users.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-card/50"><CardHeader><CardTitle>AI Credits Used</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">1.2M / 5M</div></CardContent></Card>
                <Card className="bg-card/50"><CardHeader><CardTitle>Logins (30 Days)</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">28</div></CardContent></Card>
                <Card className="bg-card/50"><CardHeader><CardTitle>Plan</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">Pro User</div></CardContent></Card>
            </div>
             <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={activityChartConfig} className="h-64 w-full">
                        <AreaChart data={activityChartData}>
                            <defs><linearGradient id="fillActions" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-actions)" stopOpacity={0.8}/><stop offset="95%" stopColor="var(--color-actions)" stopOpacity={0.1}/></linearGradient></defs>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area dataKey="actions" type="natural" fill="url(#fillActions)" stroke="var(--color-actions)" />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
};

const DeletionRequestsTab = () => {
    const requests = [
        { id: 'del_1', user: "John Carter", email: "john.carter@example.com", requestDate: "2024-09-25" },
        { id: 'del_2', user: "Emily Thorne", email: "emily.t@example.com", requestDate: "2024-09-22" },
    ];
    return (
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>Account Deletion Requests</CardTitle>
                <CardDescription>Review and process user requests to delete their account and data.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Request Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell>
                                    <div className="font-medium">{req.user}</div>
                                    <div className="text-sm text-muted-foreground">{req.email}</div>
                                </TableCell>
                                <TableCell>{req.requestDate}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="destructive">Approve Deletion</Button>
                                    <Button variant="outline">Deny</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
    );
};

const PermissionsTab = () => {
    return (
     <Card className="bg-card/50">
        <CardHeader>
            <CardTitle>User Entitlements</CardTitle>
            <CardDescription>Manage individual user plans, credits, and package enhancements.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Current Plan</TableHead>
                        <TableHead>Credit Usage</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </TableCell>
                            <TableCell><Badge variant={user.plan === "Admin" ? "destructive" : "secondary"}>{user.plan}</Badge></TableCell>
                            <TableCell>{user.credits}</TableCell>
                            <TableCell className="text-right">
                                {user.plan !== "Admin" && (
                                    <Button variant="outline" size="sm">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Manage
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
        </CardContent>
    </Card>
    );
};

export default function UserManagementView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "users-list");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users-list"><Users className="mr-2 h-4 w-4"/>Users List</TabsTrigger>
            <TabsTrigger value="user-activity"><Activity className="mr-2 h-4 w-4"/>User Activity</TabsTrigger>
            <TabsTrigger value="user-dashboard"><BarChartIcon className="mr-2 h-4 w-4"/>User Dashboard</TabsTrigger>
            <TabsTrigger value="deletion-requests"><Trash2 className="mr-2 h-4 w-4"/>Deletion Requests</TabsTrigger>
            <TabsTrigger value="permissions"><Shield className="mr-2 h-4 w-4"/>Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="users-list" className="mt-6"><UsersListTab /></TabsContent>
        <TabsContent value="user-activity" className="mt-6"><UserActivityTab /></TabsContent>
        <TabsContent value="user-dashboard" className="mt-6"><UserDashboardTab /></TabsContent>
        <TabsContent value="deletion-requests" className="mt-6"><DeletionRequestsTab /></TabsContent>
        <TabsContent value="permissions" className="mt-6"><PermissionsTab /></TabsContent>
    </Tabs>
  );
}

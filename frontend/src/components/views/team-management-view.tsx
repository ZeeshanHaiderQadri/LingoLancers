
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Code2, PenSquare, LifeBuoy, Shield, PlusCircle, Trash2, Edit } from "lucide-react";
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

const teamMembers = [
    { id: 'tm_1', name: "Alex Ray", email: "alex.ray@lingolancers.ai", role: "Team Lead", team: "Developers", status: "Online" },
    { id: 'tm_2', name: "Jordan Smith", email: "jordan.smith@lingolancers.ai", role: "Frontend Developer", team: "Developers", status: "Online" },
    { id: 'tm_3', name: "Casey Miller", email: "casey.miller@lingolancers.ai", role: "Content Strategist", team: "Marketers", status: "Away" },
    { id: 'tm_4', name: "Taylor Green", email: "taylor.green@lingolancers.ai", role: "Support Specialist", team: "Support", status: "Offline" },
    { id: 'tm_5', name: "Morgan Jones", email: "morgan.jones@lingolancers.ai", role: "Backend Developer", team: "Developers", status: "Online" },
    { id: 'tm_6', name: "Jamie Lane", email: "jamie.lane@lingolancers.ai", role: "SEO Specialist", team: "Marketers", status: "Online" },
];

const MemberTable = ({ members, title, description }: { members: typeof teamMembers, title: string, description: string }) => (
    <Card className="bg-card/50">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    <Input placeholder="Search members..." className="w-64" />
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Member</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Checkbox /></TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell><Checkbox /></TableCell>
                            <TableCell>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-muted-foreground">{member.email}</div>
                            </TableCell>
                            <TableCell>{member.role}</TableCell>
                            <TableCell>{member.team}</TableCell>
                            <TableCell>
                                <Badge variant={member.status === "Online" ? "default" : "secondary"} className={member.status === "Online" ? "bg-green-500/80 text-white" : ""}>{member.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const RolesTab = () => {
    const roles = [
        { name: "Team Lead", permissions: ["Manage Users", "Manage Teams", "Edit Content", "View Analytics"] },
        { name: "Developer", permissions: ["Commit Code", "Deploy Staging", "View Analytics"] },
        { name: "Marketer", permissions: ["Edit Content", "Manage Campaigns", "View Analytics"] },
        { name: "Support Agent", permissions: ["Respond to Tickets", "View User Info"] },
    ];
    const [selectedRole, setSelectedRole] = useState(roles[0]);

    return (
        <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 bg-card/50">
                <CardHeader>
                    <CardTitle>Team Roles</CardTitle>
                    <CardDescription>Click a role to see its permissions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {roles.map(role => (
                        <Button
                            key={role.name}
                            variant={selectedRole.name === role.name ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setSelectedRole(role)}
                        >
                            {role.name}
                        </Button>
                    ))}
                    <Button variant="outline" className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> New Role</Button>
                </CardContent>
            </Card>
            <Card className="md:col-span-2 bg-card/50">
                 <CardHeader>
                    <CardTitle>Permissions for {selectedRole.name}</CardTitle>
                    <CardDescription>Select the permissions for this role.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    {selectedRole.permissions.map(permission => (
                        <div key={permission} className="flex items-center space-x-2">
                            <Checkbox id={permission} defaultChecked />
                            <Label htmlFor={permission} className="font-normal">{permission}</Label>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default function TeamManagementView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "team-members");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="team-members"><Users className="mr-2 h-4 w-4"/>All Members</TabsTrigger>
            <TabsTrigger value="developers"><Code2 className="mr-2 h-4 w-4"/>Developers</TabsTrigger>
            <TabsTrigger value="marketers"><PenSquare className="mr-2 h-4 w-4"/>Marketers</TabsTrigger>
            <TabsTrigger value="support"><LifeBuoy className="mr-2 h-4 w-4"/>Support</TabsTrigger>
            <TabsTrigger value="team-roles"><Shield className="mr-2 h-4 w-4"/>Roles & Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="team-members" className="mt-6">
            <MemberTable members={teamMembers} title="All Team Members" description="An overview of everyone on your team." />
        </TabsContent>
        <TabsContent value="developers" className="mt-6">
            <MemberTable members={teamMembers.filter(m => m.team === 'Developers')} title="Developer Team" description="All members of the development department." />
        </TabsContent>
        <TabsContent value="marketers" className="mt-6">
            <MemberTable members={teamMembers.filter(m => m.team === 'Marketers')} title="Marketing Team" description="All members of the marketing department." />
        </TabsContent>
        <TabsContent value="support" className="mt-6">
            <MemberTable members={teamMembers.filter(m => m.team === 'Support')} title="Support Team" description="All members of the support department." />
        </TabsContent>
        <TabsContent value="team-roles" className="mt-6">
            <RolesTab />
        </TabsContent>
    </Tabs>
  );
}

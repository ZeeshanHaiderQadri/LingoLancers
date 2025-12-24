"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Plus, 
  Shield,
  Users,
  User,
  Key,
  Eye,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PermissionsTab = () => {
  // Mock data for roles
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Administrator',
      description: 'Full access to all system features',
      users: 3,
      permissions: 'All permissions',
    },
    {
      id: 2,
      name: 'Moderator',
      description: 'Can manage content and users',
      users: 8,
      permissions: 'Content & User Management',
    },
    {
      id: 3,
      name: 'User',
      description: 'Standard user with limited access',
      users: 1240,
      permissions: 'Basic Access',
    },
    {
      id: 4,
      name: 'Guest',
      description: 'Read-only access to public content',
      users: 0,
      permissions: 'Read Only',
    },
  ]);

  // Mock data for permissions
  const [permissions, setPermissions] = useState([
    { id: 1, name: 'View Dashboard', description: 'Access to view dashboard statistics', role: 'Administrator, Moderator, User' },
    { id: 2, name: 'Manage Users', description: 'Create, edit, and delete user accounts', role: 'Administrator, Moderator' },
    { id: 3, name: 'Content Creation', description: 'Create and publish content', role: 'Administrator, Moderator, User' },
    { id: 4, name: 'Agent Management', description: 'Create, edit, and delete AI agents', role: 'Administrator, Moderator' },
    { id: 5, name: 'System Settings', description: 'Modify system configuration and settings', role: 'Administrator' },
    { id: 6, name: 'Billing Access', description: 'View and manage billing information', role: 'Administrator' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Permissions</h2>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              className="pl-8 w-full md:w-64"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      </div>

      {/* Roles Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {role.name}
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{role.users}</div>
              <p className="text-xs text-muted-foreground">
                {role.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>
            Define and manage user roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="font-medium">{role.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground">{role.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-muted-foreground mr-2" />
                      {role.users}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.permissions}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Permissions</CardTitle>
          <CardDescription>
            Manage individual permissions and their assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Assigned Roles</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>
                    <div className="font-medium">{permission.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground">{permission.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {permission.role.split(', ').map((role, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch defaultChecked />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permission Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Settings</CardTitle>
          <CardDescription>
            Configure global permission settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Default Role for New Users</Label>
              <p className="text-sm text-muted-foreground">
                Role assigned to users when they register
              </p>
            </div>
            <Select defaultValue="user">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for administrator roles
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Permission Logging</Label>
              <p className="text-sm text-muted-foreground">
                Log all permission changes for audit purposes
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsTab;
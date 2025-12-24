"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  User, 
  Users,
  Shield,
  Edit,
  Trash2,
  Check,
  X
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

const TeamRolesTab = () => {
  // Mock data for roles
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Administrator',
      description: 'Full access to all system features and settings',
      members: 3,
      permissions: ['All permissions'],
    },
    {
      id: 2,
      name: 'Manager',
      description: 'Can manage team members and content',
      members: 8,
      permissions: ['User Management', 'Content Creation', 'View Reports'],
    },
    {
      id: 3,
      name: 'Editor',
      description: 'Can create and edit content',
      members: 15,
      permissions: ['Content Creation', 'Content Editing'],
    },
    {
      id: 4,
      name: 'Viewer',
      description: 'Read-only access to content',
      members: 42,
      permissions: ['View Content'],
    },
  ]);

  // Mock data for team members
  const [teamMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@company.com', role: 'Administrator' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', role: 'Manager' },
    { id: 3, name: 'Mike Johnson', email: 'mike.johnson@company.com', role: 'Editor' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@company.com', role: 'Viewer' },
  ]);

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editRoleData, setEditRoleData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const availablePermissions = [
    'User Management',
    'Content Creation',
    'Content Editing',
    'Content Deletion',
    'View Reports',
    'System Settings',
    'Billing Access',
    'Agent Management',
    'Workflow Management',
    'View Content',
  ];

  const handleCreateRole = () => {
    if (!newRole.name || !newRole.description) {
      // Mock validation
      return;
    }

    const role = {
      id: roles.length + 1,
      name: newRole.name,
      description: newRole.description,
      members: 0,
      permissions: newRole.permissions,
    };

    setRoles([...roles, role]);
    setNewRole({
      name: '',
      description: '',
      permissions: [],
    });
    setIsCreatingRole(false);
  };

  const handleEditRole = (role: typeof roles[0]) => {
    setEditingRoleId(role.id);
    setEditRoleData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
  };

  const handleSaveEdit = (roleId: number) => {
    setRoles(roles.map(role => 
      role.id === roleId 
        ? { ...role, ...editRoleData } 
        : role
    ));
    setEditingRoleId(null);
  };

  const handleCancelEdit = () => {
    setEditingRoleId(null);
  };

  const handleDeleteRole = (roleId: number) => {
    setRoles(roles.filter(role => role.id !== roleId));
  };

  const togglePermission = (permission: string, isEditing = false) => {
    if (isEditing) {
      setEditRoleData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    } else {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Roles</h2>
          <p className="text-muted-foreground">
            Manage roles and permissions for your team
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              className="pl-8 w-full md:w-64"
            />
          </div>
          <Button onClick={() => setIsCreatingRole(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              Active roles in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              Total team members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availablePermissions.length}</div>
            <p className="text-xs text-muted-foreground">
              Available permissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Role Form */}
      {isCreatingRole && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Role</CardTitle>
            <CardDescription>
              Define a new role with specific permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  placeholder="Enter role name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  placeholder="Enter role description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`permission-${permission}`}
                        checked={newRole.permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        className="mr-2"
                      />
                      <Label htmlFor={`permission-${permission}`} className="font-normal">
                        {permission}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateRole}>
                  <Check className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
                <Button variant="outline" onClick={() => setIsCreatingRole(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Roles</CardTitle>
          <CardDescription>
            Manage roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  {editingRoleId === role.id ? (
                    <>
                      <TableCell>
                        <Input
                          value={editRoleData.name}
                          onChange={(e) => setEditRoleData({...editRoleData, name: e.target.value})}
                          className="font-medium"
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={editRoleData.description}
                          onChange={(e) => setEditRoleData({...editRoleData, description: e.target.value})}
                          className="text-muted-foreground"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-muted-foreground mr-2" />
                          {role.members}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="grid gap-1 md:grid-cols-2">
                            {availablePermissions.map((permission) => (
                              <div key={permission} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`edit-permission-${permission}`}
                                  checked={editRoleData.permissions.includes(permission)}
                                  onChange={() => togglePermission(permission, true)}
                                  className="mr-2"
                                />
                                <Label htmlFor={`edit-permission-${permission}`} className="font-normal text-xs">
                                  {permission}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(role.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        <div className="font-medium">{role.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground">{role.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-muted-foreground mr-2" />
                          {role.members}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteRole(role.id)}
                            disabled={role.members > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Role Assignment</CardTitle>
          <CardDescription>
            Assign roles to team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Assign Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {member.name}
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={member.role}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamRolesTab;
'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, MoreVertical, Search, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@heroui/skeleton';
import { toast } from 'sonner';
import ReactSelect from '@/components/Global/ReactSelect';

export default function MembersSettings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState({ value: 'all', label: 'All Roles' });
  const queryClient = useQueryClient();

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['teamMembers', searchQuery, roleFilter],
    queryFn: async () => {
      const { data } = await axios.get('/api/settings/member', {
        params: {
          search: searchQuery,
          role: roleFilter.value !== 'all' ? roleFilter.value : undefined,
        },
      });
      return data.teamMembers;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: string }) => {
      const response = await axios.put('/api/settings/member', { memberId, newRole });
      return response.data;
    },
    onSuccess: data => {
      toast.success(data.message || 'Member role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update member role');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await axios.delete(`/api/settings/member?memberId=${memberId}`);
      return response.data;
    },
    onSuccess: data => {
      toast.success(data.message || 'Member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const timeoutId = setTimeout(() => {
      setSearchQuery(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleRoleFilter = option => {
    setRoleFilter(
      (option as { value: string; label: string }) || { value: 'all', label: 'All Roles' }
    );
  };

  const handleUpdateRole = (memberId: string, newRole: string) => {
    updateRoleMutation.mutate({ memberId, newRole });
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      removeMemberMutation.mutate(memberId);
    }
  };

  return (
    <div className="space-y-6 px-4">
      <div>
        <h3 className="text-lg font-medium theme-text-primary">Team Members</h3>
        <p className="text-sm theme-text-secondary">Manage your team members and their roles</p>
      </div>
      <Separator className="theme-divider" />

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 theme-text-secondary" />
          <Input
            placeholder="Search members..."
            className="pl-8 theme-input theme-focus"
            onChange={handleSearch}
            defaultValue={searchQuery}
          />
        </div>
        <ReactSelect
          options={[
            { value: 'all', label: 'All Roles' },
            { value: 'Member', label: 'Member' },
            { value: 'viewer', label: 'Viewer' },
            { value: 'Owner', label: 'Owner' },
          ]}
          value={roleFilter}
          onChange={handleRoleFilter}
          placeholder="Filter by role"
          isSearchable={false}
          isClearable={false}
          className="w-48"
        />
      </div>

      {/* Members Table */}
      <Card className="theme-surface-elevated hover-reveal theme-transition">
        <CardHeader>
          <CardTitle className="theme-text-primary">Team Members</CardTitle>
          <CardDescription className="theme-text-secondary">
            Manage roles and access for your team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="theme-border border-b">
                <TableHead className="theme-text-primary">Member</TableHead>
                <TableHead className="theme-text-primary">Role</TableHead>
                <TableHead className="theme-text-primary">Status</TableHead>
                <TableHead className="text-right theme-text-primary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40 mt-1" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : teamMembers && teamMembers.length > 0 ? (
                teamMembers.map((team: any) =>
                  team.members.map((member: any) => (
                    <TableRow key={member.userId._id}>
                      <TableCell className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.userId.image} alt={member.userId.name} />
                          <AvatarFallback>{member.userId.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.userId.name}</p>
                          <p className="text-sm text-muted-foreground">{member.userId.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={member.role === 'Owner' ? 'default' : 'secondary'}
                          className="flex w-fit items-center gap-1"
                        >
                          {member.role === 'Owner' && <Shield className="h-3 w-3" />}
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="flex w-fit items-center gap-1">
                          <Check className="h-3 w-3" />
                          active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.role !== 'Owner' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateRole(
                                      member.userId._id,
                                      member.role === 'Member' ? 'Guest' : 'Member'
                                    )
                                  }
                                  disabled={updateRoleMutation.isPending}
                                >
                                  Change to {member.role === 'Member' ? 'Guest' : 'Member'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleRemoveMember(member.userId._id)}
                                  disabled={removeMemberMutation.isPending}
                                >
                                  Remove Member
                                </DropdownMenuItem>
                              </>
                            )}
                            {member.role === 'Owner' && (
                              <DropdownMenuItem disabled>Cannot modify owner</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No members found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mail,
  Edit,
  Eye,
  Copy,
  Plus,
  Trash2,
  Save,
  Loader2,
  TestTube,
  Download,
  Search,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ReactSelect from '@/components/Global/ReactSelect';
import { EmailTemplateService } from '@/services/EmailTemplate.service';
import { EmailTemplate, filterCategoryOptions } from '../../../../Schemas/EmailTemplate';
import CreateEmailTemplateModal from '@/components/EmailTemplate/CreateEmailTemplateModal';
import EmailTemplateEditor from '@/components/EmailTemplate/EmailTemplateEditor';
import TestEmailModal from '@/components/EmailTemplate/TestEmailModal';
import SMTPSettingsCard from '@/components/EmailTemplate/SMTPSettingsCard';

const fetchEmailTemplatesWithFallback = async (): Promise<EmailTemplate[]> => {
  try {
    return await EmailTemplateService.getEmailTemplates();
  } catch (error) {
    // API error, return empty array
    return [];
  }
};

export default function EmailTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const queryClient = useQueryClient();

  const {
    data: templates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['email-templates'],
    queryFn: fetchEmailTemplatesWithFallback,
  });

  const updateMutation = useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: Partial<EmailTemplate> }) =>
      EmailTemplateService.updateEmailTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template updated successfully');
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to update template', { description: error.message });
    },
  });

  const createMutation = useMutation({
    mutationFn: EmailTemplateService.createEmailTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template created successfully');
      setShowCreateDialog(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to create template', { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: EmailTemplateService.deleteEmailTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template deleted successfully');
      setShowDeleteDialog(false);
      setSelectedTemplate(null);
    },
    onError: (error: Error) => {
      toast.error('Failed to delete template', { description: error.message });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: EmailTemplateService.duplicateEmailTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template duplicated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to duplicate template', { description: error.message });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: EmailTemplateService.testEmailTemplate,
    onSuccess: () => {
      toast.success('Test email sent successfully');
      setShowTestDialog(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to send test email', { description: error.message });
    },
  });

  const exportMutation = useMutation({
    mutationFn: EmailTemplateService.exportTemplates,
    onSuccess: blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `email-templates-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Templates exported successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to export templates', { description: error.message });
    },
  });

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  React.useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates, selectedTemplate]);

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium theme-text-primary">Email Templates</h3>
          <p className="text-sm theme-text-secondary">
            Customize email notifications sent to your team members
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>
      <Separator className="theme-divider" />

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <ReactSelect
          options={filterCategoryOptions}
          value={filterCategoryOptions.find(option => option.value === selectedCategory) || null}
          onChange={option => setSelectedCategory((option as any)?.value || 'All')}
          placeholder="Filter by category"
          isSearchable={false}
          isClearable={false}
          className="w-48"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Templates List */}
        <div className="lg:col-span-1">
          <Card className="theme-surface-elevated">
            <CardHeader>
              <CardTitle className="text-base theme-text-primary flex items-center justify-between">
                Templates
                <Badge variant="outline" className="text-xs">
                  {filteredTemplates.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Failed to load templates</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Retry
                  </Button>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No templates found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    Create First Template
                  </Button>
                </div>
              ) : (
                filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <Badge
                        variant={template.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {template.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Modified{' '}
                      {template.lastModified instanceof Date
                        ? template.lastModified.toLocaleDateString()
                        : new Date(template.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card className="theme-surface-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="theme-text-primary">{selectedTemplate.name}</CardTitle>
                    <CardDescription className="theme-text-secondary">
                      {selectedTemplate.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowTestDialog(true)}>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Send
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateMutation.mutate(selectedTemplate.id)}
                      disabled={duplicateMutation.isPending}
                    >
                      {duplicateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Duplicate
                    </Button>
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{selectedTemplate.name}"? This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(selectedTemplate.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      variant={isEditing ? 'default' : 'outline'}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : isEditing ? (
                        <Save className="h-4 w-4 mr-2" />
                      ) : (
                        <Edit className="h-4 w-4 mr-2" />
                      )}
                      {isEditing ? 'Save' : 'Edit'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <EmailTemplateEditor
                  template={selectedTemplate}
                  isEditing={isEditing}
                  onSave={data => updateMutation.mutate({ templateId: selectedTemplate.id, data })}
                  isLoading={updateMutation.isPending}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="theme-surface-elevated">
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Template Selected</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a template from the list to view and edit its content
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Template Dialog */}
      <CreateEmailTemplateModal
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={data => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Test Email Dialog */}
      <TestEmailModal
        isOpen={showTestDialog}
        onClose={() => setShowTestDialog(false)}
        template={selectedTemplate}
        onSubmit={data => testEmailMutation.mutate(data)}
        isLoading={testEmailMutation.isPending}
      />

      {/* Email Settings */}
      <SMTPSettingsCard />
    </div>
  );
}

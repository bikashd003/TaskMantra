import {
  categoryOptions,
  EmailTemplate,
  emailTemplateSchema,
  statusOptions,
} from '@/Schemas/EmailTemplate';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Copy, Loader2 } from 'lucide-react';
import ReactSelect from '../Global/ReactSelect';
import { toast } from 'sonner';

const EmailTemplateEditor = ({
  template,
  isEditing,
  onSave,
  isLoading,
}: {
  template: EmailTemplate;
  isEditing: boolean;
  onSave: (data: Partial<EmailTemplate>) => void;
  isLoading: boolean;
}) => {
  const form = useForm<EmailTemplate>({
    resolver: yupResolver(emailTemplateSchema) as any,
    defaultValues: template,
  });

  React.useEffect(() => {
    form.reset(template);
  }, [template, form]);

  const handleSave = () => {
    const data = form.getValues();
    onSave(data);
  };

  return (
    <Form {...form}>
      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject Line</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditing} className={isEditing ? '' : 'bg-muted'} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Content</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={12}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-muted'}
                  />
                </FormControl>
                <FormDescription>
                  Use variables like {'{{'}
                  {'{'}user.name{'}'}
                  {'}'} to personalize emails
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => form.reset(template)}>
                Reset
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Status</FormLabel>
                  <FormControl>
                    <ReactSelect
                      options={statusOptions}
                      value={statusOptions.find(option => option.value === field.value) || null}
                      onChange={option => field.onChange((option as any)?.value)}
                      placeholder="Select status"
                      isSearchable={false}
                      isClearable={false}
                      isDisabled={!isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <ReactSelect
                      options={categoryOptions}
                      value={categoryOptions.find(option => option.value === field.value) || null}
                      onChange={option => field.onChange((option as any)?.value)}
                      placeholder="Select category"
                      isSearchable={false}
                      isClearable={false}
                      isDisabled={!isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fromName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={!isEditing}
                      className={isEditing ? '' : 'bg-muted'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fromEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={!isEditing}
                      className={isEditing ? '' : 'bg-muted'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Available Variables</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Click on any variable to copy it to your clipboard
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {template.variables?.map(variable => (
                <div
                  key={variable}
                  className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    navigator.clipboard.writeText(variable);
                    toast.success('Variable copied to clipboard');
                  }}
                >
                  <code className="text-sm font-mono">{variable}</code>
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Variable Descriptions</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <code>{'{{user.name}}'}</code>
                <span className="text-muted-foreground">Recipient's full name</span>
              </div>
              <div className="flex justify-between">
                <code>{'{{task.title}}'}</code>
                <span className="text-muted-foreground">Task title</span>
              </div>
              <div className="flex justify-between">
                <code>{'{{project.name}}'}</code>
                <span className="text-muted-foreground">Project name</span>
              </div>
              <div className="flex justify-between">
                <code>{'{{due_date}}'}</code>
                <span className="text-muted-foreground">Task due date</span>
              </div>
              <div className="flex justify-between">
                <code>{'{{organization.name}}'}</code>
                <span className="text-muted-foreground">Organization name</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Form>
  );
};

export default EmailTemplateEditor;

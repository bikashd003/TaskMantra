import { Loader2 } from 'lucide-react';
import Modal from '../Global/Modal';
import ReactSelect from '../Global/ReactSelect';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createEmailTemplateSchema } from '@/Schemas/EmailTemplate';
import { EmailTemplate, categoryOptions } from '@/Schemas/EmailTemplate';

const CreateEmailTemplateModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const form = useForm<EmailTemplate>({
    resolver: yupResolver(createEmailTemplateSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      category: 'Tasks',
      subject: '',
      content: '',
      status: 'draft',
      fromName: 'TaskMantra',
      fromEmail: 'noreply@taskmantra.com',
    },
  });

  const handleSubmit = (data: EmailTemplate) => {
    onSubmit(data);
    form.reset();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <h2>Create New Email Template</h2>
      <p>Create a new email template for your team notifications</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Task Assignment" />
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Brief description of when this template is used" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject Line</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., New Task Assigned: {{task.title}}" />
                </FormControl>
                <FormDescription>
                  Use variables like {'{{'}
                  {'{'}task.title{'}'}
                  {'}'} to personalize the subject
                </FormDescription>
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
                    rows={8}
                    placeholder="Hi {{user.name}},&#10;&#10;Your email content here...&#10;&#10;Best regards,&#10;The TaskMantra Team"
                  />
                </FormControl>
                <FormDescription>Use variables to personalize the email content</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="fromName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Template
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default CreateEmailTemplateModal;

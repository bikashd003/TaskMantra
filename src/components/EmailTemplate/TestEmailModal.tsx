import { TestEmailData, testEmailSchema } from '@/Schemas/EmailTemplate';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../Global/Modal';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
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

const TestEmailModal = ({ isOpen, onClose, template, onSubmit, isLoading }) => {
  const form = useForm<TestEmailData>({
    resolver: yupResolver(testEmailSchema),
    defaultValues: {
      to: '',
      templateId: template?.id || '',
    },
  });

  React.useEffect(() => {
    if (template) {
      form.setValue('templateId', template.id);
    }
  }, [template, form]);

  const handleSubmit = (data: TestEmailData) => {
    onSubmit(data);
    form.reset();
  };

  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send To</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="test@example.com" />
                </FormControl>
                <FormDescription>
                  Enter the email address where you want to send the test email
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Template Preview</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Subject:</span> {template.subject}
              </div>
              <div>
                <span className="font-medium">From:</span> {template.fromName} &lt;
                {template.fromEmail}&gt;
              </div>
              <div>
                <span className="font-medium">Content:</span>
                <div className="mt-1 p-2 bg-background rounded border text-xs font-mono whitespace-pre-wrap">
                  {template.content?.substring(0, 200)}...
                </div>
              </div>
            </div>
          </div>

          <div>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Test Email
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};

export default TestEmailModal;

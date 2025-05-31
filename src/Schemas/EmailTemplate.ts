import * as yup from 'yup';

// Email Template Schema
export const emailTemplateSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Template name must be at least 2 characters')
    .required('Template name is required'),
  description: yup.string().optional(),
  category: yup
    .string()
    .oneOf(['Tasks', 'Projects', 'Reminders', 'Reports'], 'Invalid category')
    .required('Category is required'),
  subject: yup.string().min(1, 'Subject is required').required('Subject is required'),
  content: yup
    .string()
    .min(10, 'Content must be at least 10 characters')
    .required('Content is required'),
  status: yup
    .string()
    .oneOf(['active', 'draft', 'disabled'], 'Invalid status')
    .required('Status is required'),
  fromName: yup.string().min(1, 'From name is required').required('From name is required'),
  fromEmail: yup.string().email('Valid email is required').required('From email is required'),
});

// SMTP Settings Schema
export const smtpSettingsSchema = yup.object({
  host: yup.string().min(1, 'SMTP host is required').required('SMTP host is required'),
  port: yup.number().min(1, 'Port must be a valid number').required('Port is required'),
  username: yup.string().min(1, 'Username is required').required('Username is required'),
  password: yup.string().min(1, 'Password is required').required('Password is required'),
  secure: yup.boolean().required(),
  fromName: yup
    .string()
    .min(1, 'Default from name is required')
    .required('Default from name is required'),
  fromEmail: yup
    .string()
    .email('Valid email is required')
    .required('Default from email is required'),
});

// Test Email Schema
export const testEmailSchema = yup.object({
  to: yup.string().email('Valid email is required').required('Email address is required'),
  templateId: yup.string().min(1, 'Template is required').required('Template is required'),
});

// Create Email Template Schema (same as emailTemplateSchema)
export const createEmailTemplateSchema = emailTemplateSchema;

// Type definitions
export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'Tasks' | 'Projects' | 'Reminders' | 'Reports';
  subject: string;
  content: string;
  status: 'active' | 'draft' | 'disabled';
  fromName: string;
  fromEmail: string;
  lastModified: Date;
  variables: string[];
}

export interface SMTPSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  fromName: string;
  fromEmail: string;
}

export interface TestEmailData {
  to: string;
  templateId: string;
}

// Category options for ReactSelect
export const categoryOptions = [
  { value: 'Tasks', label: 'Tasks' },
  { value: 'Projects', label: 'Projects' },
  { value: 'Reminders', label: 'Reminders' },
  { value: 'Reports', label: 'Reports' },
];

// Status options for ReactSelect
export const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'disabled', label: 'Disabled' },
];

// Filter category options for ReactSelect
export const filterCategoryOptions = [
  { value: 'All', label: 'All' },
  { value: 'Tasks', label: 'Tasks' },
  { value: 'Projects', label: 'Projects' },
  { value: 'Reminders', label: 'Reminders' },
  { value: 'Reports', label: 'Reports' },
];

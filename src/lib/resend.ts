import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not defined in environment variables');
}

export const resend = new Resend(resendApiKey);

// Default sender email address
export const defaultFrom = process.env.RESEND_FROM_EMAIL || 'invites@taskmantra.com';

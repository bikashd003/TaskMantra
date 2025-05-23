import { Mail, X, Loader2, Check, Send, UserPlus } from 'lucide-react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import Modal from '../Global/Modal';
import ReactSelect from '../Global/ReactSelect';

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrganizationService } from '@/services/Organization.service';
import { InvitationService, type SendInvitationRequest } from '@/services/Invitation.service';

const emailDomains = ['@gmail.com', '@outlook.com', '@yahoo.com', '@hotmail.com', '@company.com'];
const commonEmailProviders = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];

const commonRoles = [
  { value: 'Owner', label: 'Owner', description: 'Full access to all features and settings' },
  { value: 'Member', label: 'Member', description: 'Can create and edit content' },
  { value: 'Guest', label: 'Guest', description: 'Can only view content' },
];

interface InviteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onOpenChange }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organization } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        return await OrganizationService.getOrganizations();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch organization data',
          variant: 'destructive',
        });
        throw error;
      }
    },
  });

  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [role, setRole] = useState('Member');
  const [customMessage, setCustomMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // TanStack mutation for sending invitations
  const sendInvitationMutation = useMutation({
    mutationFn: (data: SendInvitationRequest) => InvitationService.sendInvitations(data),
    onSuccess: data => {
      const successCount = data.results.filter(result => result.success).length;
      const failedCount = selectedEmails.length - successCount;

      if (successCount === selectedEmails.length) {
        toast({
          title: 'Success',
          description: `All ${successCount} invitations sent successfully`,
          variant: 'default',
        });
        // Reset form on complete success
        setSelectedEmails([]);
        setRole('Member');
        setCustomMessage('');
        onOpenChange(false);
      } else if (successCount > 0) {
        toast({
          title: 'Partial Success',
          description: `${successCount} of ${selectedEmails.length} invitations sent successfully. ${failedCount} failed.`,
          variant: 'default',
        });
        // Remove successful emails from the list
        const failedEmails = data.results
          .filter(result => !result.success)
          .map(result => result.email);
        setSelectedEmails(failedEmails);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send any invitations. Please try again.',
          variant: 'destructive',
        });
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitations',
        variant: 'destructive',
      });
    },
  });

  // Improved email suggestions logic
  const emailSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const suggestions: string[] = [];
    const trimmedTerm = searchTerm.trim();

    // If email contains @ but is incomplete
    if (trimmedTerm.includes('@')) {
      const [username, domainPart] = trimmedTerm.split('@');

      if (!domainPart || domainPart === '') {
        // Just typed @, suggest all common providers
        commonEmailProviders.forEach(provider => {
          suggestions.push(`${username}@${provider}`);
        });
      } else {
        // After @ is partially typed, filter matching providers
        commonEmailProviders.forEach(provider => {
          if (provider.startsWith(domainPart.toLowerCase())) {
            suggestions.push(`${username}@${provider}`);
          }
        });
      }
    }
    // If email doesn't contain @
    else {
      emailDomains.forEach(domain => {
        suggestions.push(`${trimmedTerm}${domain}`);
      });
    }

    return suggestions;
  }, [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when emails are selected
  useEffect(() => {
    if (searchTerm === '' && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [selectedEmails, searchTerm]);

  const handleInvite = () => {
    // Validate organization
    if (!organization) {
      toast({
        title: 'Error',
        description: 'No active organization selected. Please refresh the page and try again.',
        variant: 'destructive',
      });
      return;
    }

    // Check if organization has _id property
    if (!organization._id) {
      toast({
        title: 'Error',
        description: 'Invalid organization data. Please refresh the page and try again.',
        variant: 'destructive',
      });
      return;
    }

    // Validate emails
    if (selectedEmails.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one email address',
        variant: 'destructive',
      });
      return;
    }

    // Validate email format
    const invalidEmails = selectedEmails.filter(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    if (invalidEmails.length > 0) {
      toast({
        title: 'Invalid Email Format',
        description: `The following emails are invalid: ${invalidEmails.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    // Use the mutation to send invitations
    sendInvitationMutation.mutate({
      emails: selectedEmails,
      role,
      customMessage: customMessage.trim() || undefined,
      organizationId: organization._id,
    });
  };

  const handleEmailSelect = (email: string) => {
    if (!selectedEmails.includes(email)) {
      setSelectedEmails([...selectedEmails, email]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm && searchTerm.includes('@') && searchTerm.split('@')[1]) {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchTerm);
      if (isValidEmail && !selectedEmails.includes(searchTerm)) {
        handleEmailSelect(searchTerm);
        e.preventDefault();
      }
    } else if (e.key === ',' && searchTerm) {
      if (searchTerm.includes('@') && !selectedEmails.includes(searchTerm)) {
        const trimmedEmail = searchTerm.replace(',', '').trim();
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
        if (isValidEmail) {
          handleEmailSelect(trimmedEmail);
          e.preventDefault();
        }
      }
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setSelectedEmails(selectedEmails.filter(email => email !== emailToRemove));
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleRoleChange = (selectedOption: any) => {
    setRole(selectedOption?.value || 'Member');
  };

  // Transform roles for ReactSelect
  const roleOptions = commonRoles.map(role => ({
    value: role.value,
    label: role.label,
    description: role.description,
  }));

  return (
    <Modal isOpen={isOpen} onClose={() => onOpenChange(false)} size="lg">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-6 border-b theme-border">
        <div className="flex items-center gap-4">
          <div className="relative p-4 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/5 rounded-2xl shadow-lg backdrop-blur-sm border border-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl"></div>
            <UserPlus className="relative h-7 w-7 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight theme-text-primary">
              Invite Team Members
            </h2>
            <p className="text-sm theme-text-secondary mt-1.5">
              Send invitations to collaborate with your team on{' '}
              {organization?.name || 'your organization'}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="py-6">
        <div className="space-y-6">
          {/* Email Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="email-input" className="text-sm font-semibold theme-text-primary">
                Email Addresses
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gradient-to-r from-primary/10 to-primary/5 text-primary py-1.5 px-3 rounded-full font-medium border border-primary/20">
                  {selectedEmails.length} selected
                </span>
              </div>
            </div>
            <div
              className="flex flex-wrap gap-2.5 p-4 border rounded-xl theme-bg-primary theme-border shadow-sm min-h-[120px] relative focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all duration-200 cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              <AnimatePresence>
                {selectedEmails.map(email => (
                  <motion.div
                    key={email}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 px-3 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Mail className="h-4 w-4 mr-2 opacity-70" />
                    <span className="max-w-[180px] truncate">{email}</span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        removeEmail(email);
                      }}
                      className="ml-2 hover:bg-primary/20 rounded-full p-1 transition-colors duration-200 group"
                      aria-label={`Remove ${email}`}
                    >
                      <X className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={commandRef} className="flex-1 relative min-w-[200px]">
                <Command className="border-0 p-0">
                  <CommandInput
                    id="email-input"
                    ref={inputRef}
                    placeholder={
                      selectedEmails.length > 0 ? 'Add more emails...' : 'Enter email addresses...'
                    }
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    className="border-0 focus:ring-0 px-1 text-sm placeholder:text-muted-foreground/60"
                  />
                  {showSuggestions && emailSuggestions.length > 0 && (
                    <CommandList className="absolute top-full left-0 right-0 theme-bg-primary theme-border border rounded-xl mt-2 shadow-xl backdrop-blur-sm overflow-hidden z-50 max-h-[200px]">
                      <CommandGroup heading="Email Suggestions" className="p-2">
                        {emailSuggestions.map(suggestion => (
                          <CommandItem
                            key={suggestion}
                            onSelect={() => handleEmailSelect(suggestion)}
                            className="cursor-pointer hover:bg-primary/10 hover:text-primary py-3 px-3 transition-all duration-200 flex items-center rounded-lg group"
                          >
                            <Mail className="mr-3 h-4 w-4 theme-text-secondary group-hover:text-primary transition-colors" />
                            <span className="flex-1 font-medium">{suggestion}</span>
                            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-md border theme-border bg-primary/5 px-2 font-mono text-[10px] font-medium theme-text-secondary">
                              ↵
                            </kbd>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  )}
                </Command>
              </div>
            </div>
            <p className="text-xs theme-text-secondary ml-1 flex items-center gap-1.5">
              <span>💡</span>
              Press{' '}
              <kbd className="px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-[10px] font-mono">
                Enter
              </kbd>{' '}
              or{' '}
              <kbd className="px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-[10px] font-mono">
                ,
              </kbd>{' '}
              to add multiple emails
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <ReactSelect
              label="Role"
              options={roleOptions}
              value={roleOptions.find(option => option.value === role) || null}
              onChange={handleRoleChange}
              placeholder="Select a role"
              isSearchable={false}
              isClearable={false}
              className="w-full"
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-3">
            <label htmlFor="custom-message" className="text-sm font-medium">
              Custom Message (Optional)
            </label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              placeholder="Add a personal message to your invitation..."
              className="min-h-[120px] resize-none theme-bg-primary theme-border theme-text-primary"
              rows={5}
            />
          </div>

          {/* Status Message */}
          {selectedEmails.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-300 shadow-sm"
            >
              <div className="flex-shrink-0 p-1 bg-green-100 dark:bg-green-800/50 rounded-full">
                <Check className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <span className="font-medium">
                {selectedEmails.length} {selectedEmails.length === 1 ? 'invitation' : 'invitations'}{' '}
                ready to send
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t theme-border pt-6 flex gap-3 bg-gradient-to-r from-transparent via-primary/5 to-transparent">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="flex-1 sm:flex-none h-12 font-medium hover:bg-primary/5 transition-all duration-200"
          disabled={sendInvitationMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleInvite}
          disabled={selectedEmails.length === 0 || sendInvitationMutation.isPending}
          className="flex-1 sm:flex-none h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
        >
          {sendInvitationMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Invitations...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send {selectedEmails.length > 0 ? `${selectedEmails.length} ` : ''}Invitation
              {selectedEmails.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default InviteModal;

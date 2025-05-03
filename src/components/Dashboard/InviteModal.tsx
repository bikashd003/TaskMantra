import { Mail, X, Users, Loader2, Check } from 'lucide-react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectItem } from '@heroui/select';
import { useQuery } from '@tanstack/react-query';
import { OrganizationService } from '@/services/Organization.service';

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
  const [isLoading, setIsLoading] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleInvite = async () => {
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

    setIsLoading(true);

    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: selectedEmails,
          role,
          customMessage: customMessage.trim() || undefined,
          organizationId: organization._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send invitations');
      }

      // Count successful invitations
      const successCount = data.results.filter((result: any) => result.success).length;
      const failedCount = selectedEmails.length - successCount;

      // Show appropriate toast based on results
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
          .filter((result: any) => !result.success)
          .map((result: any) => result.email);

        setSelectedEmails(failedEmails);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send any invitations. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="backdrop-blur-sm">
      <ModalContent className="max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border shadow-xl">
        {onClose => (
          <>
            <ModalHeader className="flex flex-col gap-4 pb-6 border-b">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-xl shadow-inner backdrop-blur-sm">
                  <Users className="h-6 w-6 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Invite Team Members</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add people to collaborate with your team
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-6">
                {/* Email Input Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="email-input" className="text-sm font-medium">
                      Email Addresses
                    </label>
                    <span className="text-xs bg-primary/10 text-primary py-1.5 px-3 rounded-full font-medium">
                      {selectedEmails.length} selected
                    </span>
                  </div>
                  <div
                    className="flex flex-wrap gap-2 p-3 border rounded-xl bg-white dark:bg-gray-800 shadow-sm min-h-[120px] relative focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all duration-200"
                    onClick={() => inputRef.current?.focus()}
                  >
                    <AnimatePresence>
                      {selectedEmails.map(email => (
                        <motion.div
                          key={email}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="max-w-[150px] truncate">{email}</span>
                          <button
                            onClick={() => removeEmail(email)}
                            className="ml-2 hover:bg-blue-100 rounded-full p-1 transition-colors"
                          >
                            <X className="h-4 w-4" />
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
                            selectedEmails.length > 0
                              ? 'Add more emails...'
                              : 'Enter email addresses...'
                          }
                          value={searchTerm}
                          onValueChange={setSearchTerm}
                          onFocus={handleInputFocus}
                          onKeyDown={handleKeyDown}
                          className="border-0 focus:ring-0 px-1 text-sm placeholder:text-muted-foreground/60"
                        />
                        {showSuggestions && emailSuggestions.length > 0 && (
                          <CommandList className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border rounded-xl mt-2 shadow-lg overflow-hidden z-50 max-h-[200px]">
                            <CommandGroup heading="Suggestions">
                              {emailSuggestions.map(suggestion => (
                                <CommandItem
                                  key={suggestion}
                                  onSelect={() => handleEmailSelect(suggestion)}
                                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground py-2 px-3 transition-colors flex items-center"
                                >
                                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span className="flex-1">{suggestion}</span>
                                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                    tab
                                  </kbd>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        )}
                      </Command>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground ml-1">
                    Press Enter or comma to add multiple emails
                  </p>
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <label htmlFor="role-select" className="text-sm font-medium">
                    Role
                  </label>
                  <Select
                    id="role-select"
                    onChange={handleRoleChange}
                    defaultSelectedKeys={[role]}
                    selectedKeys={[role]}
                    aria-label="Select member role"
                    className="w-full"
                  >
                    {commonRoles.map(roleOption => (
                      <SelectItem
                        key={roleOption.value}
                        value={roleOption.value}
                        textValue={roleOption.label}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col py-2">
                          <span className="font-medium">{roleOption.label}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {roleOption.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Custom Message */}
                <div className="space-y-3">
                  <label htmlFor="custom-message" className="text-sm font-medium">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    id="custom-message"
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    placeholder="Add a personal message to your invitation..."
                    className="w-full min-h-[120px] p-4 rounded-xl border bg-white dark:bg-gray-800 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-200 placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Status Message */}
                {selectedEmails.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-primary/5 border rounded-xl text-sm text-primary"
                  >
                    <Check className="h-5 w-5 flex-shrink-0" strokeWidth={2.5} />
                    <span>
                      {selectedEmails.length}{' '}
                      {selectedEmails.length === 1 ? 'invitation' : 'invitations'} ready to send
                    </span>
                  </motion.div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="border-t pt-6 gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none h-11">
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={selectedEmails.length === 0 || isLoading}
                className="flex-1 sm:flex-none h-11 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send {selectedEmails.length > 0 ? `(${selectedEmails.length})` : ''} Invites
                  </>
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default InviteModal;

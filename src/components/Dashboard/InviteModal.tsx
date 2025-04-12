import { Mail, X, Users, AlertCircle } from 'lucide-react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Command, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';

const emailDomains = ['@gmail.com', '@outlook.com', '@yahoo.com', '@hotmail.com', '@company.com'];
const commonEmailProviders = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];

const commonRoles = [
  { value: 'admin', label: 'Administrator', description: 'Full access to all features' },
  { value: 'member', label: 'Team Member', description: 'Can create and edit content' },
  { value: 'viewer', label: 'Viewer', description: 'Can only view content' },
];

const InviteModal = ({ isOpen, onOpenChange }) => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("member");
  const [customMessage, setCustomMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);

  const emailSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    
    const suggestions: string[] = [];
    
    // If email contains @ but is incomplete
    if (searchTerm.includes('@') && !searchTerm.split('@')[1]) {
      commonEmailProviders.forEach(provider => {
        suggestions.push(`${searchTerm}${provider}`);
      });
    }
    // If email doesn't contain @
    else if (!searchTerm.includes('@') && searchTerm.length > 0) {
      emailDomains.forEach(domain => {
        suggestions.push(`${searchTerm}${domain}`);
      });
    }
    // If after @ is partially typed
    else if (searchTerm.includes('@') && searchTerm.split('@')[1]) {
      const [username, domain] = searchTerm.split('@');
      commonEmailProviders.forEach(provider => {
        if (provider.startsWith(domain)) {
          suggestions.push(`${username}@${provider}`);
        }
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

  const handleInvite = async () => {
    // TODO: Implement invitation logic
    // console.log("Inviting:", selectedEmails, "with role:", role, "message:", customMessage);
    setSelectedEmails([]);
    setRole("member");
    setCustomMessage("");
  };

  const handleEmailSelect = (email: string) => {
    if (!selectedEmails.includes(email)) {
      setSelectedEmails([...selectedEmails, email]);
    }
    setSearchTerm("");
    setShowSuggestions(false);
  };

  const removeEmail = (emailToRemove: string) => {
    setSelectedEmails(selectedEmails.filter(email => email !== emailToRemove));
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-3 pb-6 border-b">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Invite Team Members</h2>
                  <p className="text-sm text-muted-foreground">
                    Build your team by inviting members
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center justify-between">
                    Email Addresses
                    <span className="text-xs text-muted-foreground">
                      {selectedEmails.length} selected
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-background/50 min-h-[100px] relative">
                    <AnimatePresence>
                      {selectedEmails.map((email) => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          key={email}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm group"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          <span>{email}</span>
                          <button
                            onClick={() => removeEmail(email)}
                            className="opacity-0 group-hover:opacity-100 hover:bg-primary/20 rounded-full p-1 transition-all duration-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={commandRef} className="flex-1 relative">
                      <Command className="border-0 p-0">
                        <CommandInput
                          placeholder="Type or paste email addresses"
                          value={searchTerm}
                          onValueChange={setSearchTerm}
                          onFocus={handleInputFocus}
                          className="border-0 focus:ring-0"
                        />
                        {showSuggestions && emailSuggestions.length > 0 && (
                          <CommandGroup className="absolute top-full left-0 right-0 bg-white border rounded-xl mt-1 shadow-lg overflow-hidden z-50">
                            {emailSuggestions.map(suggestion => (
                              <CommandItem
                                key={suggestion}
                                onSelect={() => handleEmailSelect(suggestion)}
                                className="cursor-pointer hover:bg-primary/10 py-2 px-3 transition-colors"
                              >
                                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                {suggestion}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </Command>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonRoles.map(roleOption => (
                        <SelectItem 
                          key={roleOption.value} 
                          value={roleOption.value}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col py-1">
                            <span className="font-medium">{roleOption.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {roleOption.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Custom Message (Optional)</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personal message to your invitation..."
                    className="w-full min-h-[100px] p-3 rounded-xl border bg-background/50 text-sm resize-none focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>

                {selectedEmails.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg text-sm text-blue-700"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {selectedEmails.length} {selectedEmails.length === 1 ? 'invitation' : 'invitations'} ready to send
                    </span>
                  </motion.div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="border-t pt-6">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={selectedEmails.length === 0}
                className="bg-primary hover:bg-primary/90 text-white transition-colors"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send {selectedEmails.length > 0 ? `(${selectedEmails.length})` : ''} Invites
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default InviteModal;



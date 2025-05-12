'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Modal from '../Global/Modal';
import { toast } from 'sonner';
import { IntegrationOnboarding } from './IntegrationOnboarding';

interface NotionConnectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotionConnectModal({ isOpen, onOpenChange }: NotionConnectModalProps) {
  const [accessToken, setAccessToken] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const { connectNotion, isConnecting } = useIntegrations();

  const handleConnect = async () => {
    if (!accessToken) {
      setError('Please enter a valid Notion integration token');
      return;
    }

    setError(null);

    try {
      await connectNotion(accessToken, undefined, workspaceName || 'My Notion Workspace');

      // Instead of closing the modal, show the onboarding experience
      setConnectionSuccess(true);
      setShowOnboarding(true);

      // Reset form fields
      setAccessToken('');
      setWorkspaceName('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to connect to Notion');
      }
      toast.error('Failed to connect to Notion');
    }
  };

  return (
    <>
      {/* Connection Modal */}
      <Modal
        isOpen={isOpen && !showOnboarding}
        onClose={() => {
          setError(null);
          setAccessToken('');
          setWorkspaceName('');
          onOpenChange(false);
        }}
      >
        <div className="sm:max-w-[520px] p-1">
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Connect to Notion</h2>
                <p className="text-muted-foreground text-sm">
                  Seamlessly import your Notion pages and databases
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {error && (
              <Alert variant="destructive" className="animate-fadeIn">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="token" className="text-sm font-medium">
                Notion Integration Token
              </Label>
              <Input
                id="token"
                type="password"
                placeholder="secret_..."
                value={accessToken}
                onChange={e => setAccessToken(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Create a new integration token from the{' '}
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center font-medium"
                >
                  Notion Integrations page
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </p>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="workspace" className="text-sm font-medium">
                Workspace Name (Optional)
              </Label>
              <Input
                id="workspace"
                placeholder="My Notion Workspace"
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
              />
            </div>

            <div className="bg-muted/40 p-5 rounded-xl space-y-3 border border-border/50">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <span className="bg-primary/10 p-1 rounded-full inline-flex">
                  <AlertCircle className="h-4 w-4 text-primary" />
                </span>
                Connection Guide
              </h4>
              <ol className="text-sm space-y-2.5 list-decimal pl-5 text-muted-foreground">
                <li>
                  Visit{' '}
                  <a
                    href="https://www.notion.so/my-integrations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Notion Integrations
                  </a>
                </li>
                <li>
                  Click{' '}
                  <span className="font-medium text-foreground">&quot;New integration&quot;</span>{' '}
                  and complete the required details
                </li>
                <li>
                  Under{' '}
                  <span className="font-medium text-foreground">&quot;Capabilities&quot;</span>,
                  enable{' '}
                  <span className="font-medium text-foreground">&quot;Read content&quot;</span>{' '}
                  permission
                </li>
                <li>
                  Copy the{' '}
                  <span className="font-medium text-foreground">
                    &quot;Internal Integration Token&quot;
                  </span>
                </li>
                <li>Paste the token above and click Connect</li>
              </ol>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="px-4">
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!accessToken || isConnecting}
              className="px-4 font-medium"
            >
              {isConnecting ? 'Connecting...' : 'Connect to Notion'}
            </Button>
          </div>
        </div>
      </Modal>

      {connectionSuccess && (
        <IntegrationOnboarding
          isOpen={showOnboarding}
          onOpenChange={open => {
            setShowOnboarding(open);
            if (!open) {
              onOpenChange(false);
            }
          }}
          provider="notion"
          providerName="Notion"
          workspaceName={workspaceName || 'My Notion Workspace'}
        />
      )}
    </>
  );
}

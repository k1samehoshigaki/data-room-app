'use client';

import { useState } from 'react';
import { Copy, Check, Loader2, Trash2, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  useSharePermissions,
  useShareLinks,
  useCreatePermission,
  useRevokePermission,
  useCreateLink,
  useRevokeLink,
} from '@/hooks/use-sharing';
import { useUIStore } from '@/stores/ui-store';
import { useToast } from '@/components/ui/toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:3001';

export function ShareModal() {
  const { shareModal, closeShareModal } = useUIStore();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const open = shareModal?.open ?? false;
  const resourceType = shareModal?.resourceType ?? '';
  const resourceId = shareModal?.resourceId ?? '';

  const { data: permissions = [] } = useSharePermissions(resourceType, resourceId);
  const { data: links = [] } = useShareLinks(resourceType, resourceId);

  const createPermission = useCreatePermission();
  const revokePermission = useRevokePermission();
  const createLink = useCreateLink();
  const revokeLink = useRevokeLink();

  const activeLink = links.find((l) => !l.revokedAt);
  const shareUrl = activeLink
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${activeLink.token}`
    : null;

  const handleInvite = async () => {
    if (!email.trim()) return;
    try {
      await createPermission.mutateAsync({ resourceType, resourceId, granteeEmail: email.trim() });
      setEmail('');
      addToast('Invite sent', 'success');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to invite', 'error');
    }
  };

  const handleToggleLink = async () => {
    if (activeLink) {
      await revokeLink.mutateAsync({ id: activeLink.id, resourceType, resourceId });
      addToast('Public link disabled', 'info');
    } else {
      await createLink.mutateAsync({ resourceType, resourceId });
      addToast('Public link created', 'success');
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) closeShareModal(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share {resourceType.toLowerCase().replace('_', ' ')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email invite */}
          <div>
            <p className="text-sm font-medium mb-2">Invite people</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
              <Button
                size="sm"
                onClick={handleInvite}
                disabled={!email.trim() || createPermission.isPending}
              >
                {createPermission.isPending ? <Loader2 className="animate-spin" /> : 'Invite'}
              </Button>
            </div>
          </div>

          {/* Current permissions */}
          {permissions.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">People with access</p>
              <div className="space-y-2">
                {permissions.map((perm) => (
                  <div key={perm.id} className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">
                        {perm.grantee.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{perm.grantee.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{perm.grantee.email}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{perm.role}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => revokePermission.mutate({ id: perm.id, resourceType, resourceId })}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Public link */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Public link</p>
              <Button
                variant={activeLink ? 'destructive' : 'outline'}
                size="sm"
                onClick={handleToggleLink}
                disabled={createLink.isPending || revokeLink.isPending}
              >
                {(createLink.isPending || revokeLink.isPending) && <Loader2 className="animate-spin" />}
                {activeLink ? 'Disable' : 'Enable'}
              </Button>
            </div>

            {shareUrl && (
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="text-xs" />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

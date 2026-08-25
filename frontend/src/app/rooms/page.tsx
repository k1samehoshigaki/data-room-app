'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Database, MoreVertical, Pencil, Trash2, Share2 } from 'lucide-react';
import { AppShell } from '@/components/data-room/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom, DataRoom } from '@/hooks/use-rooms';
import { useSharedWithMe } from '@/hooks/use-sharing';
import { useUIStore } from '@/stores/ui-store';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Folder, FileText, Users } from 'lucide-react';

function SharedResourceIcon({ type }: { type: string }) {
  if (type === 'FOLDER') return <Folder className="h-4 w-4 text-amber-500" />;
  if (type === 'FILE') return <FileText className="h-4 w-4 text-rose-500" />;
  return <Database className="h-4 w-4 text-primary" />;
}

function sharedResourceHref(type: string, resourceId: string, dataRoomId: string | null): string {
  if (type === 'DATA_ROOM') return `/rooms/${resourceId}`;
  if (type === 'FOLDER' && dataRoomId) return `/rooms/${dataRoomId}/folder/${resourceId}`;
  if (type === 'FILE' && dataRoomId) return `/rooms/${dataRoomId}`;
  return '#';
}

export default function RoomsPage() {
  const { addToast } = useToast();
  const { openShareModal } = useUIStore();
  const { data: rooms = [], isLoading } = useRooms();
  const { data: sharedItems = [], isLoading: sharedLoading } = useSharedWithMe();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState<DataRoom | null>(null);
  const [renameName, setRenameName] = useState('');
  const [deleting, setDeleting] = useState<DataRoom | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createRoom.mutateAsync(newName.trim());
      setNewName('');
      setCreating(false);
      addToast('Data room created', 'success');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create', 'error');
    }
  };

  const handleRename = async () => {
    if (!renaming || !renameName.trim()) return;
    try {
      await updateRoom.mutateAsync({ id: renaming.id, name: renameName.trim() });
      setRenaming(null);
      addToast('Renamed', 'success');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to rename', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteRoom.mutateAsync(deleting.id);
      setDeleting(null);
      addToast('Data room deleted', 'success');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">My Data Rooms</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {rooms.length} room{rooms.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => { setNewName(''); setCreating(true); }} className="shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Data Room</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 ring-8 ring-primary/5">
              <Database className="h-9 w-9 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No data rooms yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Create your first data room to start organizing and sharing documents securely.
            </p>
            <Button onClick={() => { setNewName(''); setCreating(true); }} size="lg">
              <Plus className="h-4 w-4" />
              Create Data Room
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="group relative flex flex-col gap-4 p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer"
              >
                <Link href={`/rooms/${room.id}`} className="absolute inset-0 rounded-2xl" />
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/15">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative z-10 h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault();
                        setRenameName(room.name);
                        setRenaming(room);
                      }}>
                        <Pencil className="h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault();
                        openShareModal('DATA_ROOM', room.id);
                      }}>
                        <Share2 className="h-4 w-4" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => { e.preventDefault(); setDeleting(room); }}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <h3 className="font-semibold text-sm truncate">{room.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(room.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shared with me */}
        {(sharedLoading || sharedItems.length > 0) && (
          <div className="pt-4 border-t border-border/60">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold">Shared with me</h2>
              {sharedItems.length > 0 && (
                <Badge variant="secondary" className="text-xs">{sharedItems.length}</Badge>
              )}
            </div>

            {sharedLoading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sharedItems.map((item) => (
                  <Link
                    key={item.id}
                    href={sharedResourceHref(item.resourceType, item.resourceId, item.dataRoomId)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/60 bg-card hover:border-primary/25 hover:bg-accent/40 transition-all duration-150 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <SharedResourceIcon type={item.resourceType} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.resourceName ?? 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Shared by <span className="font-medium">{item.createdBy.name}</span>
                        {' · '}{formatDate(item.createdAt)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs capitalize">
                      {item.role.toLowerCase()}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create modal */}
      <Dialog open={creating} onOpenChange={(v) => { if (!v) setCreating(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Data Room</DialogTitle></DialogHeader>
          <Input
            placeholder="Data room name"
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || createRoom.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename modal */}
      <Dialog open={!!renaming} onOpenChange={(v) => { if (!v) setRenaming(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Data Room</DialogTitle></DialogHeader>
          <Input
            autoFocus
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenaming(null)}>Cancel</Button>
            <Button onClick={handleRename} disabled={!renameName.trim() || updateRoom.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete alert */}
      <AlertDialog open={!!deleting} onOpenChange={(v) => { if (!v) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete data room?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleting?.name}</strong> and all its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

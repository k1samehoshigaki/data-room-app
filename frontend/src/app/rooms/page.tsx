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
import { useUIStore } from '@/stores/ui-store';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

export default function RoomsPage() {
  const { addToast } = useToast();
  const { openShareModal } = useUIStore();
  const { data: rooms = [], isLoading } = useRooms();
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Data Rooms</h1>
            <p className="text-muted-foreground text-sm">
              {rooms.length} room{rooms.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => { setNewName(''); setCreating(true); }}>
            <Plus className="h-4 w-4" />
            New Data Room
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-muted p-5 mb-4">
              <Database className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No data rooms yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first data room to start organizing documents
            </p>
            <Button onClick={() => { setNewName(''); setCreating(true); }}>
              <Plus className="h-4 w-4" />
              Create Data Room
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="group relative flex flex-col gap-3 p-5 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer"
              >
                <Link href={`/rooms/${room.id}`} className="absolute inset-0" />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate max-w-[140px]">{room.name}</h3>
                      <p className="text-xs text-muted-foreground">{formatDate(room.createdAt)}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative z-10 h-8 w-8 opacity-0 group-hover:opacity-100"
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
              </div>
            ))}
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

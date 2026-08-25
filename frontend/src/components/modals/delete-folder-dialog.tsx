'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, TriangleAlert } from 'lucide-react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useFolderStats, useDeleteFolder } from '@/hooks/use-folder';
import { formatBytes } from '@/lib/utils';
import type { Folder } from '@/hooks/use-folder';
import { useToast } from '@/components/ui/toast';

interface Props {
  open: boolean;
  folder: Folder;
  onClose: () => void;
}

export function DeleteFolderDialog({ open, folder, onClose }: Props) {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const { data: stats, isLoading } = useFolderStats(open ? folder.id : undefined);
  const deleteFolder = useDeleteFolder();

  const handleDelete = async () => {
    try {
      await deleteFolder.mutateAsync({ id: folder.id, dataRoomId: folder.dataRoomId });
      addToast(`"${folder.name}" deleted`, 'success');
      onClose();
      // If we're currently inside the deleted folder, navigate up
      if (params?.folderId === folder.id) {
        if (folder.parentId) {
          router.replace(`/rooms/${folder.dataRoomId}/folder/${folder.parentId}`);
        } else {
          router.replace(`/rooms/${folder.dataRoomId}`);
        }
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-destructive" />
            Delete folder?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                This will permanently delete <strong>{folder.name}</strong> and all its contents.
              </p>
              {isLoading ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Calculating...
                </p>
              ) : stats ? (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm">
                  <p className="font-medium text-destructive">This will delete:</p>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    <li>{stats.fileCount} file{stats.fileCount !== 1 ? 's' : ''}</li>
                    <li>{stats.folderCount} folder{stats.folderCount !== 1 ? 's' : ''}</li>
                    <li>{formatBytes(stats.totalSizeBytes)} total</li>
                  </ul>
                </div>
              ) : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-white"
            onClick={handleDelete}
            disabled={deleteFolder.isPending}
          >
            {deleteFolder.isPending && <Loader2 className="animate-spin h-4 w-4" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

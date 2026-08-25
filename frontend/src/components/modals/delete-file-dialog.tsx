'use client';

import { Loader2, TriangleAlert } from 'lucide-react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useDeleteFile } from '@/hooks/use-files';
import type { FileRecord } from '@/hooks/use-folder';
import { formatBytes } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

interface Props {
  open: boolean;
  file: FileRecord;
  onClose: () => void;
}

export function DeleteFileDialog({ open, file, onClose }: Props) {
  const { addToast } = useToast();
  const deleteFile = useDeleteFile();

  const handleDelete = async () => {
    try {
      await deleteFile.mutateAsync({ id: file.id, dataRoomId: file.dataRoomId });
      addToast(`"${file.name}" deleted`, 'success');
      onClose();
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
            Delete file?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{file.name}</strong> ({formatBytes(file.sizeBytes)}).
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-white"
            onClick={handleDelete}
            disabled={deleteFile.isPending}
          >
            {deleteFile.isPending && <Loader2 className="animate-spin h-4 w-4" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

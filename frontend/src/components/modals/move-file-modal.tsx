'use client';

import { useState } from 'react';
import { Loader2, Folder } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFolderContents } from '@/hooks/use-folder';
import { useMoveFile } from '@/hooks/use-files';
import type { FileRecord } from '@/hooks/use-folder';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  file: FileRecord;
  onClose: () => void;
}

export function MoveFileModal({ open, file, onClose }: Props) {
  const { addToast } = useToast();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { data: contents } = useFolderContents(file.dataRoomId, selectedFolderId);
  const moveFile = useMoveFile();
  const [navStack, setNavStack] = useState<Array<{ id: string | null; name: string }>>([
    { id: null, name: 'Root' },
  ]);

  const currentFolder = navStack[navStack.length - 1];

  const handleMove = async () => {
    try {
      await moveFile.mutateAsync({
        id: file.id,
        folderId: currentFolder.id,
        dataRoomId: file.dataRoomId,
      });
      addToast('File moved', 'success');
      onClose();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Move failed', 'error');
    }
  };

  const navigate = (folderId: string, folderName: string) => {
    setNavStack((prev) => [...prev, { id: folderId, name: folderName }]);
    setSelectedFolderId(folderId);
  };

  const navigateBack = () => {
    if (navStack.length <= 1) return;
    const newStack = navStack.slice(0, -1);
    setNavStack(newStack);
    setSelectedFolderId(newStack[newStack.length - 1].id);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move &quot;{file.name}&quot;</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            {navStack.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <button
                  className={cn('hover:text-foreground', i === navStack.length - 1 && 'text-foreground font-medium')}
                  onClick={() => {
                    const newStack = navStack.slice(0, i + 1);
                    setNavStack(newStack);
                    setSelectedFolderId(newStack[newStack.length - 1].id);
                  }}
                >
                  {item.name}
                </button>
              </span>
            ))}
          </div>

          <ScrollArea className="h-48 rounded-md border">
            <div className="p-2 space-y-1">
              {navStack.length > 1 && (
                <button
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-accent"
                  onClick={navigateBack}
                >
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  ..
                </button>
              )}
              {contents?.folders.map((folder) => (
                <button
                  key={folder.id}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-accent text-left',
                    folder.id === file.folderId && 'opacity-50 cursor-not-allowed',
                  )}
                  disabled={folder.id === file.folderId}
                  onClick={() => navigate(folder.id, folder.name)}
                >
                  <Folder className="h-4 w-4 text-blue-500" />
                  {folder.name}
                </button>
              ))}
              {!contents?.folders.length && (
                <p className="text-sm text-muted-foreground text-center py-4">No subfolders</p>
              )}
            </div>
          </ScrollArea>

          <p className="text-sm text-muted-foreground mt-2">
            Moving to: <strong>{currentFolder.name}</strong>
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleMove}
            disabled={moveFile.isPending || currentFolder.id === file.folderId}
          >
            {moveFile.isPending && <Loader2 className="animate-spin" />}
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect } from 'react';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUploadStore } from '@/stores/upload-store';
import { useUploadFiles } from '@/hooks/use-files';
import { formatBytes } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function UploadDrawer() {
  const { files, isOpen, dataRoomId, folderId, removeFile, clearDone, updateFile, close } = useUploadStore();
  const upload = useUploadFiles();

  // Trigger uploads for pending files
  useEffect(() => {
    if (!dataRoomId) return;
    const pending = files.filter((f) => f.status === 'pending');
    pending.forEach((f) => {
      updateFile(f.id, { status: 'uploading' });
      upload.mutate({
        uploadFileId: f.id,
        file: f.file,
        dataRoomId,
        folderId: folderId ?? null,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length, dataRoomId]);

  if (!isOpen || files.length === 0) return null;

  const doneCount = files.filter((f) => f.status === 'done').length;
  const allDone = doneCount === files.length;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 rounded-xl border bg-background shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
        <div className="text-sm font-medium">
          {allDone ? (
            <span className="text-green-600">All uploads complete</span>
          ) : (
            <span>
              Uploading {doneCount}/{files.length}...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {allDone && (
            <Button variant="ghost" size="sm" onClick={clearDone}>
              Clear
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={close}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File list */}
      <ScrollArea className="max-h-64">
        <div className="p-3 space-y-2">
          {files.map((f) => (
            <div key={f.id} className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0">
                {f.status === 'done' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {f.status === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
                {(f.status === 'uploading' || f.status === 'pending') && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{f.file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(f.file.size)}</p>
                {f.status === 'uploading' && (
                  <Progress value={f.progress} className="h-1 mt-1" />
                )}
                {f.status === 'error' && (
                  <p className="text-xs text-destructive mt-0.5">{f.error}</p>
                )}
              </div>
              {(f.status === 'done' || f.status === 'error') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 -mt-0.5"
                  onClick={() => removeFile(f.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

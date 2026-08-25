'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FolderPlus, Upload, Share2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderItem } from './folder-item';
import { FileItem } from './file-item';
import { Breadcrumbs } from './breadcrumbs';
import { CreateFolderModal } from '@/components/modals/create-folder-modal';
import { useUploadStore } from '@/stores/upload-store';
import { useUIStore } from '@/stores/ui-store';
import type { FolderContents } from '@/hooks/use-folder';
import { cn } from '@/lib/utils';

interface FileBrowserProps {
  roomId: string;
  roomName?: string;
  folderId?: string | null;
  contents?: FolderContents;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function FileBrowser({
  roomId,
  roomName,
  folderId,
  contents,
  isLoading,
  readOnly = false,
}: FileBrowserProps) {
  const { addFiles } = useUploadStore();
  const { openShareModal } = useUIStore();
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [search, setSearch] = useState('');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (readOnly || !acceptedFiles.length) return;
      addFiles(acceptedFiles, roomId, folderId ?? null);
    },
    [addFiles, roomId, folderId, readOnly],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    disabled: readOnly,
  });

  const filteredFolders =
    contents?.folders.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const filteredFiles =
    contents?.files.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const isEmpty = !isLoading && filteredFolders.length === 0 && filteredFiles.length === 0;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Breadcrumbs
          roomId={roomId}
          roomName={roomName}
          breadcrumbs={contents?.breadcrumbs ?? []}
          currentFolderId={folderId}
        />

        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => openShareModal('DATA_ROOM', roomId)}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCreatingFolder(true)}>
              <FolderPlus className="h-4 w-4" />
              New Folder
            </Button>
            <label className="cursor-pointer">
              <Button variant="default" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4" />
                  Upload Files
                </span>
              </Button>
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                className="sr-only"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length) addFiles(files, roomId, folderId ?? null);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Filter by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Drop zone + content */}
      <div
        {...getRootProps()}
        className={cn(
          'flex-1 rounded-lg min-h-0 transition-colors',
          isDragActive && 'ring-2 ring-primary bg-primary/5',
        )}
      >
        <input {...getInputProps()} />

        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-background border-2 border-primary border-dashed rounded-xl px-8 py-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Drop files to upload</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FolderPlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">
              {search ? 'No items match your search' : 'This folder is empty'}
            </p>
            {!search && !readOnly && (
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop files or use the Upload button
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFolders.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground px-1 mb-1">
                  FOLDERS ({filteredFolders.length})
                </p>
                <div className="space-y-1">
                  {filteredFolders.map((folder) => (
                    <FolderItem
                      key={folder.id}
                      folder={folder}
                      roomId={roomId}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredFiles.length > 0 && (
              <div className={filteredFolders.length > 0 ? 'mt-3' : ''}>
                <p className="text-xs font-medium text-muted-foreground px-1 mb-1">
                  FILES ({filteredFiles.length})
                </p>
                <div className="space-y-1">
                  {filteredFiles.map((file) => (
                    <FileItem key={file.id} file={file} readOnly={readOnly} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {creatingFolder && (
        <CreateFolderModal
          open
          dataRoomId={roomId}
          parentId={folderId ?? null}
          onClose={() => setCreatingFolder(false)}
        />
      )}
    </div>
  );
}

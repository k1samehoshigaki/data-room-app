'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FolderPlus, Upload, Share2, Search, FolderOpen } from 'lucide-react';
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
  const totalItems = filteredFolders.length + filteredFiles.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs
          roomId={roomId}
          roomName={roomName}
          breadcrumbs={contents?.breadcrumbs ?? []}
          currentFolderId={folderId}
        />

        {!readOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => openShareModal('DATA_ROOM', roomId)}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setCreatingFolder(true)}
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Folder</span>
              <span className="sm:hidden">Folder</span>
            </Button>
            <label className="cursor-pointer">
              <Button variant="default" size="sm" className="h-8 text-xs" asChild>
                <span>
                  <Upload className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Upload Files</span>
                  <span className="sm:hidden">Upload</span>
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9 h-9 text-sm bg-card border-border/70 focus:border-primary/50"
          placeholder="Filter by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Drop zone + content */}
      <div
        {...getRootProps()}
        className={cn(
          'relative rounded-xl transition-all duration-200 min-h-48',
          isDragActive && 'ring-2 ring-primary ring-offset-2 bg-primary/3',
        )}
      >
        <input {...getInputProps()} />

        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none rounded-xl">
            <div className="bg-background/95 backdrop-blur border-2 border-primary border-dashed rounded-xl px-10 py-8 text-center shadow-lg">
              <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Drop files to upload</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-4">
              <FolderOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground text-sm">
              {search ? 'No items match your filter' : 'This folder is empty'}
            </p>
            {!search && !readOnly && (
              <p className="text-xs text-muted-foreground/70 mt-1.5">
                Drag & drop files or click Upload
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFolders.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-1 mb-2">
                  Folders · {filteredFolders.length}
                </p>
                <div className="space-y-1.5">
                  {filteredFolders.map((folder) => (
                    <FolderItem
                      key={folder.id}
                      folder={folder}
                      roomId={roomId}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </section>
            )}

            {filteredFiles.length > 0 && (
              <section className={filteredFolders.length > 0 ? 'mt-2' : ''}>
                <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-1 mb-2">
                  Files · {filteredFiles.length}
                </p>
                <div className="space-y-1.5">
                  {filteredFiles.map((file) => (
                    <FileItem key={file.id} file={file} readOnly={readOnly} />
                  ))}
                </div>
              </section>
            )}

            {totalItems > 0 && (
              <p className="text-xs text-muted-foreground/50 text-center pt-2 pb-1">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </p>
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

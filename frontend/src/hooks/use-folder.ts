'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/lib/api';

export interface Folder {
  id: string;
  dataRoomId: string;
  parentId: string | null;
  name: string;
  path: string;
  depth: number;
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  id: string;
  dataRoomId: string;
  folderId: string | null;
  name: string;
  storageKey: string;
  sizeBytes: string;
  mimeType: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface Breadcrumb {
  id: string;
  name: string;
}

export interface FolderContents {
  folder: Folder | null;
  folders: Folder[];
  files: FileRecord[];
  breadcrumbs: Breadcrumb[];
}

export interface FolderStats {
  fileCount: number;
  folderCount: number;
  totalSizeBytes: string;
}

export function useFolderContents(dataRoomId: string, folderId?: string | null) {
  return useQuery<FolderContents>({
    queryKey: ['folder-contents', dataRoomId, folderId ?? null],
    queryFn: async () => {
      const res = await foldersApi.getContents(dataRoomId, folderId);
      return res.data;
    },
    enabled: !!dataRoomId,
  });
}

export function useFolderStats(folderId: string | undefined) {
  return useQuery<FolderStats>({
    queryKey: ['folder-stats', folderId],
    queryFn: async () => {
      const res = await foldersApi.getStats(folderId!);
      return res.data;
    },
    enabled: !!folderId,
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; dataRoomId: string; parentId?: string | null }) =>
      foldersApi.create(data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['folder-contents', vars.dataRoomId] });
    },
  });
}

export function useRenameFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string; dataRoomId: string }) =>
      foldersApi.update(id, name),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['folder-contents', vars.dataRoomId] });
    },
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; dataRoomId: string }) => foldersApi.delete(id),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['folder-contents', vars.dataRoomId] });
    },
  });
}

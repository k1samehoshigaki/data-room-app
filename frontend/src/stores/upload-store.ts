'use client';

import { create } from 'zustand';

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

interface UploadState {
  files: UploadFile[];
  isOpen: boolean;
  dataRoomId: string | null;
  folderId: string | null;
  addFiles: (files: File[], dataRoomId: string, folderId: string | null) => void;
  updateFile: (id: string, update: Partial<UploadFile>) => void;
  removeFile: (id: string) => void;
  clearDone: () => void;
  open: () => void;
  close: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  files: [],
  isOpen: false,
  dataRoomId: null,
  folderId: null,
  addFiles: (newFiles, dataRoomId, folderId) =>
    set((s) => ({
      isOpen: true,
      dataRoomId,
      folderId,
      files: [
        ...s.files,
        ...newFiles.map((f) => ({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          progress: 0,
          status: 'pending' as const,
        })),
      ],
    })),
  updateFile: (id, update) =>
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, ...update } : f)),
    })),
  removeFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
  clearDone: () => set((s) => ({ files: s.files.filter((f) => f.status !== 'done') })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

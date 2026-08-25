'use client';

import { create } from 'zustand';

interface UIState {
  shareModal: { open: boolean; resourceType: string; resourceId: string } | null;
  pdfViewer: { open: boolean; fileId: string; fileName: string; mimeType: string; readOnly?: boolean } | null;
  openShareModal: (resourceType: string, resourceId: string) => void;
  closeShareModal: () => void;
  openPdfViewer: (fileId: string, fileName: string, mimeType: string, readOnly?: boolean) => void;
  closePdfViewer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  shareModal: null,
  pdfViewer: null,
  openShareModal: (resourceType, resourceId) =>
    set({ shareModal: { open: true, resourceType, resourceId } }),
  closeShareModal: () => set({ shareModal: null }),
  openPdfViewer: (fileId, fileName, mimeType, readOnly) =>
    set({ pdfViewer: { open: true, fileId, fileName, mimeType, readOnly } }),
  closePdfViewer: () => set({ pdfViewer: null }),
}));

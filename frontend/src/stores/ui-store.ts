'use client';

import { create } from 'zustand';

interface UIState {
  shareModal: { open: boolean; resourceType: string; resourceId: string } | null;
  pdfViewer: { open: boolean; fileId: string; fileName: string } | null;
  openShareModal: (resourceType: string, resourceId: string) => void;
  closeShareModal: () => void;
  openPdfViewer: (fileId: string, fileName: string) => void;
  closePdfViewer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  shareModal: null,
  pdfViewer: null,
  openShareModal: (resourceType, resourceId) =>
    set({ shareModal: { open: true, resourceType, resourceId } }),
  closeShareModal: () => set({ shareModal: null }),
  openPdfViewer: (fileId, fileName) =>
    set({ pdfViewer: { open: true, fileId, fileName } }),
  closePdfViewer: () => set({ pdfViewer: null }),
}));

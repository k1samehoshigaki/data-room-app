'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { filesApi } from '@/lib/api';

export function PdfViewerModal() {
  const { pdfViewer, closePdfViewer } = useUIStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfViewer?.open || !pdfViewer.fileId) return;
    const fileId = pdfViewer.fileId;
    let cancelled = false;
    filesApi
      .getPreviewUrl(fileId)
      .then((res) => { if (!cancelled) setPreviewUrl(res.data.url); })
      .catch(() => { if (!cancelled) setPreviewUrl(null); });
    return () => {
      cancelled = true;
      setPreviewUrl(null);
    };
  }, [pdfViewer?.open, pdfViewer?.fileId]);

  const handleDownload = async () => {
    if (!pdfViewer?.fileId || !pdfViewer?.fileName) return;
    const res = await filesApi.getDownloadUrl(pdfViewer.fileId);
    const a = document.createElement('a');
    a.href = res.data.url;
    a.download = pdfViewer.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isImage = pdfViewer?.mimeType?.startsWith('image/') ?? false;
  const isLoading = pdfViewer?.open && !previewUrl;

  return (
    <Dialog open={pdfViewer?.open ?? false} onOpenChange={(v) => { if (!v) closePdfViewer(); }}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-3 border-b shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="truncate pr-4 text-sm font-medium">{pdfViewer?.fileName}</DialogTitle>
          {!pdfViewer?.readOnly && (
            <Button variant="outline" size="sm" onClick={handleDownload} className="shrink-0 mr-8">
              <Download className="h-4 w-4 mr-1.5" />
              Download
            </Button>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center bg-muted/30">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}

          {previewUrl && isImage && (
            <div className="relative w-full h-full">
              <Image
                src={previewUrl}
                alt={pdfViewer?.fileName ?? 'Preview'}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          {previewUrl && !isImage && (
            <iframe src={previewUrl} className="w-full h-full" title={pdfViewer?.fileName} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

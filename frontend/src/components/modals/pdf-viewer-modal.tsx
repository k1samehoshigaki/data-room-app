'use client';

import { useEffect, useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { filesApi } from '@/lib/api';

export function PdfViewerModal() {
  const { pdfViewer, closePdfViewer } = useUIStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pdfViewer?.open && pdfViewer.fileId) {
      setLoading(true);
      setPreviewUrl(null);
      filesApi
        .getPreviewUrl(pdfViewer.fileId)
        .then((res) => setPreviewUrl(res.data.url))
        .finally(() => setLoading(false));
    } else {
      setPreviewUrl(null);
    }
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

  const isImage = pdfViewer?.mimeType?.startsWith('image/');

  return (
    <Dialog open={pdfViewer?.open ?? false} onOpenChange={(v) => { if (!v) closePdfViewer(); }}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-3 border-b shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="truncate pr-4 text-sm font-medium">{pdfViewer?.fileName}</DialogTitle>
          <Button variant="outline" size="sm" onClick={handleDownload} className="shrink-0 mr-8">
            <Download className="h-4 w-4 mr-1.5" />
            Download
          </Button>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center bg-muted/30">
          {loading && (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          )}
          {previewUrl && isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={pdfViewer?.fileName}
              className="max-w-full max-h-full object-contain"
            />
          )}
          {previewUrl && !isImage && (
            <iframe
              src={previewUrl}
              className="w-full h-full"
              title={pdfViewer?.fileName}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

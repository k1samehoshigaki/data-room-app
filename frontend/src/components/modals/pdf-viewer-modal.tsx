'use client';

import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUIStore } from '@/stores/ui-store';
import { filesApi } from '@/lib/api';

export function PdfViewerModal() {
  const { pdfViewer, closePdfViewer } = useUIStore();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pdfViewer?.open && pdfViewer.fileId) {
      setLoading(true);
      setPdfUrl(null);
      filesApi
        .getDownloadUrl(pdfViewer.fileId)
        .then((res) => setPdfUrl(res.data.url))
        .finally(() => setLoading(false));
    } else {
      setPdfUrl(null);
    }
  }, [pdfViewer?.open, pdfViewer?.fileId]);

  return (
    <Dialog open={pdfViewer?.open ?? false} onOpenChange={(v) => { if (!v) closePdfViewer(); }}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="truncate pr-8">{pdfViewer?.fileName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title={pdfViewer?.fileName}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

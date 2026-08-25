'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Database, AlertTriangle } from 'lucide-react';
import { FileBrowser } from '@/components/data-room/file-browser';
import { FileItem } from '@/components/data-room/file-item';
import { PdfViewerModal } from '@/components/modals/pdf-viewer-modal';
import { UploadDrawer } from '@/components/upload/upload-drawer';
import { sharingApi } from '@/lib/api';

interface SharedData {
  link: { resourceType: string; resourceId: string; token: string };
  folder?: unknown;
  folders?: unknown[];
  files?: unknown[];
  breadcrumbs?: unknown[];
  file?: unknown;
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const folderId = searchParams.get('folderId');

  const { data, isLoading, isError } = useQuery<SharedData>({
    queryKey: ['share', token, folderId],
    queryFn: async () => {
      const res = await sharingApi.getPublic(token, folderId ?? undefined);
      return res.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Link not found or expired</h2>
        <p className="text-muted-foreground">
          This share link may have been revoked or is no longer valid.
        </p>
      </div>
    );
  }

  const { link } = data;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground">
            <Database className="h-4 w-4" />
          </div>
          DataRoom
          <span className="text-xs font-normal text-muted-foreground border rounded px-1.5 py-0.5">
            View only
          </span>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl mx-auto py-6 px-4 md:px-6">
        {link.resourceType === 'FILE' && data.file ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Shared File</h2>
            <FileItem file={data.file as Parameters<typeof FileItem>[0]['file']} readOnly />
          </div>
        ) : (
          <FileBrowser
            roomId={link.resourceId}
            folderId={folderId ?? (link.resourceType === 'FOLDER' ? link.resourceId : null)}
            contents={{
              folder: (data.folder as Parameters<typeof FileBrowser>[0]['contents'] extends { folder: infer F } ? F : never) ?? null,
              folders: (data.folders ?? []) as Parameters<typeof FileBrowser>[0]['contents'] extends { folders: infer F } ? F : never,
              files: (data.files ?? []) as Parameters<typeof FileBrowser>[0]['contents'] extends { files: infer F } ? F : never,
              breadcrumbs: (data.breadcrumbs ?? []) as Parameters<typeof FileBrowser>[0]['contents'] extends { breadcrumbs: infer F } ? F : never,
            }}
            readOnly
          />
        )}
      </main>

      <PdfViewerModal />
      <UploadDrawer />
    </div>
  );
}

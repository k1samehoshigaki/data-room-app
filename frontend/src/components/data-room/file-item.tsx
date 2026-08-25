'use client';

import { useState } from 'react';
import {
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  Share2,
  Download,
  Eye,
  FolderInput,
  Image,
  File,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import type { FileRecord } from '@/hooks/use-folder';
import { RenameModal } from '@/components/modals/rename-modal';
import { DeleteFileDialog } from '@/components/modals/delete-file-dialog';
import { MoveFileModal } from '@/components/modals/move-file-modal';
import { formatBytes, formatDate, isPreviewable } from '@/lib/utils';
import { filesApi } from '@/lib/api';

interface FileItemProps {
  file: FileRecord;
  readOnly?: boolean;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-200/80 flex items-center justify-center shrink-0">
        <Image className="h-4 w-4 text-violet-500" />
      </div>
    );
  }
  if (mimeType === 'application/pdf') {
    return (
      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center justify-center shrink-0">
        <FileText className="h-4 w-4 text-rose-500" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
      <File className="h-4 w-4 text-slate-400" />
    </div>
  );
}

export function FileItem({ file, readOnly }: FileItemProps) {
  const { openShareModal, openPdfViewer } = useUIStore();
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [moving, setMoving] = useState(false);

  const handleDownload = async () => {
    const res = await filesApi.getDownloadUrl(file.id);
    const a = document.createElement('a');
    a.href = res.data.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePreview = () => {
    openPdfViewer(file.id, file.name, file.mimeType, readOnly);
  };

  return (
    <>
      <div className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/60 bg-card hover:border-primary/25 hover:bg-accent/40 cursor-pointer transition-all duration-150">
        <FileIcon mimeType={file.mimeType} />

        <div className="flex-1 min-w-0">
          <button
            className="font-medium text-sm truncate block w-full text-left hover:text-primary transition-colors"
            onClick={isPreviewable(file.mimeType) ? handlePreview : (readOnly ? undefined : handleDownload)}
          >
            {file.name}
          </button>
          <p className="text-xs text-muted-foreground">
            {formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}
          </p>
        </div>

        {!readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {isPreviewable(file.mimeType) && (
                <DropdownMenuItem onClick={handlePreview}>
                  <Eye className="h-4 w-4" /> Preview
                </DropdownMenuItem>
              )}
              {!readOnly && (
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4" /> Download
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setRenaming(true)}>
                <Pencil className="h-4 w-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMoving(true)}>
                <FolderInput className="h-4 w-4" /> Move
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openShareModal('FILE', file.id)}>
                <Share2 className="h-4 w-4" /> Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleting(true)}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {renaming && (
        <RenameModal
          open
          type="file"
          currentName={file.name}
          id={file.id}
          dataRoomId={file.dataRoomId}
          onClose={() => setRenaming(false)}
        />
      )}
      {deleting && (
        <DeleteFileDialog open file={file} onClose={() => setDeleting(false)} />
      )}
      {moving && (
        <MoveFileModal open file={file} onClose={() => setMoving(false)} />
      )}
    </>
  );
}

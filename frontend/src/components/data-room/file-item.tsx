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

export function FileItem({ file, readOnly }: FileItemProps) {
  const { openShareModal, openPdfViewer } = useUIStore();
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [moving, setMoving] = useState(false);

  const handleDownload = async () => {
    const res = await filesApi.getDownloadUrl(file.id);
    window.open(res.data.url, '_blank');
  };

  const handlePreview = () => {
    if (file.mimeType === 'application/pdf') {
      openPdfViewer(file.id, file.name);
    } else {
      handleDownload();
    }
  };

  return (
    <>
      <div className="group flex items-center gap-3 px-4 py-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors">
        <FileText className="h-5 w-5 text-rose-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <button
            className="font-medium text-sm truncate block w-full text-left hover:underline"
            onClick={isPreviewable(file.mimeType) ? handlePreview : handleDownload}
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
                className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isPreviewable(file.mimeType) && (
                <DropdownMenuItem onClick={handlePreview}>
                  <Eye className="h-4 w-4" /> Preview
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4" /> Download
              </DropdownMenuItem>
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

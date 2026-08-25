'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, MoreVertical, Pencil, Trash2, Share2, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import type { Folder as FolderType } from '@/hooks/use-folder';
import { RenameModal } from '@/components/modals/rename-modal';
import { DeleteFolderDialog } from '@/components/modals/delete-folder-dialog';
import { formatDate } from '@/lib/utils';

interface FolderItemProps {
  folder: FolderType;
  roomId: string;
  onRenamed?: () => void;
  readOnly?: boolean;
}

export function FolderItem({ folder, roomId, readOnly }: FolderItemProps) {
  const router = useRouter();
  const { openShareModal } = useUIStore();
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = () => router.push(`/rooms/${roomId}/folder/${folder.id}`);

  return (
    <>
      <div
        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/60 bg-card hover:border-primary/25 hover:bg-accent/40 cursor-pointer transition-all duration-150"
        onDoubleClick={navigate}
      >
        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
          <Folder className="h-4 w-4 text-amber-500 fill-amber-200" />
        </div>

        <div className="flex-1 min-w-0">
          <button
            onClick={navigate}
            className="font-medium text-sm truncate block w-full text-left hover:text-primary transition-colors"
          >
            {folder.name}
          </button>
          <p className="text-xs text-muted-foreground">{formatDate(folder.createdAt)}</p>
        </div>

        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 hidden sm:block group-hover:text-muted-foreground transition-colors" />

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
              <DropdownMenuItem onClick={() => setRenaming(true)}>
                <Pencil className="h-4 w-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openShareModal('FOLDER', folder.id)}>
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
          type="folder"
          currentName={folder.name}
          id={folder.id}
          dataRoomId={folder.dataRoomId}
          onClose={() => setRenaming(false)}
        />
      )}

      {deleting && (
        <DeleteFolderDialog
          open
          folder={folder}
          onClose={() => setDeleting(false)}
        />
      )}
    </>
  );
}

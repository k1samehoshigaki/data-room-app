'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, MoreVertical, Pencil, Trash2, Share2 } from 'lucide-react';
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
        className="group flex items-center gap-3 px-4 py-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
        onDoubleClick={navigate}
      >
        <Folder className="h-5 w-5 text-blue-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <button
            onClick={navigate}
            className="font-medium text-sm truncate block w-full text-left hover:underline"
          >
            {folder.name}
          </button>
          <p className="text-xs text-muted-foreground">{formatDate(folder.createdAt)}</p>
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

'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/data-room/app-shell';
import { FileBrowser } from '@/components/data-room/file-browser';
import { useFolderContents } from '@/hooks/use-folder';
import { useRooms } from '@/hooks/use-rooms';

export default function FolderPage() {
  const { roomId, folderId } = useParams<{ roomId: string; folderId: string }>();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const room = rooms.find((r) => r.id === roomId);
  const { data: contents, isLoading, isError } = useFolderContents(roomId, folderId);

  // If the room is not in the user's own rooms list (and rooms have loaded), treat as read-only shared access
  const readOnly = !roomsLoading && !room;

  if (isError) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h3 className="font-semibold text-lg mb-2">Folder not found</h3>
          <p className="text-muted-foreground text-sm">
            This folder may have been deleted or you don&apos;t have access to it.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <FileBrowser
        roomId={roomId}
        roomName={room?.name ?? contents?.folder?.name}
        folderId={folderId}
        contents={contents}
        isLoading={isLoading}
        readOnly={readOnly}
      />
    </AppShell>
  );
}

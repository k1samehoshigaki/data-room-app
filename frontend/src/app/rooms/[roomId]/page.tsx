'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/data-room/app-shell';
import { FileBrowser } from '@/components/data-room/file-browser';
import { useFolderContents } from '@/hooks/use-folder';
import { useRooms } from '@/hooks/use-rooms';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const room = rooms.find((r) => r.id === roomId);
  const { data: contents, isLoading } = useFolderContents(roomId, null);

  const readOnly = !roomsLoading && !room;

  return (
    <AppShell>
      <FileBrowser
        roomId={roomId}
        roomName={room?.name}
        folderId={null}
        contents={contents}
        isLoading={isLoading}
        readOnly={readOnly}
      />
    </AppShell>
  );
}

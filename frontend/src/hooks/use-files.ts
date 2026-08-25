'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/lib/api';
import { useUploadStore } from '@/stores/upload-store';

export function useUploadFiles() {
  const qc = useQueryClient();
  const { updateFile } = useUploadStore();

  return useMutation({
    mutationFn: async ({
      uploadFileId,
      file,
      dataRoomId,
      folderId,
    }: {
      uploadFileId: string;
      file: File;
      dataRoomId: string;
      folderId: string | null;
    }) => {
      updateFile(uploadFileId, { status: 'uploading', progress: 0 });

      const presignRes = await filesApi.presign({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        dataRoomId,
        folderId,
      });

      const { uploadUrl, storageKey } = presignRes.data;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            updateFile(uploadFileId, { progress: Math.round((e.loaded / e.total) * 100) });
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener('error', () => reject(new Error('Upload network error')));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.send(file);
      });

      await filesApi.register({
        name: file.name,
        storageKey,
        sizeBytes: file.size,
        mimeType: file.type || 'application/octet-stream',
        dataRoomId,
        folderId,
      });

      updateFile(uploadFileId, { status: 'done', progress: 100 });
      return { storageKey };
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['folder-contents', vars.dataRoomId] });
    },
    onError: (_e, vars) => {
      updateFile(vars.uploadFileId, { status: 'error', error: 'Upload failed' });
    },
  });
}

export function useRenameFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string; dataRoomId: string }) =>
      filesApi.rename(id, name),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['folder-contents', vars.dataRoomId] });
    },
  });
}

export function useMoveFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, folderId }: { id: string; folderId: string | null; dataRoomId: string }) =>
      filesApi.move(id, folderId),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['folder-contents', vars.dataRoomId] });
    },
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; dataRoomId: string }) => filesApi.delete(id),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['folder-contents', vars.dataRoomId] });
    },
  });
}

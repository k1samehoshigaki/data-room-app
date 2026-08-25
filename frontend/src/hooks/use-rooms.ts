'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataRoomsApi } from '@/lib/api';

export interface DataRoom {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export function useRooms() {
  return useQuery<DataRoom[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await dataRoomsApi.list();
      return res.data;
    },
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => dataRoomsApi.create(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => dataRoomsApi.update(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataRoomsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

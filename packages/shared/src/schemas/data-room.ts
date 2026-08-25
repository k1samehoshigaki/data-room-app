import { z } from 'zod';

export const createDataRoomSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});

export const updateDataRoomSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});

export type CreateDataRoomDto = z.infer<typeof createDataRoomSchema>;
export type UpdateDataRoomDto = z.infer<typeof updateDataRoomSchema>;

export const dataRoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DataRoom = z.infer<typeof dataRoomSchema>;

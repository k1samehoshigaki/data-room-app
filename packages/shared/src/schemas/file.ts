import { z } from 'zod';

export const presignedUploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().positive(),
  folderId: z.string().nullable().optional(),
  dataRoomId: z.string(),
});

export type PresignedUploadDto = z.infer<typeof presignedUploadSchema>;

export const registerFileSchema = z.object({
  name: z.string().min(1),
  storageKey: z.string(),
  sizeBytes: z.number().positive(),
  mimeType: z.string(),
  folderId: z.string().nullable().optional(),
  dataRoomId: z.string(),
});

export type RegisterFileDto = z.infer<typeof registerFileSchema>;

export const updateFileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});

export const moveFileSchema = z.object({
  folderId: z.string().nullable(),
});

export type UpdateFileDto = z.infer<typeof updateFileSchema>;
export type MoveFileDto = z.infer<typeof moveFileSchema>;

export const fileSchema = z.object({
  id: z.string(),
  dataRoomId: z.string(),
  folderId: z.string().nullable(),
  name: z.string(),
  storageKey: z.string(),
  sizeBytes: z.union([z.number(), z.bigint()]),
  mimeType: z.string(),
  currentVersion: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type FileRecord = z.infer<typeof fileSchema>;

export const presignedUploadResponseSchema = z.object({
  uploadUrl: z.string(),
  storageKey: z.string(),
});

export type PresignedUploadResponse = z.infer<typeof presignedUploadResponseSchema>;

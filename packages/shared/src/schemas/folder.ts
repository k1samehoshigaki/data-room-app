import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  parentId: z.string().nullable().optional(),
  dataRoomId: z.string(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});

export type CreateFolderDto = z.infer<typeof createFolderSchema>;
export type UpdateFolderDto = z.infer<typeof updateFolderSchema>;

export const breadcrumbSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Breadcrumb = z.infer<typeof breadcrumbSchema>;

export const folderSchema = z.object({
  id: z.string(),
  dataRoomId: z.string(),
  parentId: z.string().nullable(),
  name: z.string(),
  path: z.string(),
  depth: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Folder = z.infer<typeof folderSchema>;

export const folderStatsSchema = z.object({
  fileCount: z.number(),
  folderCount: z.number(),
  totalSizeBytes: z.number(),
});

export type FolderStats = z.infer<typeof folderStatsSchema>;

export const folderContentsSchema = z.object({
  folder: folderSchema.nullable(),
  folders: z.array(folderSchema),
  files: z.array(z.any()),
  breadcrumbs: z.array(breadcrumbSchema),
});

import { z } from 'zod';

export const resourceTypeSchema = z.enum(['DATA_ROOM', 'FOLDER', 'FILE']);
export type ResourceType = z.infer<typeof resourceTypeSchema>;

export const shareRoleSchema = z.enum(['VIEWER']);
export type ShareRole = z.infer<typeof shareRoleSchema>;

export const createSharePermissionSchema = z.object({
  resourceType: resourceTypeSchema,
  resourceId: z.string(),
  granteeEmail: z.string().email('Invalid email address'),
  role: shareRoleSchema.default('VIEWER'),
});

export type CreateSharePermissionDto = z.infer<typeof createSharePermissionSchema>;

export const createShareLinkSchema = z.object({
  resourceType: resourceTypeSchema,
  resourceId: z.string(),
  role: shareRoleSchema.default('VIEWER'),
  expiresAt: z.string().datetime().nullable().optional(),
});

export type CreateShareLinkDto = z.infer<typeof createShareLinkSchema>;

export const sharePermissionSchema = z.object({
  id: z.string(),
  resourceType: resourceTypeSchema,
  resourceId: z.string(),
  granteeUserId: z.string(),
  role: shareRoleSchema,
  createdById: z.string(),
  createdAt: z.string().datetime(),
  grantee: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatarUrl: z.string().nullable(),
  }),
});

export type SharePermission = z.infer<typeof sharePermissionSchema>;

export const shareLinkSchema = z.object({
  id: z.string(),
  resourceType: resourceTypeSchema,
  resourceId: z.string(),
  token: z.string(),
  role: shareRoleSchema,
  expiresAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
  createdById: z.string(),
  createdAt: z.string().datetime(),
});

export type ShareLink = z.infer<typeof shareLinkSchema>;

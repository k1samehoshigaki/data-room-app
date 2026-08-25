import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ResourceType, ShareRole } from '../generated/prisma/enums';

export type AccessResult =
  | { granted: true; role: 'OWNER' | ShareRole }
  | { granted: false };

@Injectable()
export class SharingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolves access to a resource.
   * Checks: owner → direct SharePermission → ancestor-inherited SharePermission → ShareLink (public token)
   */
  async resolveAccess(
    userId: string | null,
    resourceType: ResourceType,
    resourceId: string,
    shareToken?: string | null,
  ): Promise<AccessResult> {
    const { dataRoomId, ancestorFolderIds } = await this.resolveAncestors(
      resourceType,
      resourceId,
    );

    // Check ownership
    if (userId && dataRoomId) {
      const room = await this.prisma.dataRoom.findUnique({ where: { id: dataRoomId } });
      if (room?.ownerId === userId) return { granted: true, role: 'OWNER' };
    }

    // Check direct or inherited SharePermission
    if (userId) {
      const resourceIds = [resourceId, ...ancestorFolderIds];
      if (dataRoomId) resourceIds.push(dataRoomId);

      const permission = await this.prisma.sharePermission.findFirst({
        where: {
          granteeUserId: userId,
          OR: resourceIds.map((id) => ({
            resourceId: id,
          })),
        },
      });
      if (permission) return { granted: true, role: permission.role };
    }

    // Check public ShareLink
    if (shareToken) {
      const link = await this.prisma.shareLink.findFirst({
        where: {
          token: shareToken,
          revokedAt: null,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      });

      if (link) {
        const validResourceIds = [resourceId, ...ancestorFolderIds];
        if (dataRoomId) validResourceIds.push(dataRoomId);
        if (validResourceIds.includes(link.resourceId)) {
          return { granted: true, role: link.role };
        }
      }
    }

    return { granted: false };
  }

  private async resolveAncestors(
    resourceType: ResourceType,
    resourceId: string,
  ): Promise<{ dataRoomId: string | null; ancestorFolderIds: string[] }> {
    if (resourceType === 'DATA_ROOM') {
      return { dataRoomId: resourceId, ancestorFolderIds: [] };
    }

    if (resourceType === 'FOLDER') {
      const folder = await this.prisma.folder.findUnique({ where: { id: resourceId } });
      if (!folder) return { dataRoomId: null, ancestorFolderIds: [] };
      const ancestorFolderIds = folder.path.split('/').filter(Boolean);
      return { dataRoomId: folder.dataRoomId, ancestorFolderIds };
    }

    if (resourceType === 'FILE') {
      const file = await this.prisma.file.findUnique({
        where: { id: resourceId },
        include: { folder: true },
      });
      if (!file) return { dataRoomId: null, ancestorFolderIds: [] };
      const ancestorFolderIds = file.folderId
        ? file.folder?.path.split('/').filter(Boolean) ?? []
        : [];
      return { dataRoomId: file.dataRoomId, ancestorFolderIds };
    }

    return { dataRoomId: null, ancestorFolderIds: [] };
  }

  async createPermission(data: {
    resourceType: ResourceType;
    resourceId: string;
    granteeEmail: string;
    role: ShareRole;
    createdById: string;
  }) {
    const grantee = await this.prisma.user.findUnique({
      where: { email: data.granteeEmail },
    });
    if (!grantee) throw new BadRequestException('User with this email not found');
    if (grantee.id === data.createdById) {
      throw new BadRequestException('Cannot share with yourself');
    }

    const existing = await this.prisma.sharePermission.findFirst({
      where: {
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        granteeUserId: grantee.id,
      },
    });
    if (existing) throw new BadRequestException('Already shared with this user');

    return this.prisma.sharePermission.create({
      data: {
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        granteeUserId: grantee.id,
        role: data.role,
        createdById: data.createdById,
      },
      include: {
        grantee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async listPermissions(resourceType: ResourceType, resourceId: string) {
    return this.prisma.sharePermission.findMany({
      where: { resourceType, resourceId },
      include: {
        grantee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deletePermission(id: string, requesterId: string) {
    const perm = await this.prisma.sharePermission.findUnique({ where: { id } });
    if (!perm) throw new NotFoundException('Permission not found');
    if (perm.createdById !== requesterId) throw new ForbiddenException();
    await this.prisma.sharePermission.delete({ where: { id } });
  }

  async createLink(data: {
    resourceType: ResourceType;
    resourceId: string;
    role: ShareRole;
    expiresAt?: Date | null;
    createdById: string;
  }) {
    const existing = await this.prisma.shareLink.findFirst({
      where: {
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        createdById: data.createdById,
        revokedAt: null,
      },
    });
    if (existing) return existing;

    return this.prisma.shareLink.create({
      data: {
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        role: data.role,
        expiresAt: data.expiresAt ?? null,
        createdById: data.createdById,
      },
    });
  }

  async listLinks(resourceType: ResourceType, resourceId: string, userId: string) {
    return this.prisma.shareLink.findMany({
      where: { resourceType, resourceId, createdById: userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async revokeLink(id: string, requesterId: string) {
    const link = await this.prisma.shareLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException('Share link not found');
    if (link.createdById !== requesterId) throw new ForbiddenException();
    return this.prisma.shareLink.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async getDataRoomIdForResource(resourceType: ResourceType, resourceId: string): Promise<string | null> {
    if (resourceType === 'DATA_ROOM') return resourceId;
    if (resourceType === 'FOLDER') {
      const folder = await this.prisma.folder.findUnique({ where: { id: resourceId } });
      return folder?.dataRoomId ?? null;
    }
    const file = await this.prisma.file.findUnique({ where: { id: resourceId } });
    return file?.dataRoomId ?? null;
  }

  async listSharedWithMe(userId: string) {
    const permissions = await this.prisma.sharePermission.findMany({
      where: { granteeUserId: userId },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      permissions.map(async (perm) => {
        let resourceName: string | null = null;
        let dataRoomId: string | null = null;

        if (perm.resourceType === 'DATA_ROOM') {
          const room = await this.prisma.dataRoom.findUnique({
            where: { id: perm.resourceId },
            select: { name: true },
          });
          resourceName = room?.name ?? null;
          dataRoomId = perm.resourceId;
        } else if (perm.resourceType === 'FOLDER') {
          const folder = await this.prisma.folder.findUnique({
            where: { id: perm.resourceId },
            select: { name: true, dataRoomId: true },
          });
          resourceName = folder?.name ?? null;
          dataRoomId = folder?.dataRoomId ?? null;
        } else if (perm.resourceType === 'FILE') {
          const file = await this.prisma.file.findUnique({
            where: { id: perm.resourceId },
            select: { name: true, mimeType: true, dataRoomId: true },
          });
          resourceName = file?.name ?? null;
          dataRoomId = file?.dataRoomId ?? null;
        }

        return { ...perm, resourceName, dataRoomId };
      }),
    );
  }

  async getPublicResource(token: string) {
    const link = await this.prisma.shareLink.findFirst({
      where: {
        token,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (!link) throw new NotFoundException('Share link not found or expired');
    return link;
  }
}

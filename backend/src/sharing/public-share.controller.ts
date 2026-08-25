import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { SharingService } from './sharing.service';
import { FoldersService } from '../folders/folders.service';
import { PrismaService } from '../prisma/prisma.service';
import type { ResourceType } from '../generated/prisma/enums';

@Controller('share')
export class PublicShareController {
  constructor(
    private readonly sharingService: SharingService,
    private readonly foldersService: FoldersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':token')
  async getSharedResource(
    @Param('token') token: string,
    @Query('folderId') folderId?: string,
  ) {
    const link = await this.sharingService.getPublicResource(token);

    if (link.resourceType === 'DATA_ROOM' || link.resourceType === 'FOLDER') {
      const targetFolderId =
        folderId ?? (link.resourceType === 'FOLDER' ? link.resourceId : null);
      const contents = await this.foldersService.getContents(
        await this.getDataRoomId(link.resourceType as ResourceType, link.resourceId),
        targetFolderId,
      );

      // Verify the requested folder is within the shared scope
      if (folderId && link.resourceType === 'FOLDER') {
        const targetFolder = await this.foldersService.findById(folderId);
        if (!targetFolder) throw new NotFoundException('Folder not found');
        const sharedFolder = await this.foldersService.findById(link.resourceId);
        if (!sharedFolder) throw new NotFoundException('Shared resource not found');
        if (!targetFolder.path.startsWith(sharedFolder.path)) {
          throw new NotFoundException('Folder is not within shared scope');
        }
      }

      return { link, ...contents };
    }

    if (link.resourceType === 'FILE') {
      const file = await this.prisma.file.findUnique({ where: { id: link.resourceId } });
      if (!file) throw new NotFoundException('File not found');
      return { link, file: { ...file, sizeBytes: file.sizeBytes.toString() } };
    }

    throw new NotFoundException('Unknown resource type');
  }

  private async getDataRoomId(resourceType: ResourceType, resourceId: string): Promise<string> {
    if (resourceType === 'DATA_ROOM') return resourceId;
    const id = await this.sharingService.getDataRoomIdForResource(resourceType, resourceId);
    if (!id) throw new NotFoundException('Resource not found');
    return id;
  }
}

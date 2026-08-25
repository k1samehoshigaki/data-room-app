import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { z } from 'zod';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SharingService } from './sharing.service';
import { DataRoomsService } from '../data-rooms/data-rooms.service';
import type { ResourceType, ShareRole } from '../generated/prisma/enums';

const resourceTypeValues = ['DATA_ROOM', 'FOLDER', 'FILE'] as const;

const createPermissionSchema = z.object({
  resourceType: z.enum(resourceTypeValues),
  resourceId: z.string().min(1),
  granteeEmail: z.string().email(),
  role: z.enum(['VIEWER']).default('VIEWER'),
});

const createLinkSchema = z.object({
  resourceType: z.enum(resourceTypeValues),
  resourceId: z.string().min(1),
  role: z.enum(['VIEWER']).default('VIEWER'),
  expiresAt: z.string().datetime().nullable().optional(),
});

@UseGuards(JwtAuthGuard)
@Controller('sharing')
export class SharingController {
  constructor(
    private readonly sharingService: SharingService,
    private readonly dataRoomsService: DataRoomsService,
  ) {}

  private async assertOwner(
    resourceType: ResourceType,
    resourceId: string,
    userId: string,
  ): Promise<void> {
    const dataRoomId = await this.sharingService.getDataRoomIdForResource(
      resourceType,
      resourceId,
    );
    if (!dataRoomId) throw new BadRequestException('Resource not found');
    const isOwner = await this.dataRoomsService.isOwner(dataRoomId, userId);
    if (!isOwner) throw new ForbiddenException();
  }

  @Post('permissions')
  async createPermission(@Body() body: unknown, @CurrentUser() user: { sub: string }) {
    const parsed = createPermissionSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten().fieldErrors);
    await this.assertOwner(parsed.data.resourceType as ResourceType, parsed.data.resourceId, user.sub);
    return this.sharingService.createPermission({
      resourceType: parsed.data.resourceType as ResourceType,
      resourceId: parsed.data.resourceId,
      granteeEmail: parsed.data.granteeEmail,
      role: parsed.data.role as ShareRole,
      createdById: user.sub,
    });
  }

  @Get('permissions')
  async listPermissions(
    @Query('resourceType') resourceType: string,
    @Query('resourceId') resourceId: string,
    @CurrentUser() user: { sub: string },
  ) {
    if (!resourceType || !resourceId) {
      throw new BadRequestException('resourceType and resourceId required');
    }
    await this.assertOwner(resourceType as ResourceType, resourceId, user.sub);
    return this.sharingService.listPermissions(resourceType as ResourceType, resourceId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('permissions/:id')
  deletePermission(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.sharingService.deletePermission(id, user.sub);
  }

  @Post('links')
  async createLink(@Body() body: unknown, @CurrentUser() user: { sub: string }) {
    const parsed = createLinkSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten().fieldErrors);
    await this.assertOwner(parsed.data.resourceType as ResourceType, parsed.data.resourceId, user.sub);
    return this.sharingService.createLink({
      resourceType: parsed.data.resourceType as ResourceType,
      resourceId: parsed.data.resourceId,
      role: parsed.data.role as ShareRole,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      createdById: user.sub,
    });
  }

  @Get('links')
  async listLinks(
    @Query('resourceType') resourceType: string,
    @Query('resourceId') resourceId: string,
    @CurrentUser() user: { sub: string },
  ) {
    if (!resourceType || !resourceId) {
      throw new BadRequestException('resourceType and resourceId required');
    }
    return this.sharingService.listLinks(resourceType as ResourceType, resourceId, user.sub);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('links/:id')
  revokeLink(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.sharingService.revokeLink(id, user.sub);
  }
}

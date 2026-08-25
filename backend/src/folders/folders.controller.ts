import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { FoldersService } from './folders.service';
import { DataRoomsService } from '../data-rooms/data-rooms.service';
import { SharingService } from '../sharing/sharing.service';

const createSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().nullable().optional(),
  dataRoomId: z.string().min(1),
});

const updateSchema = z.object({ name: z.string().min(1).max(255) });

@UseGuards(JwtAuthGuard)
@Controller('folders')
export class FoldersController {
  constructor(
    private readonly foldersService: FoldersService,
    private readonly dataRoomsService: DataRoomsService,
    private readonly sharingService: SharingService,
  ) {}

  @Get()
  async getContents(
    @Query('dataRoomId') dataRoomId: string,
    @Query('folderId') folderId: string | undefined,
    @CurrentUser() user: { sub: string },
  ) {
    if (!dataRoomId) throw new BadRequestException('dataRoomId is required');

    const isOwner = await this.dataRoomsService.isOwner(dataRoomId, user.sub);
    if (!isOwner) {
      // Non-owners may still have SharePermission on this folder or its data room
      const resourceType = folderId ? 'FOLDER' : 'DATA_ROOM';
      const resourceId = folderId ?? dataRoomId;
      const access = await this.sharingService.resolveAccess(user.sub, resourceType, resourceId);
      if (!access.granted) throw new ForbiddenException();
    }

    return this.foldersService.getContents(dataRoomId, folderId ?? null);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    const folder = await this.foldersService.findById(id);
    if (!folder) throw new BadRequestException('Folder not found');
    const isOwner = await this.dataRoomsService.isOwner(folder.dataRoomId, user.sub);
    if (!isOwner) throw new ForbiddenException();
    return this.foldersService.getStats(id);
  }

  @Post()
  async create(@Body() body: unknown, @CurrentUser() user: { sub: string }) {
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten().fieldErrors);
    const isOwner = await this.dataRoomsService.isOwner(parsed.data.dataRoomId, user.sub);
    if (!isOwner) throw new ForbiddenException();
    return this.foldersService.create(parsed.data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: { sub: string },
  ) {
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten().fieldErrors);
    const folder = await this.foldersService.findById(id);
    if (!folder) throw new BadRequestException('Folder not found');
    const isOwner = await this.dataRoomsService.isOwner(folder.dataRoomId, user.sub);
    if (!isOwner) throw new ForbiddenException();
    return this.foldersService.update(id, parsed.data.name);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    const folder = await this.foldersService.findById(id);
    if (!folder) throw new BadRequestException('Folder not found');
    const isOwner = await this.dataRoomsService.isOwner(folder.dataRoomId, user.sub);
    if (!isOwner) throw new ForbiddenException();
    return this.foldersService.delete(id);
  }
}

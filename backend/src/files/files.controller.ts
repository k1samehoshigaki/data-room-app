import {
  Controller,
  Post,
  Patch,
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
import { FilesService } from './files.service';
import { DataRoomsService } from '../data-rooms/data-rooms.service';

const presignSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  folderId: z.string().nullable().optional(),
  dataRoomId: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().min(1),
  storageKey: z.string().min(1),
  sizeBytes: z.number().positive(),
  mimeType: z.string().min(1),
  folderId: z.string().nullable().optional(),
  dataRoomId: z.string().min(1),
});

const renameSchema = z.object({ name: z.string().min(1).max(255) });
const moveSchema = z.object({ folderId: z.string().nullable() });

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly dataRoomsService: DataRoomsService,
  ) {}

  @Post('presign')
  async presign(@Body() body: unknown, @CurrentUser() user: { sub: string }) {
    const parsed = presignSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten().fieldErrors);
    const isOwner = await this.dataRoomsService.isOwner(parsed.data.dataRoomId, user.sub);
    if (!isOwner) throw new ForbiddenException();
    return this.filesService.getPresignedUpload(parsed.data);
  }

  @Post()
  async register(@Body() body: unknown, @CurrentUser() user: { sub: string }) {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten().fieldErrors);
    const isOwner = await this.dataRoomsService.isOwner(parsed.data.dataRoomId, user.sub);
    if (!isOwner) throw new ForbiddenException();
    return this.filesService.register(parsed.data);
  }

  @Get('search')
  async search(
    @Query('dataRoomId') dataRoomId: string,
    @Query('q') q: string,
    @CurrentUser() user: { sub: string },
  ) {
    if (!dataRoomId || !q) throw new BadRequestException('dataRoomId and q are required');
    const isOwner = await this.dataRoomsService.isOwner(dataRoomId, user.sub);
    if (!isOwner) throw new ForbiddenException();
    return this.filesService.search(dataRoomId, q);
  }

  @Get(':id/download-url')
  async getDownloadUrl(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    const file = await this.filesService.findById(id);
    if (!file) throw new BadRequestException('File not found');
    const isOwner = await this.dataRoomsService.isOwner(file.dataRoomId, user.sub);
    if (!isOwner) throw new ForbiddenException();
    const url = await this.filesService.getDownloadUrl(id);
    return { url };
  }

  @Patch(':id/rename')
  async rename(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: { sub: string },
  ) {
    const parsed = renameSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten().fieldErrors);
    const file = await this.filesService.findById(id);
    if (!file) throw new BadRequestException('File not found');
    const isOwner = await this.dataRoomsService.isOwner(file.dataRoomId, user.sub);
    if (!isOwner) throw new ForbiddenException();
    return this.filesService.rename(id, parsed.data.name);
  }

  @Patch(':id/move')
  async move(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: { sub: string },
  ) {
    const parsed = moveSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten().fieldErrors);
    const file = await this.filesService.findById(id);
    if (!file) throw new BadRequestException('File not found');
    const isOwner = await this.dataRoomsService.isOwner(file.dataRoomId, user.sub);
    if (!isOwner) throw new ForbiddenException();
    return this.filesService.move(id, parsed.data.folderId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    const file = await this.filesService.findById(id);
    if (!file) throw new BadRequestException('File not found');
    const isOwner = await this.dataRoomsService.isOwner(file.dataRoomId, user.sub);
    if (!isOwner) throw new ForbiddenException();
    return this.filesService.delete(id);
  }
}

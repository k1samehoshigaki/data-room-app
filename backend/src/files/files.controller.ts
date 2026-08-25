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
import { SharingService } from '../sharing/sharing.service';

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
  conflictStrategy: z.enum(['reject', 'auto-rename', 'version']).optional(),
});

const renameSchema = z.object({ name: z.string().min(1).max(255) });
const moveSchema = z.object({ folderId: z.string().nullable() });

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly dataRoomsService: DataRoomsService,
    private readonly sharingService: SharingService,
  ) {}

  /** Resolves a file and asserts the user owns its data room. Returns the file for reuse. */
  private async assertWriteAccess(fileId: string, userId: string) {
    const file = await this.filesService.findById(fileId);
    if (!file) throw new BadRequestException('File not found');
    const isOwner = await this.dataRoomsService.isOwner(file.dataRoomId, userId);
    if (!isOwner) throw new ForbiddenException();
    return file;
  }

  /** Asserts the user owns the file's data room OR has an explicit SharePermission. */
  private async assertReadAccess(fileId: string, userId: string): Promise<void> {
    const file = await this.filesService.findById(fileId);
    if (!file) throw new BadRequestException('File not found');
    const isOwner = await this.dataRoomsService.isOwner(file.dataRoomId, userId);
    if (isOwner) return;
    const access = await this.sharingService.resolveAccess(userId, 'FILE', fileId);
    if (!access.granted) throw new ForbiddenException();
  }

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

  @Get(':id/versions')
  async getVersions(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    await this.assertWriteAccess(id, user.sub);
    return this.filesService.getVersions(id);
  }

  @Get(':id/download-url')
  async getDownloadUrl(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    await this.assertReadAccess(id, user.sub);
    const url = await this.filesService.getDownloadUrl(id);
    return { url };
  }

  @Get(':id/preview-url')
  async getPreviewUrl(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    await this.assertReadAccess(id, user.sub);
    const url = await this.filesService.getPreviewUrl(id);
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
    await this.assertWriteAccess(id, user.sub);
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
    await this.assertWriteAccess(id, user.sub);
    return this.filesService.move(id, parsed.data.folderId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    await this.assertWriteAccess(id, user.sub);
    return this.filesService.delete(id);
  }
}

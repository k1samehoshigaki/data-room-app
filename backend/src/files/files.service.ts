import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import type { File as FileRecord } from '../generated/prisma/client';

function serializeFile(f: FileRecord) {
  return { ...f, sizeBytes: f.sizeBytes.toString() };
}

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  private async checkNameConflict(
    dataRoomId: string,
    folderId: string | null,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.file.findFirst({
      where: {
        dataRoomId,
        folderId: folderId ?? null,
        name,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (existing) throw new ConflictException(`A file named "${name}" already exists here`);
  }

  async getPresignedUpload(data: {
    fileName: string;
    contentType: string;
    folderId?: string | null;
    dataRoomId: string;
  }): Promise<{ uploadUrl: string; storageKey: string }> {
    const storageKey = this.s3.generateStorageKey(data.fileName);
    const uploadUrl = await this.s3.getPresignedUploadUrl(storageKey, data.contentType);
    return { uploadUrl, storageKey };
  }

  async register(data: {
    name: string;
    storageKey: string;
    sizeBytes: number;
    mimeType: string;
    folderId?: string | null;
    dataRoomId: string;
  }) {
    await this.checkNameConflict(data.dataRoomId, data.folderId ?? null, data.name);

    const file = await this.prisma.file.create({
      data: {
        name: data.name,
        storageKey: data.storageKey,
        sizeBytes: BigInt(data.sizeBytes),
        mimeType: data.mimeType,
        folderId: data.folderId ?? null,
        dataRoomId: data.dataRoomId,
      },
    });

    return serializeFile(file);
  }

  async findById(id: string): Promise<FileRecord | null> {
    return this.prisma.file.findUnique({ where: { id } });
  }

  async getDownloadUrl(id: string): Promise<string> {
    const file = await this.findById(id);
    if (!file) throw new NotFoundException('File not found');
    return this.s3.getPresignedDownloadUrl(file.storageKey);
  }

  async rename(id: string, name: string) {
    const file = await this.findById(id);
    if (!file) throw new NotFoundException('File not found');
    await this.checkNameConflict(file.dataRoomId, file.folderId, name, id);
    const updated = await this.prisma.file.update({ where: { id }, data: { name } });
    return serializeFile(updated);
  }

  async move(id: string, targetFolderId: string | null) {
    const file = await this.findById(id);
    if (!file) throw new NotFoundException('File not found');
    await this.checkNameConflict(file.dataRoomId, targetFolderId, file.name, id);
    const updated = await this.prisma.file.update({
      where: { id },
      data: { folderId: targetFolderId },
    });
    return serializeFile(updated);
  }

  async delete(id: string): Promise<void> {
    const file = await this.findById(id);
    if (!file) throw new NotFoundException('File not found');
    await this.s3.deleteObject(file.storageKey).catch(() => null);
    await this.prisma.file.delete({ where: { id } });
  }

  async search(dataRoomId: string, query: string) {
    const files = await this.prisma.file.findMany({
      where: {
        dataRoomId,
        name: { contains: query, mode: 'insensitive' },
      },
      include: { folder: true },
      orderBy: { name: 'asc' },
      take: 50,
    });
    return files.map((f) => ({ ...serializeFile(f), folder: f.folder }));
  }
}

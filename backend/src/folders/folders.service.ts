import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Folder } from '../generated/prisma/client';

export type Breadcrumb = { id: string; name: string };

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  private buildPath(parentPath: string | null, id: string): string {
    return parentPath ? `${parentPath}/${id}` : `/${id}`;
  }

  private parseBreadcrumbs(path: string, foldersMap: Map<string, Folder>): Breadcrumb[] {
    const ids = path.split('/').filter(Boolean);
    return ids.map((id) => {
      const f = foldersMap.get(id);
      return { id, name: f?.name ?? id };
    });
  }

  async checkNameConflict(
    dataRoomId: string,
    parentId: string | null,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.folder.findFirst({
      where: {
        dataRoomId,
        parentId: parentId ?? null,
        name,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (existing) throw new ConflictException(`A folder named "${name}" already exists here`);
  }

  async create(data: {
    dataRoomId: string;
    parentId?: string | null;
    name: string;
  }): Promise<Folder> {
    await this.checkNameConflict(data.dataRoomId, data.parentId ?? null, data.name);

    let parentPath: string | null = null;
    let depth = 0;

    if (data.parentId) {
      const parent = await this.prisma.folder.findUnique({ where: { id: data.parentId } });
      if (!parent) throw new NotFoundException('Parent folder not found');
      parentPath = parent.path;
      depth = parent.depth + 1;
    }

    const tempId = crypto.randomUUID();
    const path = this.buildPath(parentPath, tempId);

    const folder = await this.prisma.folder.create({
      data: {
        id: tempId,
        dataRoomId: data.dataRoomId,
        parentId: data.parentId ?? null,
        name: data.name,
        path,
        depth,
      },
    });

    return folder;
  }

  async update(id: string, name: string): Promise<Folder> {
    const folder = await this.prisma.folder.findUnique({ where: { id } });
    if (!folder) throw new NotFoundException('Folder not found');

    await this.checkNameConflict(folder.dataRoomId, folder.parentId, name, id);

    return this.prisma.folder.update({ where: { id }, data: { name } });
  }

  async findById(id: string): Promise<Folder | null> {
    return this.prisma.folder.findUnique({ where: { id } });
  }

  async getContents(
    dataRoomId: string,
    folderId: string | null,
  ): Promise<{
    folder: Folder | null;
    folders: Folder[];
    files: unknown[];
    breadcrumbs: Breadcrumb[];
  }> {
    let currentFolder: Folder | null = null;
    let breadcrumbs: Breadcrumb[] = [];

    if (folderId) {
      currentFolder = await this.prisma.folder.findUnique({ where: { id: folderId } });
      if (!currentFolder) throw new NotFoundException('Folder not found');

      const ancestorIds = currentFolder.path.split('/').filter(Boolean);
      const ancestors = await this.prisma.folder.findMany({
        where: { id: { in: ancestorIds } },
      });
      const map = new Map(ancestors.map((f) => [f.id, f]));
      breadcrumbs = this.parseBreadcrumbs(currentFolder.path, map);
    }

    const folders = await this.prisma.folder.findMany({
      where: { dataRoomId, parentId: folderId ?? null },
      orderBy: { name: 'asc' },
    });

    const files = await this.prisma.file.findMany({
      where: { dataRoomId, folderId: folderId ?? null },
      orderBy: { name: 'asc' },
    });

    const serializedFiles = files.map((f) => ({
      ...f,
      sizeBytes: f.sizeBytes.toString(),
    }));

    return { folder: currentFolder, folders, files: serializedFiles, breadcrumbs };
  }

  async getStats(folderId: string): Promise<{
    fileCount: number;
    folderCount: number;
    totalSizeBytes: string;
  }> {
    const folder = await this.prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder) throw new NotFoundException('Folder not found');

    const pathPrefix = `${folder.path}/`;

    const [descendantFolders, fileAgg] = await Promise.all([
      this.prisma.folder.count({
        where: {
          dataRoomId: folder.dataRoomId,
          path: { startsWith: pathPrefix },
        },
      }),
      this.prisma.file.aggregate({
        where: {
          dataRoomId: folder.dataRoomId,
          folder: {
            OR: [{ id: folderId }, { path: { startsWith: pathPrefix } }],
          },
        },
        _count: { id: true },
        _sum: { sizeBytes: true },
      }),
    ]);

    return {
      fileCount: fileAgg._count.id,
      folderCount: descendantFolders + 1,
      totalSizeBytes: (fileAgg._sum.sizeBytes ?? BigInt(0)).toString(),
    };
  }

  async delete(id: string): Promise<void> {
    const folder = await this.prisma.folder.findUnique({ where: { id } });
    if (!folder) throw new NotFoundException('Folder not found');
    await this.prisma.folder.delete({ where: { id } });
  }

  async belongsToDataRoom(folderId: string, dataRoomId: string): Promise<boolean> {
    const f = await this.prisma.folder.findFirst({ where: { id: folderId, dataRoomId } });
    return f !== null;
  }

  async getAncestorIds(folderId: string): Promise<string[]> {
    const f = await this.prisma.folder.findUnique({ where: { id: folderId } });
    if (!f) return [];
    return f.path.split('/').filter(Boolean);
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DataRoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async listByOwner(ownerId: string) {
    return this.prisma.dataRoom.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.dataRoom.findUnique({ where: { id } });
  }

  async create(ownerId: string, name: string) {
    return this.prisma.dataRoom.create({
      data: { ownerId, name },
    });
  }

  async update(id: string, ownerId: string, name: string) {
    const room = await this.findById(id);
    if (!room) throw new NotFoundException('Data room not found');
    if (room.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.dataRoom.update({ where: { id }, data: { name } });
  }

  async delete(id: string, ownerId: string) {
    const room = await this.findById(id);
    if (!room) throw new NotFoundException('Data room not found');
    if (room.ownerId !== ownerId) throw new ForbiddenException();
    await this.prisma.dataRoom.delete({ where: { id } });
  }

  async isOwner(dataRoomId: string, userId: string): Promise<boolean> {
    const room = await this.prisma.dataRoom.findUnique({ where: { id: dataRoomId } });
    return room?.ownerId === userId;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '../generated/prisma/client';

export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      omit: { passwordHash: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  async createUser(data: {
    email: string;
    name: string;
    passwordHash?: string;
    googleId?: string;
    avatarUrl?: string;
  }): Promise<SafeUser> {
    return this.prisma.user.create({
      data,
      omit: { passwordHash: true },
    });
  }

  async upsertGoogleUser(data: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<SafeUser> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: data.googleId }, { email: data.email }] },
    });

    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          googleId: data.googleId,
          avatarUrl: data.avatarUrl ?? existing.avatarUrl,
        },
        omit: { passwordHash: true },
      });
    }

    return this.prisma.user.create({
      data,
      omit: { passwordHash: true },
    });
  }
}

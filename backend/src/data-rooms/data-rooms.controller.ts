import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { z } from 'zod';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DataRoomsService } from './data-rooms.service';

const nameSchema = z.object({ name: z.string().min(1).max(255) });

@UseGuards(JwtAuthGuard)
@Controller('data-rooms')
export class DataRoomsController {
  constructor(private readonly dataRoomsService: DataRoomsService) {}

  @Get()
  list(@CurrentUser() user: { sub: string }) {
    return this.dataRoomsService.listByOwner(user.sub);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    const room = await this.dataRoomsService.findById(id);
    if (!room || room.ownerId !== user.sub) {
      throw new BadRequestException('Data room not found');
    }
    return room;
  }

  @Post()
  create(@Body() body: unknown, @CurrentUser() user: { sub: string }) {
    const parsed = nameSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten().fieldErrors);
    return this.dataRoomsService.create(user.sub, parsed.data.name);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: { sub: string },
  ) {
    const parsed = nameSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten().fieldErrors);
    return this.dataRoomsService.update(id, user.sub, parsed.data.name);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.dataRoomsService.delete(id, user.sub);
  }
}

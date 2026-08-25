import { Module } from '@nestjs/common';
import { SharingController } from './sharing.controller';
import { PublicShareController } from './public-share.controller';
import { SharingService } from './sharing.service';
import { DataRoomsModule } from '../data-rooms/data-rooms.module';
import { FoldersModule } from '../folders/folders.module';

@Module({
  imports: [DataRoomsModule, FoldersModule],
  controllers: [SharingController, PublicShareController],
  providers: [SharingService],
  exports: [SharingService],
})
export class SharingModule {}

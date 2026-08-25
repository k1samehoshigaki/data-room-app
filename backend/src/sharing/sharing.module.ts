import { Module, forwardRef } from '@nestjs/common';
import { SharingController } from './sharing.controller';
import { PublicShareController } from './public-share.controller';
import { SharingService } from './sharing.service';
import { DataRoomsModule } from '../data-rooms/data-rooms.module';
import { FoldersModule } from '../folders/folders.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [DataRoomsModule, forwardRef(() => FoldersModule), forwardRef(() => FilesModule)],
  controllers: [SharingController, PublicShareController],
  providers: [SharingService],
  exports: [SharingService],
})
export class SharingModule {}

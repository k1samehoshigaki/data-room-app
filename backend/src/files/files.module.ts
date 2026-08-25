import { Module, forwardRef } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { DataRoomsModule } from '../data-rooms/data-rooms.module';
import { SharingModule } from '../sharing/sharing.module';

@Module({
  imports: [DataRoomsModule, forwardRef(() => SharingModule)],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}

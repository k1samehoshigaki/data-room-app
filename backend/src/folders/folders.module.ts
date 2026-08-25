import { Module, forwardRef } from '@nestjs/common';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { DataRoomsModule } from '../data-rooms/data-rooms.module';
import { SharingModule } from '../sharing/sharing.module';

@Module({
  imports: [DataRoomsModule, forwardRef(() => SharingModule)],
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}

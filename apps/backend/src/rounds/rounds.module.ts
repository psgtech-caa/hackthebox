import { Module } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { RoundsController } from './rounds.controller';

@Module({
  providers: [RoundsService],
  controllers: [RoundsController],
  exports: [RoundsService],
})
export class RoundsModule {}

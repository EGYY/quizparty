import { Global, Module } from '@nestjs/common';
import { BullMqConnectionService } from './bullmq-connection';
import { RedisService } from './redis.service';
import { RoomStateService } from './room-state.service';

@Global()
@Module({
  providers: [RedisService, RoomStateService, BullMqConnectionService],
  exports: [RedisService, RoomStateService, BullMqConnectionService],
})
export class RedisModule {}

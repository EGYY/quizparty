import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { GameGateway } from './game.gateway';
import { GamePlayService } from './gameplay.service';
import { GameRealtimeService } from './game-realtime.service';
import { GameStateService } from './game-state.service';
import { GameTimersService } from './game-timers.service';
import { LobbyGateway } from './lobby.gateway';
import { LobbyService } from './lobby.service';
import { PlayerTokenService } from './player-token.service';

@Module({
  imports: [QuizzesModule, JwtModule.register({})],
  providers: [
    GameGateway,
    LobbyGateway,
    GameRealtimeService,
    LobbyService,
    GamePlayService,
    GameStateService,
    GameTimersService,
    PlayerTokenService,
  ],
})
export class GameModule {}

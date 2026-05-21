import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Job, Queue, Worker } from 'bullmq';
import { BullMqConnectionService } from '../../infrastructure/bullmq-connection';

type TimerJobName =
  | 'start_round'
  | 'open_answer_window'
  | 'timer_tick'
  | 'end_round'
  | 'next_round_countdown'
  | 'finish_game'
  | 'cleanup_room';

type TimerHandlers = {
  startRound(roomCode: string, roundIndex: number): Promise<void>;
  openAnswerWindow(roomCode: string, roundIndex: number, questionId: string): Promise<void>;
  timerTick(roomCode: string, roundIndex: number, questionId: string): Promise<void>;
  endRound(roomCode: string, roundIndex: number, questionId: string): Promise<void>;
  nextRoundCountdown(roomCode: string, nextRoundStartsAt: number): Promise<void>;
  finishGame(roomCode: string): Promise<void>;
  cleanupRoom(roomCode: string): Promise<void>;
};

type TimerJobData = {
  roomCode: string;
  roundIndex?: number;
  questionId?: string;
  nextRoundStartsAt?: number;
};

const QUEUE_NAME = 'quizparty-game-timers';

@Injectable()
export class GameTimersService implements OnModuleDestroy {
  private readonly logger = new Logger(GameTimersService.name);
  private readonly queue: Queue<TimerJobData>;
  private readonly worker: Worker<TimerJobData>;
  private handlers?: TimerHandlers;

  constructor(bullmq: BullMqConnectionService) {
    this.queue = new Queue<TimerJobData>(QUEUE_NAME, {
      connection: bullmq.queue,
    });
    this.worker = new Worker<TimerJobData>(QUEUE_NAME, async (job) => this.processJob(job), {
      connection: bullmq.worker,
    });
    this.worker.on('failed', (job, error) => {
      this.logger.error(`Timer job ${job?.name ?? 'unknown'} failed`, error.stack);
    });
  }

  registerHandlers(handlers: TimerHandlers): void {
    this.handlers = handlers;
  }

  async scheduleStartRound(roomCode: string, roundIndex: number, delayMs: number): Promise<void> {
    await this.addJob(
      'start_round',
      { roomCode, roundIndex },
      delayMs,
      timerJobId(roomCode, 'start', roundIndex),
    );
  }

  async scheduleTimerTick(
    roomCode: string,
    roundIndex: number,
    questionId: string,
    delayMs: number,
  ): Promise<void> {
    await this.addJob(
      'timer_tick',
      { roomCode, roundIndex, questionId },
      delayMs,
      timerJobId(roomCode, 'tick', roundIndex, Date.now()),
    );
  }

  async scheduleAnswerWindowOpen(
    roomCode: string,
    roundIndex: number,
    questionId: string,
    delayMs: number,
  ): Promise<void> {
    await this.addJob(
      'open_answer_window',
      { roomCode, roundIndex, questionId },
      delayMs,
      timerJobId(roomCode, 'answer-window', roundIndex),
    );
  }

  async scheduleRoundEnd(
    roomCode: string,
    roundIndex: number,
    questionId: string,
    delayMs: number,
  ): Promise<void> {
    await this.addJob(
      'end_round',
      { roomCode, roundIndex, questionId },
      delayMs,
      timerJobId(roomCode, 'end', roundIndex),
    );
  }

  async scheduleNextRoundCountdown(
    roomCode: string,
    nextRoundStartsAt: number,
    delayMs: number,
  ): Promise<void> {
    await this.addJob(
      'next_round_countdown',
      { roomCode, nextRoundStartsAt },
      delayMs,
      timerJobId(roomCode, 'next-countdown', Date.now()),
    );
  }

  async scheduleFinishGame(roomCode: string, delayMs: number): Promise<void> {
    await this.addJob('finish_game', { roomCode }, delayMs, timerJobId(roomCode, 'finish'));
  }

  async scheduleRoomCleanup(roomCode: string, delayMs: number): Promise<void> {
    await this.addJob('cleanup_room', { roomCode }, delayMs, timerJobId(roomCode, 'cleanup'));
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker.close();
    await this.queue.close();
  }

  private async addJob(
    name: TimerJobName,
    data: TimerJobData,
    delayMs: number,
    jobId: string,
  ): Promise<void> {
    await this.queue.add(name, data, {
      delay: Math.max(0, delayMs),
      jobId,
      removeOnComplete: true,
      removeOnFail: 50,
    });
  }

  private async processJob(job: Job<TimerJobData>): Promise<void> {
    if (!this.handlers) {
      this.logger.warn(`Timer job ${job.name} skipped before handlers were registered`);
      return;
    }

    const { roomCode, roundIndex, questionId, nextRoundStartsAt } = job.data;

    switch (job.name as TimerJobName) {
      case 'start_round':
        if (typeof roundIndex === 'number') await this.handlers.startRound(roomCode, roundIndex);
        return;
      case 'timer_tick':
        if (typeof roundIndex === 'number' && questionId) {
          await this.handlers.timerTick(roomCode, roundIndex, questionId);
        }
        return;
      case 'open_answer_window':
        if (typeof roundIndex === 'number' && questionId) {
          await this.handlers.openAnswerWindow(roomCode, roundIndex, questionId);
        }
        return;
      case 'end_round':
        if (typeof roundIndex === 'number' && questionId) {
          await this.handlers.endRound(roomCode, roundIndex, questionId);
        }
        return;
      case 'next_round_countdown':
        if (typeof nextRoundStartsAt === 'number') {
          await this.handlers.nextRoundCountdown(roomCode, nextRoundStartsAt);
        }
        return;
      case 'finish_game':
        await this.handlers.finishGame(roomCode);
        return;
      case 'cleanup_room':
        await this.handlers.cleanupRoom(roomCode);
        return;
    }
  }
}

function timerJobId(...parts: Array<string | number>): string {
  return parts.map((part) => String(part).replaceAll(':', '-')).join('__');
}

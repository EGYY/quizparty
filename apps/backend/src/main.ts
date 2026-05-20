import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './modules/app.module';
import { CorsSocketIoAdapter } from './common/adapters/socket-io.adapter';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { resolveUploadRoot } from './config/upload';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3001);
  const rawOrigin = config.get<string>('WEB_ORIGIN', 'http://localhost:5173');
  const webOrigin = rawOrigin.includes(',')
    ? rawOrigin.split(',').map((o) => o.trim())
    : rawOrigin;
  const uploadRoot = resolveUploadRoot(config.get<string>('UPLOAD_ROOT_DIR', 'uploads'));

  app.enableCors({ origin: webOrigin, credentials: true });
  // helmet добавляет защитные заголовки (в т.ч. X-Content-Type-Options: nosniff
  // на /uploads). CORP=cross-origin — иначе браузер заблокирует загрузку медиа
  // веб/TV-приложениями с другого origin.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.useWebSocketAdapter(new CorsSocketIoAdapter(app, webOrigin));
  app.useStaticAssets(uploadRoot, { prefix: '/uploads' });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.enableShutdownHooks();
  await app.listen(port);
  Logger.log(`QuizParty backend is running on port ${port} (prefix /api)`);
}

void bootstrap();

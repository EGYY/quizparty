import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { isAbsolute, resolve } from 'node:path';
import { AppModule } from './modules/app.module';
import { CorsSocketIoAdapter } from './common/adapters/socket-io.adapter';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3001);
  const rawOrigin = config.get<string>('WEB_ORIGIN', 'http://localhost:5173');
  const webOrigin = rawOrigin.includes(',')
    ? rawOrigin.split(',').map((o) => o.trim())
    : rawOrigin;
  const configuredUploadRoot = config.get<string>('UPLOAD_ROOT_DIR', 'uploads');
  const uploadRoot = isAbsolute(configuredUploadRoot)
    ? configuredUploadRoot
    : resolve(process.cwd(), configuredUploadRoot);

  app.enableCors({ origin: webOrigin, credentials: true });
  app.useWebSocketAdapter(new CorsSocketIoAdapter(app, webOrigin));
  app.useStaticAssets(uploadRoot, { prefix: '/uploads' });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  await app.listen(port);
  Logger.log(`QuizParty backend is running on ${webOrigin}/api`);
}

void bootstrap();

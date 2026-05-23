import 'reflect-metadata';
import type { NextFunction, Request, Response } from 'express';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './modules/app.module';
import { CorsSocketIoAdapter } from './common/adapters/socket-io.adapter';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { resolveUploadRoot } from './config/upload';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3001);
  const rawOrigin = config.get<string>('WEB_ORIGIN', 'http://localhost:5173');
  const webOrigin = rawOrigin.includes(',') ? rawOrigin.split(',').map((o) => o.trim()) : rawOrigin;
  const uploadRoot = resolveUploadRoot(config.get<string>('UPLOAD_ROOT_DIR', 'uploads'));

  app.enableCors({ origin: webOrigin, credentials: true });
  // helmet добавляет защитные заголовки (в т.ч. X-Content-Type-Options: nosniff
  // на /uploads). CORP=cross-origin — иначе браузер заблокирует загрузку медиа
  // веб/TV-приложениями с другого origin.
  // Swagger UI требует inline-скрипты — пропускаем helmet на /api/docs*.
  const helmetMiddleware = helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } });
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path?.startsWith('/api/docs')) return next();
    helmetMiddleware(req, res, next);
  });
  app.useWebSocketAdapter(new CorsSocketIoAdapter(app, webOrigin));
  app.useStaticAssets(uploadRoot, { prefix: '/uploads' });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.enableShutdownHooks();

  if (config.get<boolean>('ENABLE_SWAGGER')) {
    const docConfig = new DocumentBuilder()
      .setTitle('QuizParty API')
      .setVersion('1.0')
      .setDescription('REST API for QuizParty backend')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addTag('auth', 'Authentication & sessions')
      .addTag('quizzes', 'Public quiz browsing')
      .addTag('admin', 'Author/admin quiz management')
      .addTag('rooms', 'Game room lifecycle')
      .addTag('health', 'Health check')
      .build();
    const rawDoc = SwaggerModule.createDocument(app, docConfig);
    const doc = cleanupOpenApiDoc(rawDoc);
    SwaggerModule.setup('api/docs', app, doc);
    Logger.log('Swagger UI available at /api/docs');
  }

  await app.listen(port);
  Logger.log(`QuizParty backend is running on port ${port} (prefix /api)`);
}

void bootstrap();

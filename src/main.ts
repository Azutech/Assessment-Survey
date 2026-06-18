import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/app.response';
import { HttpLogger } from './common/middleware/http-logger.middleware';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/nest-express-application.interface';
import { Logger } from '@nestjs/common/services/logger.service';

async function bootstrap() {
  const logger = new Logger('Assessment-Survey-V1');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<string>('PORT');

  app.setGlobalPrefix('api/v1');
  app.use(new HttpLogger().use);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableCors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    credentials: true,
    maxAge: 3600,
  });

  // Port
  await app.listen(port, () => logger.log(`App running on Port: ${port}`));
}
bootstrap();

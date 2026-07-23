import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const configuredFrontend = config.get<string>('FRONTEND_URL');
  const allowedOrigins = [
    'https://currencyconverter-872f.vercel.app',
    'http://localhost:5173',
    configuredFrontend,
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  });

  await app.listen(config.get<number>('PORT') ?? 3000);
}

void bootstrap();

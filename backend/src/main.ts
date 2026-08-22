import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

// La mayoria de los IDs del schema son BIGINT (mapeados a BigInt en JS),
// y JSON.stringify no sabe serializar BigInt de forma nativa. Como estos
// IDs nunca se acercan a Number.MAX_SAFE_INTEGER en este dominio, los
// devolvemos como number en las respuestas HTTP en vez de forzar a cada
// DTO/controller a transformarlos a mano.
(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function () {
    return Number(this);
};

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors();
    app.setGlobalPrefix('api');
    app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter());

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    // eslint-disable-next-line no-console
    console.log(`Backend Ingenieria/OF escuchando en http://localhost:${port}/api`);
}

bootstrap();

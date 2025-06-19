import { BadRequestException, INestApplication, ValidationPipe, } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ErrorFormatterInterceptor } from '@application/exceptions/global.exception';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationExceptionFilter } from './validation-exception.filter';
import { RootModule } from '@di/root.module';
import { config } from 'dotenv';

config();
const configClassValidator = (app: INestApplication) =>
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const details = errors.map((err) => {
          const msgs = err.constraints
            ? Object.values(err.constraints).join('; ')
            : 'Valor inválido';
          return { field: err.property, message: msgs };
        });

        return new BadRequestException({
          statusCode: 400,
          message: details.map((el) => el.message).join('-'),
        });
      },
    }),
  );

async function bootstrap() {
  const app = await NestFactory.create(RootModule);
  app.useGlobalFilters(new ValidationExceptionFilter());

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const config = new DocumentBuilder()
    .setTitle('Atenas API')
    .setDescription('API para gerenciamento de fotos ')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  configClassValidator(app);

  app.useGlobalInterceptors(new ErrorFormatterInterceptor());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application running on port ${port}`);
  console.log(`📚 Swagger available at: /api-docs`);
}

bootstrap();

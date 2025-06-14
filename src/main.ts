import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AlbumController } from '@presentation/user/http/controllers/album.controller';
import 'dotenv';
import { ErrorFormatterInterceptor } from '@application/exceptions/global.exception';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationExceptionFilter } from './validation-exception.filter';
import { RootModule } from '@di/root.module';

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
  const payloadSize = Number(150);
  app.use(bodyParser.json({ limit: `${payloadSize}mb` }));
  app.use(bodyParser.urlencoded({ limit: `${payloadSize}mb`, extended: true }));
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
  // await (await app.resolve(AlbumController)).updateFilesCron();
  // await (await app.resolve(UserController)).updateUser({email:"julio@atenasformaturas.com.br" ,
  //   numeroContrato:"Julio", isAdm:"true",
  //   nomeEscola:"Atenas",
  //   nomeUsuario:"Julio",
  // telefone:"(32) 42342-3423",
  // turma:"adm",
  // senha: "senhalegal"})
  app.useGlobalInterceptors(new ErrorFormatterInterceptor());

  await app.listen(3000);
}
bootstrap();

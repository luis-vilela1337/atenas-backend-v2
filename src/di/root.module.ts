import { Module } from '@nestjs/common';
import { PresentationModule } from './presentation.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '@infrastructure/data/sql/database.config';

@Module({
  imports: [
    PresentationModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => dataSourceOptions,
      inject: [ConfigService],
    }),
  ],
})
export class RootModule {}

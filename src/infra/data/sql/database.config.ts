import { DataSource, DataSourceOptions } from 'typeorm';
import { entities } from './entities';
import 'dotenv/config';
import { Generated1747237005972 } from '../migrations/1747237005972-generated';
import { ConfigService } from '@nestjs/config';
import { Generated1750351515326 } from '@infrastructure/data/migrations/1750351515326-generated';

export const migrations = [Generated1747237005972, Generated1750351515326];
const envVars = (cs: ConfigService) => ({
  host: cs.get<string>('DB_HOST'),
  port: Number(cs.get<string>('DB_PORT')),
  username: cs.get<string>('DB_USERNAME'),
  password: cs.get<string>('DB_PASSWORD'),
  database: cs.get<string>('DB_DATABASE'),
});

const configService = new ConfigService();
const dbConfig = envVars(configService);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  ...dbConfig,
  entities: entities,
  migrations: migrations,
  synchronize: false,
};

export const AppDataSource = new DataSource(dataSourceOptions);

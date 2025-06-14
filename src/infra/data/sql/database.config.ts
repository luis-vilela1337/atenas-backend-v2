import { DataSource, DataSourceOptions } from 'typeorm';
import { entities } from './entities';
import 'dotenv/config';
import { Generated1747237005972 } from '../migrations/1747237005972-generated';
import { ConfigService } from '@nestjs/config';

export const migrations = [Generated1747237005972];

const envVars = (cs: ConfigService) => ({
    secret: cs.get<string>('JWT_SECRET'),
    host: cs.get<string>('DB_HOST'),
    port: Number(cs.get<string>('DB_PORT')),
    username: cs.get<string>('DB_USERNAME'),
    password: cs.get<string>('DB_PASSWORD'),
    database: cs.get<string>('DB_DATABASE'),
  });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: envVars.host,
  port: envVars.port,
  username: envVars.username,
  password: envVars.password,
  database: envVars.database,
  entities: entities,
  migrations: migrations,
  synchronize: false,
  // logging: process.env.NODE_ENV === 'development',
};

export const AppDataSource = new DataSource(dataSourceOptions);

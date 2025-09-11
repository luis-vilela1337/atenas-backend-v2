import { DataSource, DataSourceOptions } from 'typeorm';
import { entities } from './entities';
import 'dotenv/config';
import { Generated1747237005972 } from '../migrations/1747237005972-generated';
import { ConfigService } from '@nestjs/config';
import { Generated1750351515326 } from '@infrastructure/data/migrations/1750351515326-generated';
import { Generated1751148139056 } from '../migrations/1751148139056-generated';
import { CreateMercadoPagoWebhookTables1751228400000 } from '../migrations/1751228400000-CreateMercadoPagoWebhookTables';
import { CreateOrderTables1754264500000 } from '../migrations/1754264500000-CreateOrderTables';
import { AddUserAndContractFields1757211242262 } from '../migrations/1757211242262-AddUserAndContractFields';
import { Generated1757455211999 } from '../migrations/1757455211999-generated';
import { Generated1757564486153 } from '../migrations/1757564486153-generated';

export const migrations = [
  Generated1747237005972,
  Generated1750351515326,
  Generated1751148139056,
  CreateMercadoPagoWebhookTables1751228400000,
  CreateOrderTables1754264500000,
  AddUserAndContractFields1757211242262,
  Generated1757455211999,
  Generated1757564486153,
];
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

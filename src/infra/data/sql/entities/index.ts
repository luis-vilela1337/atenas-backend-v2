export * from './instituition.entity';
export * from './instituition.events';
export * from './user.entity';
import { Institution } from './instituition.entity';
import { InstitutionEvent } from './instituition.events';
import { Product } from './products.entity';
import { User } from './user.entity';

export const entities = [Institution, User, InstitutionEvent, Product];

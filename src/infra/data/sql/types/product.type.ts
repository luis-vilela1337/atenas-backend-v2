import { ProductFlag } from './product-flag.enum';

export interface UpdateProductData {
  name?: string;
  flag?: ProductFlag;
  description?: string;
  photos?: string[];
  video?: string[];
}

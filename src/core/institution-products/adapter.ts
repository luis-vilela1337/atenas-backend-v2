import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';
import {
  AlbumDetails,
  DigitalFilesDetails,
  GenericDetails,
  ProductDetails,
} from '@infrastructure/data/sql/entities';

export interface RawAlbumDetails {
  minPhoto: number;
  maxPhoto: number;
  valorEncadernacao: number;
  valorFoto: number;
}

export interface RawEventConfiguration {
  id: string;
  minPhotos?: number;
  valorPhoto?: number;
  valorPack?: number;
}

export interface RawGenericDetails {
  isAvailableUnit?: boolean;
  events: RawEventConfiguration[];
}

export interface RawDigitalFilesDetails {
  isAvailableUnit: boolean;
  events?: RawEventConfiguration[];
  valorPackTotal?: number;
}

export class ProductDetailsAdapter {
  static toTypedDetails(
    flag: ProductFlag,
    rawDetails: any,
  ): ProductDetails | null {
    if (!rawDetails) return null;

    switch (flag) {
      case ProductFlag.ALBUM:
        return rawDetails as AlbumDetails;

      case ProductFlag.GENERIC:
        return rawDetails as GenericDetails;

      case ProductFlag.DIGITAL_FILES:
        return rawDetails as DigitalFilesDetails;

      default:
        throw new Error(`Unsupported product flag: ${flag}`);
    }
  }

  toRawDetails(details: ProductDetails): Record<string, any> {
    return details as Record<string, any>;
  }

  static isAlbumDetails(details: ProductDetails): details is AlbumDetails {
    return 'valorEncadernacao' in details;
  }

  static isGenericDetails(details: ProductDetails): details is GenericDetails {
    return 'events' in details && !('isAvailableUnit' in details);
  }

  static isDigitalFilesDetails(
    details: ProductDetails,
  ): details is DigitalFilesDetails {
    return (
      'isAvailableUnit' in details &&
      typeof details.isAvailableUnit === 'boolean'
    );
  }
}

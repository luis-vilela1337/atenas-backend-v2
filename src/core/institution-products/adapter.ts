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

export interface RawGenericDetails {
  event_id: string;
  minPhoto: number;
  maxPhoto: number;
  valorPhoto: number;
}

export interface RawDigitalFilesDetails {
  isAvailableUnit: boolean;
  minPhotos: number;
  valorPhoto: number;
  eventId: string;
}

export class ProductDetailsAdapter {
  static toTypedDetails(
    flag: ProductFlag,
    rawDetails: any,
  ): ProductDetails | null {
    if (!rawDetails) return null;

    switch (flag) {
      case ProductFlag.ALBUM:
        return this.validateAlbumDetails(rawDetails);

      case ProductFlag.GENERIC:
        return this.validateGenericDetails(rawDetails);

      case ProductFlag.DIGITAL_FILES:
        return this.validateDigitalFilesDetails(rawDetails);

      default:
        throw new Error(`Unsupported product flag: ${flag}`);
    }
  }

  toRawDetails(details: ProductDetails): Record<string, any> {
    return details as Record<string, any>;
  }

  private static validateAlbumDetails(raw: any): AlbumDetails {
    const required = ['minPhoto', 'maxPhoto', 'valorEncadernacao', 'valorFoto'];
    this.validateRequiredFields(raw, required, 'ALBUM');

    return {
      minPhoto: this.validateNumber(raw.minPhoto, 'minPhoto'),
      maxPhoto: this.validateNumber(raw.maxPhoto, 'maxPhoto'),
      valorEncadernacao: this.validateNumber(
        raw.valorEncadernacao,
        'valorEncadernacao',
      ),
      valorFoto: this.validateNumber(raw.valorFoto, 'valorFoto'),
    };
  }

  private static validateGenericDetails(raw: any): GenericDetails {
    const required = ['event_id', 'minPhoto', 'maxPhoto', 'valorPhoto'];
    this.validateRequiredFields(raw, required, 'GENERIC');

    return {
      event_id: this.validateString(raw.event_id, 'event_id'),
      minPhoto: this.validateNumber(raw.minPhoto, 'minPhoto'),
      maxPhoto: this.validateNumber(raw.maxPhoto, 'maxPhoto'),
      valorPhoto: this.validateNumber(raw.valorPhoto, 'valorPhoto'),
    };
  }

  private static validateRequiredFields(
    obj: any,
    required: string[],
    context: string,
  ): void {
    if (!obj || typeof obj !== 'object') {
      throw new Error(`Invalid details object for ${context}`);
    }

    const missing = required.filter((field) => !(field in obj));
    if (missing.length > 0) {
      throw new Error(
        `Missing required fields for ${context}: ${missing.join(', ')}`,
      );
    }
  }
  private static validateDigitalFilesDetails(raw: any): DigitalFilesDetails {
    const required = ['isAvailableUnit', 'minPhotos', 'valorPhoto', 'eventId'];
    this.validateRequiredFields(raw, required, 'DIGITAL_FILES');

    return {
      isAvailableUnit: this.validateBoolean(
        raw.isAvailableUnit,
        'isAvailableUnit',
      ),
      minPhotos: this.validateNumber(raw.minPhotos, 'minPhotos'),
      valorPhoto: this.validateNumber(raw.valorPhoto, 'valorPhoto'),
      eventId: this.validateString(raw.eventId, 'eventId'),
    };
  }

  private static validateNumber(value: any, fieldName: string): number {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      throw new Error(
        `Invalid number value for field '${fieldName}': ${value}`,
      );
    }
    return num;
  }

  private static validateString(value: any, fieldName: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(
        `Invalid string value for field '${fieldName}': ${value}`,
      );
    }
    return value.trim();
  }

  private static validateBoolean(value: any, fieldName: string): boolean {
    if (typeof value !== 'boolean') {
      throw new Error(
        `Invalid boolean value for field '${fieldName}': ${value}`,
      );
    }
    return value;
  }

  static isAlbumDetails(details: ProductDetails): details is AlbumDetails {
    return 'valorEncadernacao' in details;
  }

  static isGenericDetails(details: ProductDetails): details is GenericDetails {
    return 'event_id' in details;
  }

  static isDigitalFilesDetails(
    details: ProductDetails,
  ): details is DigitalFilesDetails {
    return 'isAvailableUnit' in details;
  }
}

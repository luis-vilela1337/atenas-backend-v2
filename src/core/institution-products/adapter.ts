import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';
import {
  AlbumDetails,
  DigitalFilesDetails,
  EventConfiguration,
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
  // quando isAvailable for false
  valorPack?: number;
}

export interface RawGenericDetails {
  isAvailableUnit?: boolean;
  events: RawEventConfiguration[];
}

export interface RawDigitalFilesDetails {
  isAvailableUnit: boolean;
  events?: RawEventConfiguration[];
  // Legacy fields for backward compatibility
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
    const required = ['events'];
    this.validateRequiredFields(raw, required, 'GENERIC');

    if (!Array.isArray(raw.events)) {
      throw new Error('GENERIC details must contain an events array');
    }

    const events = this.validateEventsArray(raw.events, 'GENERIC');

    return {
      isAvailableUnit: raw.isAvailableUnit || true,
      events,
    };
  }

  private static validateDigitalFilesDetails(raw: any): DigitalFilesDetails {
    const required = ['isAvailableUnit'];
    this.validateRequiredFields(raw, required, 'DIGITAL_FILES');

    const isAvailableUnit = this.validateBoolean(
      raw.isAvailableUnit,
      'isAvailableUnit',
    );

    if (isAvailableUnit) {
      if (!Array.isArray(raw.events)) {
        throw new Error(
          'DIGITAL_FILES with isAvailableUnit=true must contain an events array',
        );
      }

      const events = this.validateEventsArray(raw.events, 'DIGITAL_FILES');

      return {
        isAvailableUnit,
        events,
      };
    } else {
      return {
        isAvailableUnit,
        valorPackTotal: raw.valorPackTotal ? this.validateNumber(raw.valorPackTotal, 'valorPackTotal') : undefined,
      };
    }
  }

  private static validateEventsArray(
    events: any[],
    context: string,
  ): EventConfiguration[] {
    if (events.length === 0) {
      throw new Error(`Events array cannot be empty for ${context}`);
    }

    const validatedEvents: EventConfiguration[] = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!event || typeof event !== 'object') {
        throw new Error(`Invalid event configuration at index ${i}`);
      }

      const required = ['id'];
      const missing = required.filter((field) => !(field in event));
      if (missing.length > 0) {
        throw new Error(
          `Missing required fields for event at index ${i}: ${missing.join(
            ', ',
          )}`,
        );
      }

      if (!this.isValidUUID(event.id)) {
        throw new Error(
          `Invalid UUID format for event ID at index ${i}: ${event.id}`,
        );
      }

      const validatedEvent: EventConfiguration = {
        id: this.validateString(event.id, 'id'),
      };

      if (event.minPhotos !== undefined) {
        validatedEvent.minPhotos = this.validateNumber(event.minPhotos, 'minPhotos');
      }

      if (event.valorPhoto !== undefined) {
        validatedEvent.valorPhoto = this.validateNumber(event.valorPhoto, 'valorPhoto');
      }

      if (event.valorPack !== undefined) {
        validatedEvent.valorPack = this.validateNumber(event.valorPack, 'valorPack');
      }

      validatedEvents.push(validatedEvent);
    }

    return validatedEvents;
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

  private static isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  static isAlbumDetails(details: ProductDetails): details is AlbumDetails {
    return 'valorEncadernacao' in details;
  }

  static isGenericDetails(details: ProductDetails): details is GenericDetails {
    return (
      'events' in details &&
      !(
        'isAvailableUnit' in details &&
        typeof details.isAvailableUnit === 'boolean'
      )
    );
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
import { Injectable } from '@nestjs/common';
import { Storage, GetSignedUrlConfig } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class ImageStorageService {
  private readonly storage: Storage;
  private readonly bucketName: string;
  private readonly UPLOAD_URL_EXPIRATION = 15 * 60 * 1000;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('BUCKET_NAME');

    const credentials = {
      project_id: this.configService.get<string>('GCP_PROJECT_ID'),
      client_email: this.configService.get<string>('GCP_CLIENT_EMAIL'),
      private_key: this.configService
        .get<string>('GCP_PRIVATE_KEY')
        .replace(/\\n/g, '\n'),
    };

    this.storage = new Storage({
      projectId: credentials.project_id,
      credentials,
    });
  }

  generateRandomFilename(contentType: string): string {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const extension = this.getFileExtension(contentType);

    return `image-${randomBytes}-${timestamp}.${extension}`;
  }

  async generateSignedUrl(
    filename: string,
    action: 'read' | 'write',
    contentType?: string,
  ): Promise<string> {
    const options = {
      version: 'v4',
      action,
      expires: Date.now() + this.UPLOAD_URL_EXPIRATION,
    } as GetSignedUrlConfig;

    if (action === 'write') {
      if (!contentType) {
        throw new Error('ContentType required for write action');
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(contentType)) {
        throw new Error('Invalid image type');
      }

      options.contentType = contentType;
    }

    const file = this.storage.bucket(this.bucketName).file(filename);
    const [url] = await file.getSignedUrl(options);
    return url;
  }

  async generateUploadSignedUrl(
    filename: string,
    contentType: string,
  ): Promise<string> {
    try {
      const options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + this.UPLOAD_URL_EXPIRATION,
        contentType,
      } as GetSignedUrlConfig;

      const file = this.storage.bucket(this.bucketName).file(filename);
      const [url] = await file.getSignedUrl(options);

      return url;
    } catch (error) {
      throw new Error(`Falha ao gerar URL de upload: ${error.message}`);
    }
  }

  private getFileExtension(contentType: string): string {
    const extensionMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };

    return extensionMap[contentType] || 'jpg';
  }
}

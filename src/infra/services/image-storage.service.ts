import { Injectable } from '@nestjs/common';
import { GetSignedUrlConfig, Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { MediaType } from '@presentation/user/dto/presigned-url.dto';

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

  generateRandomFilename(
    contentType: string,
    mediaType: MediaType = MediaType.IMAGE,
  ): string {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const extension = this.getFileExtension(contentType);
    const prefix = mediaType === MediaType.VIDEO ? 'video' : 'image';

    return `${prefix}-${randomBytes}-${timestamp}.${extension}`;
  }

  async generateUploadSignedUrl(
    filename: string,
    contentType: string,
    mediaType: MediaType = MediaType.IMAGE,
  ): Promise<string> {
    try {
      const options: GetSignedUrlConfig = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + this.UPLOAD_URL_EXPIRATION,
        contentType,
      };

      // Add content length restrictions for videos
      if (mediaType === MediaType.VIDEO) {
        // 100MB limit for videos
        options.extensionHeaders = {
          'x-goog-content-length-range': '0,104857600', // 100MB in bytes
        };
      }

      const file = this.storage.bucket(this.bucketName).file(filename);
      const [url] = await file.getSignedUrl(options);

      return url;
    } catch (error) {
      throw new Error(`Falha ao gerar URL de upload: ${error.message}`);
    }
  }

  async generateSignedUrl(
    filename: string,
    action: 'read' | 'write',
    contentType?: string,
  ): Promise<string> {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action,
      expires: Date.now() + this.UPLOAD_URL_EXPIRATION,
    };

    if (action === 'write') {
      if (!contentType) {
        throw new Error('ContentType required for write action');
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
      ];

      if (!allowedTypes.includes(contentType)) {
        throw new Error('Invalid media type');
      }

      // options.contentType = contentType;
    }

    const file = this.storage.bucket(this.bucketName).file(filename);
    const [url] = await file.getSignedUrl(options);
    return url;
  }

  private getFileExtension(contentType: string): string {
    const extensionMap: Record<string, string> = {
      // Images
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      // Videos
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
      'video/webm': 'webm',
    };

    return (
      extensionMap[contentType] ||
      (contentType.startsWith('video/') ? 'mp4' : 'jpg')
    );
  }
}

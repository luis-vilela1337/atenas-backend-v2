import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';

export const mockConfigService = (): Partial<ConfigService> => ({
  get: jest.fn((key: string) => {
    const config = {
      JWT_SECRET: 'test-secret',
      BUCKET_NAME: 'test-bucket',
      GCP_PROJECT_ID: 'test-project',
      GCP_CLIENT_EMAIL: 'test@test.com',
      GCP_PRIVATE_KEY: 'test-key',
    };
    return config[key];
  }),
});

export const mockJwtService = (): Partial<JwtService> => ({
  sign: jest.fn(() => 'test-jwt-token'),
  verify: jest.fn().mockImplementation(<T extends object = any>(): T => {
    return { userId: 'test-id' } as T;
  }),
  signAsync: jest.fn(() => Promise.resolve('test-jwt-token')),
  verifyAsync: jest.fn().mockImplementation(<
    T extends object = any,
  >(): Promise<T> => {
    return Promise.resolve({ userId: 'test-id' } as T);
  }),
});

export const mockImageStorageService = (): Partial<ImageStorageService> => ({
  generateRandomFilename: jest.fn(
    (contentType: string, mediaType?: any, customIdentifier?: string) => {
      const extension = contentType.split('/')[1];

      // If customIdentifier is provided, use only customIdentifier (pure name)
      if (customIdentifier) {
        return `${customIdentifier}.${extension}`;
      }

      // Default behavior
      return `test-file.${extension}`;
    },
  ),
  generateUploadSignedUrl: jest
    .fn()
    .mockResolvedValueOnce('https://storage.com/upload/video1')
    .mockResolvedValueOnce('https://storage.com/upload/video2'),
  generateSignedUrl: jest.fn(() =>
    Promise.resolve('https://test-bucket.com/read'),
  ),
});

export const mockRepository = <T>() => ({
  find: jest.fn(() => Promise.resolve([])),
  findOne: jest.fn(() => Promise.resolve(null)),
  findById: jest.fn(() => Promise.resolve(null)),
  save: jest.fn((entity: T) => Promise.resolve(entity)),
  create: jest.fn((dto: Partial<T>) => dto as T),
  update: jest.fn(() => Promise.resolve({ affected: 1 })),
  delete: jest.fn(() => Promise.resolve({ affected: 1 })),
  remove: jest.fn((entity: T) => Promise.resolve(entity)),
  findAndCount: jest.fn(() => Promise.resolve([[], 0])),
  count: jest.fn(() => Promise.resolve(0)),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(() => Promise.resolve([])),
    getOne: jest.fn(() => Promise.resolve(null)),
    getManyAndCount: jest.fn(() => Promise.resolve([[], 0])),
    getCount: jest.fn(() => Promise.resolve(0)),
  })),
});

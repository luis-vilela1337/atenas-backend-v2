// src/application/user-event-photos/user-event-photos.application.ts
import { Injectable } from '@nestjs/common';
import { CreateUserEventPhotoUseCase } from '@core/user-event-photos/create/usecase';
import { FindUserEventPhotosByUserUseCase } from '@core/user-event-photos/find-by-user/usecase';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { CreateUserEventPhotoDto } from '@presentation/user-event-photos/dto/create-user-event-photo.dto';
import { 
  UserEventPhotosResponseDto,
  EventPhotosGroupDto,
  PhotoDto 
} from '@presentation/user-event-photos/dto/user-event-photo-response.dto';
import { DeleteUserEventPhotoUseCase } from '@core/user-event-photos/delete/usecase';

@Injectable()
export class UserEventPhotosApplication {
  constructor(
    private readonly createUseCase: CreateUserEventPhotoUseCase,
    private readonly findByUserUseCase: FindUserEventPhotosByUserUseCase,
    private readonly imageStorageService: ImageStorageService,
    private readonly deleteUseCase: DeleteUserEventPhotoUseCase,
  ) {}

  async delete(id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
  
  async create(dto: CreateUserEventPhotoDto): Promise<void> {
    await this.createUseCase.execute(dto);
  }

  async findByUser(userId: string): Promise<UserEventPhotosResponseDto> {
    const photos = await this.findByUserUseCase.execute(userId);
    
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        signedUrl: await this.imageStorageService.generateSignedUrl(photo.fileName, 'read'),
      }))
    );

    const eventGroups = this.groupPhotosByEvent(photosWithUrls);
    
    return {
      eventGroups,
      totalPhotos: photos.length,
    };
  }

  private groupPhotosByEvent(photos: any[]): EventPhotosGroupDto[] {
    const grouped = photos.reduce((acc, photo) => {
      const eventId = photo.event.id;
      
      if (!acc[eventId]) {
        acc[eventId] = {
          eventId,
          eventName: photo.event.name,
          photos: [],
        };
      }
      
      acc[eventId].photos.push({
        id: photo.id,
        fileName: photo.fileName,
        signedUrl: photo.signedUrl,
        createdAt: photo.createdAt,
      });
      
      return acc;
    }, {});

    return Object.values(grouped);
  }
}
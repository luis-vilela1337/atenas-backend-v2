import { ApiProperty } from '@nestjs/swagger';

export class PhotoDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  signedUrl: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class EventPhotosGroupDto {
  @ApiProperty({ format: 'uuid' })
  eventId: string;

  @ApiProperty()
  eventName: string;

  @ApiProperty({ type: [PhotoDto] })
  photos: PhotoDto[];
}

export class UserEventPhotosResponseDto {
  @ApiProperty({ type: [EventPhotosGroupDto] })
  eventGroups: EventPhotosGroupDto[];

  @ApiProperty()
  totalPhotos: number;
}

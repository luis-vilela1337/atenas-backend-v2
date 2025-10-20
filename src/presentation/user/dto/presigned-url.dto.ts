import { ApiProperty } from '@nestjs/swagger';
import {
  Allow,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Custom validator para verificar se o array de customIdentifiers tem o mesmo tamanho que quantity
function IsCustomIdentifiersValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCustomIdentifiersValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;

          // Se não houver customIdentifier, é válido
          if (!value) return true;

          // Se for string, é válido (comportamento antigo)
          if (typeof value === 'string') return true;

          // Se for array, deve ter o mesmo tamanho que quantity
          if (Array.isArray(value)) {
            return value.length === obj.quantity;
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as any;
          return `customIdentifier deve ser uma string ou um array com ${obj.quantity} elementos (mesmo tamanho que quantity)`;
        },
      },
    });
  };
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export class GeneratePresignedUrlInputDto {
  @ApiProperty({
    example: 'image/png',
    description: 'Content-Type do arquivo',
    examples: {
      image: { value: 'image/png' },
      video: { value: 'video/mp4' },
    },
  })
  @IsString()
  @Allow()
  contentType: string;

  @ApiProperty({
    example: 5,
    description: 'Quantidade de URLs presignadas a serem geradas',
    minimum: 1,
    maximum: 10,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade mínima: 1 arquivo' })
  @Max(10, { message: 'Quantidade máxima: 10 arquivos' })
  quantity: number;

  @ApiProperty({
    enum: MediaType,
    description: 'Tipo de mídia (auto-detectado se não informado)',
    required: false,
  })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'foto-festa' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['foto-1', 'foto-2', 'foto-3'],
      },
    ],
    description:
      'Nome(s) do(s) arquivo(s) sem extensão. ' +
      'Pode ser uma string (para uso único ou repetido) ou array de strings (um para cada arquivo). ' +
      'Se for array, deve ter o mesmo tamanho que quantity.',
    required: false,
  })
  @IsOptional()
  @IsCustomIdentifiersValid()
  customIdentifier?: string | string[];
}

export class PresignedUrlItemDto {
  @ApiProperty({ description: 'URL presignada para upload' })
  uploadUrl: string;

  @ApiProperty({ description: 'Nome único do arquivo gerado' })
  filename: string;

  @ApiProperty({ description: 'Índice sequencial do arquivo (1-based)' })
  index: number;

  @ApiProperty({
    enum: MediaType,
    description: 'Tipo de mídia detectado',
  })
  mediaType: MediaType;
}

export class PresignedUrlResponseDto {
  @ApiProperty({
    type: [PresignedUrlItemDto],
    description: 'Array de URLs presignadas geradas',
  })
  urls: PresignedUrlItemDto[];

  @ApiProperty({ description: 'Quantidade total de URLs geradas' })
  totalGenerated: number;

  @ApiProperty({ description: 'Timestamp de geração' })
  generatedAt: string;

  @ApiProperty({
    enum: MediaType,
    description: 'Tipo de mídia processado',
  })
  mediaType: MediaType;
}

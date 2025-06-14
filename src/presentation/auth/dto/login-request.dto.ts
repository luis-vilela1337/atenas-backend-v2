import { IsEmail, IsString, Length } from 'class-validator';

export class LoginRequestDto {
  @IsEmail() email!: string;
  @IsString() @Length(6, 128) password!: string;
}

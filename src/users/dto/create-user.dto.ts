import { IsEmail, IsString, IsUrl, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @Length(2, 30)
  username: string;

  @IsUrl()
  avatar?: string;
}

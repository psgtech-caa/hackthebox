import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, underscores and hyphens',
  })
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}

export class LoginDto {
  @IsString()
  usernameOrEmail: string;

  @IsString()
  password: string;
}

export class CreateTeamDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  teamName: string;
}

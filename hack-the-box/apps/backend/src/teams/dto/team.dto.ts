import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class JoinTeamDto {
  @IsString()
  @IsNotEmpty()
  teamId: string;
}

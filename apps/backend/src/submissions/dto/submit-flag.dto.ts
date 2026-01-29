import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitFlagDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @IsString()
  @IsNotEmpty()
  flag: string;
}

import { IsString, IsInt, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { RoundState } from '@prisma/client';

export class UpdateRoundStateDto {
  @IsEnum(RoundState)
  state: RoundState;
}

export class ToggleChallengeDto {
  @IsBoolean()
  isActive: boolean;
}

export class AdjustScoreDto {
  @IsString()
  teamId: string;

  @IsInt()
  points: number;

  @IsString()
  reason: string;
}

export class DisqualifyTeamDto {
  @IsBoolean()
  isDisqualified: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateEventDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  scoreboardFrozen?: boolean;
}

import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/roles.guard';
import {
  UpdateRoundStateDto,
  ToggleChallengeDto,
  AdjustScoreDto,
  DisqualifyTeamDto,
  UpdateEventDto,
} from './dto/admin.dto';
import { SubmissionsService } from '../submissions/submissions.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private submissionsService: SubmissionsService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // ==========================================
  // ROUND MANAGEMENT
  // ==========================================

  @Put('rounds/:id/state')
  async updateRoundState(
    @Param('id') id: string,
    @Body() dto: UpdateRoundStateDto,
    @Req() req: any,
  ) {
    return this.adminService.updateRoundState(id, dto.state, req.user.id);
  }

  // ==========================================
  // CHALLENGE MANAGEMENT
  // ==========================================

  @Put('challenges/:id/toggle')
  async toggleChallenge(
    @Param('id') id: string,
    @Body() dto: ToggleChallengeDto,
    @Req() req: any,
  ) {
    return this.adminService.toggleChallenge(id, dto.isActive, req.user.id);
  }

  // ==========================================
  // TEAM MANAGEMENT
  // ==========================================

  @Put('teams/:id/disqualify')
  async disqualifyTeam(
    @Param('id') id: string,
    @Body() dto: DisqualifyTeamDto,
    @Req() req: any,
  ) {
    return this.adminService.disqualifyTeam(
      id,
      dto.isDisqualified,
      dto.reason || 'No reason provided',
      req.user.id,
    );
  }

  @Post('teams/adjust-score')
  async adjustScore(@Body() dto: AdjustScoreDto, @Req() req: any) {
    return this.adminService.adjustScore(dto.teamId, dto.points, dto.reason, req.user.id);
  }

  // ==========================================
  // SUBMISSIONS
  // ==========================================

  @Get('submissions')
  async getAllSubmissions() {
    return this.submissionsService.getAllSubmissions();
  }

  // ==========================================
  // EVENT MANAGEMENT
  // ==========================================

  @Put('event')
  async updateEvent(@Body() dto: UpdateEventDto, @Req() req: any) {
    return this.adminService.updateEventConfig(dto, req.user.id);
  }

  // ==========================================
  // EXPORT
  // ==========================================

  @Get('export/results')
  async exportResults() {
    return this.adminService.exportResults();
  }
}

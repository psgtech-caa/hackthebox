import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Header } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { CreateRoundDto, UpdateRoundStatusDto, CreateChallengeDto, UpdateChallengeDto } from './dto/admin.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Rounds
  @Post('rounds')
  createRound(@Body() dto: CreateRoundDto) {
    return this.adminService.createRound(dto);
  }

  @Put('rounds/:id/status')
  updateRoundStatus(@Param('id') id: string, @Body() dto: UpdateRoundStatusDto) {
    return this.adminService.updateRoundStatus(id, dto);
  }

  @Delete('rounds/:id')
  deleteRound(@Param('id') id: string) {
    return this.adminService.deleteRound(id);
  }

  // Challenges
  @Post('challenges')
  createChallenge(@Body() dto: CreateChallengeDto) {
    return this.adminService.createChallenge(dto);
  }

  @Put('challenges/:id')
  updateChallenge(@Param('id') id: string, @Body() dto: UpdateChallengeDto) {
    return this.adminService.updateChallenge(id, dto);
  }

  @Delete('challenges/:id')
  deleteChallenge(@Param('id') id: string) {
    return this.adminService.deleteChallenge(id);
  }

  // Users
  @Put('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.adminService.updateUserRole(id, role);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Statistics
  @Get('stats')
  getStatistics() {
    return this.adminService.getStatistics();
  }

  @Get('submissions')
  getAllSubmissions() {
    return this.adminService.getAllSubmissions();
  }

  @Post('reset')
  resetCompetition() {
    return this.adminService.resetCompetition();
  }

  // Score Management
  @Post('teams/:id/adjust-score')
  adjustTeamScore(
    @Param('id') id: string,
    @Body('points') points: number,
    @Body('reason') reason: string,
  ) {
    return this.adminService.adjustTeamScore(id, points, reason);
  }

  @Post('teams/:id/disqualify')
  disqualifyTeam(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.disqualifyTeam(id, reason);
  }

  @Post('teams/:id/qualify')
  qualifyTeam(@Param('id') id: string) {
    return this.adminService.qualifyTeam(id);
  }

  @Post('teams/qualify-top')
  qualifyTopTeams(@Body('count') count: number) {
    return this.adminService.qualifyTopTeams(count);
  }

  @Post('scoreboard/freeze')
  freezeScoreboard(@Body('freeze') freeze: boolean) {
    return this.adminService.freezeScoreboard(freeze);
  }

  @Get('export')
  exportResults() {
    return this.adminService.exportResults();
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="ctf-results.csv"')
  exportResultsCSV() {
    return this.adminService.exportResultsCSV();
  }
}

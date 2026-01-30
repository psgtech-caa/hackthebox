import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TeamsService } from './teams.service';
import { CreateTeamDto, JoinTeamDto } from './dto/team.dto';

@Controller('teams')
@UseGuards(AuthGuard('jwt'))
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  createTeam(@Body() dto: CreateTeamDto, @Request() req) {
    return this.teamsService.createTeam(dto, req.user.id);
  }

  @Post('join')
  joinTeam(@Body() dto: JoinTeamDto, @Request() req) {
    return this.teamsService.joinTeam(dto.teamId, req.user.id);
  }

  @Get()
  getAllTeams() {
    return this.teamsService.getAllTeams();
  }

  @Get(':id')
  getTeam(@Param('id') id: string) {
    return this.teamsService.getTeam(id);
  }
}

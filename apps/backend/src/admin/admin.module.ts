import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuditModule } from '../audit/audit.module';
import { SubmissionsModule } from '../submissions/submissions.module';

@Module({
  imports: [AuditModule, SubmissionsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminIssuesController } from './admin-issues.controller';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';

@Module({
  controllers: [IssuesController, AdminIssuesController],
  providers: [IssuesService, JwtAuthGuard, RolesGuard],
})
export class IssuesModule {}

import { Controller, Get, Param } from '@nestjs/common';
import { IssuesService } from './issues.service';

@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get()
  listIssues() {
    return this.issuesService.listPublicIssues();
  }

  @Get(':id')
  getIssue(@Param('id') id: string) {
    return this.issuesService.getPublicIssue(id);
  }
}

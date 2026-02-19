import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/auth-user.type';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import type { IssueUploadFile } from './issues.service';
import { IssuesService } from './issues.service';

const issueUploadInterceptor = FileFieldsInterceptor(
  [
    { name: 'pdf', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ],
  {
    limits: {
      files: 2,
      fileSize: 30 * 1024 * 1024,
    },
  },
);

@Controller('admin/issues')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminIssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @UseInterceptors(issueUploadInterceptor)
  createIssue(
    @Body() dto: CreateIssueDto,
    @UploadedFiles()
    files: {
      pdf?: IssueUploadFile[];
      cover?: IssueUploadFile[];
    },
    @CurrentUser() user: AuthUser,
  ) {
    return this.issuesService.createIssue(dto, files, user.sub);
  }

  @Put(':id')
  @UseInterceptors(issueUploadInterceptor)
  updateIssue(
    @Param('id') id: string,
    @Body() dto: UpdateIssueDto,
    @UploadedFiles()
    files: {
      pdf?: IssueUploadFile[];
      cover?: IssueUploadFile[];
    },
  ) {
    return this.issuesService.updateIssue(id, dto, files);
  }

  @Delete(':id')
  deleteIssue(@Param('id') id: string) {
    return this.issuesService.deleteIssue(id);
  }
}

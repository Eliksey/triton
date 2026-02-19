import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssueView, toIssueView } from './issue.mapper';

export type IssueUploadFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

type UploadFiles = {
  pdf?: IssueUploadFile[];
  cover?: IssueUploadFile[];
};

@Injectable()
export class IssuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async listPublicIssues(): Promise<IssueView[]> {
    const issues = await this.prisma.issue.findMany({
      orderBy: [{ releaseDate: 'desc' }, { createdAt: 'desc' }],
    });
    return issues.map((issue) => toIssueView(issue, this.storageService));
  }

  async getPublicIssue(id: string): Promise<IssueView> {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
    });
    if (!issue) {
      throw new NotFoundException('Issue not found');
    }
    return toIssueView(issue, this.storageService);
  }

  async createIssue(
    dto: CreateIssueDto,
    files: UploadFiles,
    authorId: string,
  ): Promise<IssueView> {
    const pdfFile = files.pdf?.[0];
    if (!pdfFile) {
      throw new BadRequestException('PDF file is required');
    }
    this.assertPdfFile(pdfFile);

    const issueId = randomUUID();
    const uploadedKeys: string[] = [];
    const pdfKey = this.buildObjectKey(issueId, 'pdf', pdfFile.originalname);
    const coverFile = files.cover?.[0];
    const coverKey = coverFile
      ? this.buildObjectKey(issueId, 'cover', coverFile.originalname)
      : null;

    await this.storageService.uploadObject({
      key: pdfKey,
      body: pdfFile.buffer,
      contentType: pdfFile.mimetype,
    });
    uploadedKeys.push(pdfKey);

    if (coverFile && coverKey) {
      await this.storageService.uploadObject({
        key: coverKey,
        body: coverFile.buffer,
        contentType: coverFile.mimetype,
      });
      uploadedKeys.push(coverKey);
    }

    try {
      const issue = await this.prisma.issue.create({
        data: {
          id: issueId,
          title: dto.title.trim(),
          description: this.normalizeDescription(dto.description),
          releaseDate: this.parseReleaseMonth(dto.releaseMonth),
          pdfKey,
          coverKey,
          createdById: authorId,
        },
      });
      return toIssueView(issue, this.storageService);
    } catch (error) {
      await Promise.all(
        uploadedKeys.map((key) => this.storageService.deleteObject(key)),
      );
      throw error;
    }
  }

  async updateIssue(
    id: string,
    dto: UpdateIssueDto,
    files: UploadFiles,
  ): Promise<IssueView> {
    const current = await this.prisma.issue.findUnique({
      where: { id },
    });
    if (!current) {
      throw new NotFoundException('Issue not found');
    }

    const uploadedKeys: string[] = [];
    const keysToDeleteAfterUpdate: string[] = [];
    const updateData: Prisma.IssueUpdateInput = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      updateData.description = this.normalizeDescription(dto.description);
    }
    if (dto.releaseMonth !== undefined) {
      updateData.releaseDate = this.parseReleaseMonth(dto.releaseMonth);
    }
    const shouldRemoveCover = dto.removeCover === true;

    const pdfFile = files.pdf?.[0];
    if (pdfFile) {
      this.assertPdfFile(pdfFile);
      const newPdfKey = this.buildObjectKey(id, 'pdf', pdfFile.originalname);
      await this.storageService.uploadObject({
        key: newPdfKey,
        body: pdfFile.buffer,
        contentType: pdfFile.mimetype,
      });
      uploadedKeys.push(newPdfKey);
      updateData.pdfKey = newPdfKey;
      keysToDeleteAfterUpdate.push(current.pdfKey);
    }

    const coverFile = files.cover?.[0];
    if (coverFile) {
      const newCoverKey = this.buildObjectKey(
        id,
        'cover',
        coverFile.originalname,
      );
      await this.storageService.uploadObject({
        key: newCoverKey,
        body: coverFile.buffer,
        contentType: coverFile.mimetype,
      });
      uploadedKeys.push(newCoverKey);
      updateData.coverKey = newCoverKey;
      if (current.coverKey) {
        keysToDeleteAfterUpdate.push(current.coverKey);
      }
    } else if (shouldRemoveCover && current.coverKey) {
      updateData.coverKey = null;
      keysToDeleteAfterUpdate.push(current.coverKey);
    }

    try {
      const issue = await this.prisma.issue.update({
        where: { id },
        data: updateData,
      });
      await Promise.all(
        keysToDeleteAfterUpdate.map((key) =>
          this.storageService.deleteObject(key),
        ),
      );
      return toIssueView(issue, this.storageService);
    } catch (error) {
      await Promise.all(
        uploadedKeys.map((key) => this.storageService.deleteObject(key)),
      );
      throw error;
    }
  }

  async deleteIssue(id: string): Promise<{ deleted: true; id: string }> {
    const current = await this.prisma.issue.findUnique({
      where: { id },
    });
    if (!current) {
      throw new NotFoundException('Issue not found');
    }

    await this.prisma.issue.delete({ where: { id } });
    await Promise.all([
      this.storageService.deleteObject(current.pdfKey),
      current.coverKey
        ? this.storageService.deleteObject(current.coverKey)
        : undefined,
    ]);

    return { deleted: true, id };
  }

  private parseReleaseMonth(releaseMonth: string): Date {
    const [yearString, monthString] = releaseMonth.split('-');
    const year = Number(yearString);
    const month = Number(monthString);
    return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  }

  private normalizeDescription(value?: string): string | null {
    if (value === undefined) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  private buildObjectKey(
    issueId: string,
    prefix: 'pdf' | 'cover',
    originalName: string,
  ): string {
    const ext =
      extname(originalName).toLowerCase() ||
      (prefix === 'pdf' ? '.pdf' : '.jpg');
    return `issues/${issueId}/${prefix}-${Date.now()}-${randomUUID()}${ext}`;
  }

  private assertPdfFile(file: IssueUploadFile) {
    const isPdfByMime = file.mimetype.toLowerCase().includes('pdf');
    const isPdfByName = file.originalname.toLowerCase().endsWith('.pdf');
    if (!isPdfByMime && !isPdfByName) {
      throw new BadRequestException(
        'Only PDF files are allowed for issue content',
      );
    }
  }
}

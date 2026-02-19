import { Issue } from '@prisma/client';
import { StorageService } from '../storage/storage.service';

export type IssueView = {
  id: string;
  title: string;
  releaseMonth: string;
  description: string | null;
  pdfUrl: string;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export const toIssueView = (
  issue: Issue,
  storageService: StorageService,
): IssueView => ({
  id: issue.id,
  title: issue.title,
  releaseMonth: issue.releaseDate.toISOString().slice(0, 7),
  description: issue.description,
  pdfUrl: storageService.getObjectPublicUrl(issue.pdfKey),
  coverUrl: issue.coverKey
    ? storageService.getObjectPublicUrl(issue.coverKey)
    : null,
  createdAt: issue.createdAt.toISOString(),
  updatedAt: issue.updatedAt.toISOString(),
});

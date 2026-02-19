import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { IssuesService } from './issues.service';

describe('IssuesService', () => {
  const prismaMock = {
    issue: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const storageMock = {
    uploadObject: jest.fn(),
    deleteObject: jest.fn(),
    getObjectPublicUrl: jest.fn((key: string) => `http://files/${key}`),
  };

  let service: IssuesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        IssuesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile();
    service = moduleRef.get(IssuesService);
  });

  it('maps public issues with media URLs', async () => {
    prismaMock.issue.findMany.mockResolvedValue([
      {
        id: 'issue_1',
        title: 'Release',
        releaseDate: new Date('2026-01-01T00:00:00.000Z'),
        description: null,
        pdfKey: 'pdf-key',
        coverKey: 'cover-key',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      },
    ]);

    const result = await service.listPublicIssues();

    expect(result).toHaveLength(1);
    expect(result[0]?.releaseMonth).toBe('2026-01');
    expect(result[0]?.pdfUrl).toContain('pdf-key');
    expect(result[0]?.coverUrl).toContain('cover-key');
  });

  it('creates issue with required PDF file', async () => {
    const dto = {
      title: 'Issue title',
      releaseMonth: '2026-02',
      description: 'Desc',
    };
    prismaMock.issue.create.mockResolvedValue({
      id: 'issue_2',
      title: dto.title,
      releaseDate: new Date('2026-02-01T00:00:00.000Z'),
      description: dto.description,
      pdfKey: 'issues/issue_2/pdf.pdf',
      coverKey: null,
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
      updatedAt: new Date('2026-02-01T00:00:00.000Z'),
    });

    const result = await service.createIssue(
      dto,
      {
        pdf: [
          {
            originalname: 'issue.pdf',
            mimetype: 'application/pdf',
            buffer: Buffer.from('pdf'),
          },
        ],
      },
      'user_1',
    );

    expect(prismaMock.issue.create).toHaveBeenCalled();
    expect(storageMock.uploadObject).toHaveBeenCalled();
    expect(result.title).toBe(dto.title);
  });
});

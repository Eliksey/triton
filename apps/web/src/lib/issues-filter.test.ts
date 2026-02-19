import { describe, expect, it } from 'vitest';
import { filterIssues } from './issues-filter';

const issues = [
  {
    id: '1',
    title: 'Точка',
    releaseMonth: 'Jun 2025',
    description: 'Issue about change',
    pdfUrl: 'pdf-1',
    coverUrl: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '2',
    title: 'Path',
    releaseMonth: '2021-10',
    description: 'First issue',
    pdfUrl: 'pdf-2',
    coverUrl: null,
    createdAt: '',
    updatedAt: '',
  },
];

describe('filterIssues', () => {
  it('returns all issues for empty query', () => {
    expect(filterIssues(issues, '')).toHaveLength(2);
  });

  it('filters by title and description', () => {
    expect(filterIssues(issues, 'точка')).toHaveLength(1);
    expect(filterIssues(issues, 'first')).toHaveLength(1);
  });

  it('filters by release month', () => {
    expect(filterIssues(issues, '2021-10')).toHaveLength(1);
    expect(filterIssues(issues, 'jun')).toHaveLength(1);
  });
});

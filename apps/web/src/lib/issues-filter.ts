import type { Issue } from './types';

export function filterIssues(issues: Issue[], query: string): Issue[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized.length) {
    return issues;
  }

  return issues.filter((issue) => {
    return (
      issue.title.toLowerCase().includes(normalized) ||
      issue.releaseMonth.toLowerCase().includes(normalized) ||
      (issue.description || '').toLowerCase().includes(normalized)
    );
  });
}

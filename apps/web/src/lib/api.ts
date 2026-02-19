import type { Issue } from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') ||
  'http://localhost:4000/api';

async function request<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.token) {
    headers.set('Authorization', `Bearer ${init.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await safeErrorMessage(response);
    throw new Error(message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function safeErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(', ');
    return body.message;
  } catch {
    return undefined;
  }
}

export async function fetchIssues(): Promise<Issue[]> {
  return request<Issue[]>('/issues');
}

export async function fetchIssue(id: string): Promise<Issue> {
  return request<Issue>(`/issues/${id}`);
}

export async function login(payload: {
  username: string;
  password: string;
}): Promise<{ accessToken: string }> {
  return request<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function me(token: string): Promise<{ user: { role: string } }> {
  return request<{ user: { role: string } }>('/auth/me', {
    token,
  });
}

export async function createIssue(
  token: string,
  payload: {
    title: string;
    releaseMonth: string;
    description?: string;
    pdf: File;
    cover?: File | null;
  },
): Promise<Issue> {
  const formData = new FormData();
  formData.set('title', payload.title);
  formData.set('releaseMonth', payload.releaseMonth);
  if (payload.description) formData.set('description', payload.description);
  formData.set('pdf', payload.pdf);
  if (payload.cover) formData.set('cover', payload.cover);

  return request<Issue>('/admin/issues', {
    method: 'POST',
    body: formData,
    token,
  });
}

export async function updateIssue(
  token: string,
  issueId: string,
  payload: {
    title?: string;
    releaseMonth?: string;
    description?: string;
    pdf?: File | null;
    cover?: File | null;
    removeCover?: boolean;
  },
): Promise<Issue> {
  const formData = new FormData();
  if (payload.title !== undefined) formData.set('title', payload.title);
  if (payload.releaseMonth !== undefined) {
    formData.set('releaseMonth', payload.releaseMonth);
  }
  if (payload.description !== undefined) {
    formData.set('description', payload.description);
  }
  if (payload.pdf) formData.set('pdf', payload.pdf);
  if (payload.cover) formData.set('cover', payload.cover);
  if (payload.removeCover) formData.set('removeCover', 'true');

  return request<Issue>(`/admin/issues/${issueId}`, {
    method: 'PUT',
    body: formData,
    token,
  });
}

export async function deleteIssue(
  token: string,
  issueId: string,
): Promise<{ deleted: true; id: string }> {
  return request<{ deleted: true; id: string }>(`/admin/issues/${issueId}`, {
    method: 'DELETE',
    token,
  });
}

